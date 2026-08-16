// app/api/cron/trial-reminders/route.js
//
// Runs once a day (see vercel.json). Finds no-card trials that are close to
// expiring, skips anyone who already subscribed, sends one reminder each, and
// stamps profiles.trial_reminder_sent_at so it can never repeat.
//
// Replaces Stripe's customer.subscription.trial_will_end, which never fires
// here because the trial is tracked in profiles, not in Stripe.
//
// Environment variables:
//   CRON_SECRET  — set this in Vercel; Vercel then sends it as a Bearer token
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TRIAL_DAYS } from "@/lib/subscription";
import { sendTrialEndingEmail, firstNameOf } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

// Send when this many days remain. 3 days left = day 4 of a 7-day trial.
const REMIND_WHEN_DAYS_LEFT = 3;

const ACTIVE_STATUSES = ["active", "trialing"];

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();

  // Trial ends at created_at + TRIAL_DAYS. We want profiles whose remaining
  // time has dropped to REMIND_WHEN_DAYS_LEFT or less but hasn't run out.
  // Widening the lower bound to 0 days left means a missed cron run still
  // catches people on the following day rather than skipping them silently.
  const oldestCreatedAt = new Date(now - TRIAL_DAYS * DAY_MS).toISOString();
  const newestCreatedAt = new Date(
    now - (TRIAL_DAYS - REMIND_WHEN_DAYS_LEFT) * DAY_MS
  ).toISOString();

  const { data: candidates, error: profileError } = await admin
    .from("profiles")
    .select("id, email, full_name, created_at")
    .is("trial_reminder_sent_at", null)
    .gte("created_at", oldestCreatedAt)
    .lte("created_at", newestCreatedAt);

  if (profileError) {
    console.error("[trial-cron] profile query failed", profileError);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  if (!candidates?.length) {
    console.log("[trial-cron] no trials in the reminder window");
    return NextResponse.json({ checked: 0, sent: 0 });
  }

  // Exclude anyone who already has an active or trialing subscription.
  const ids = candidates.map((p) => p.id);
  const { data: subs, error: subError } = await admin
    .from("subscriptions")
    .select("user_id, status")
    .in("user_id", ids);

  if (subError) {
    console.error("[trial-cron] subscription query failed", subError);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  const subscribed = new Set(
    (subs || [])
      .filter((s) => ACTIVE_STATUSES.includes(s.status))
      .map((s) => s.user_id)
  );

  let sent = 0;
  let skipped = 0;

  for (const profile of candidates) {
    if (subscribed.has(profile.id)) {
      skipped += 1;
      continue;
    }
    if (!profile.email) {
      skipped += 1;
      continue;
    }

    const endMs = new Date(profile.created_at).getTime() + TRIAL_DAYS * DAY_MS;
    const daysLeft = Math.max(1, Math.ceil((endMs - now) / DAY_MS));

    // Stamp first. If the send fails we'd rather miss one than risk a loop
    // that mails the same person on every subsequent run.
    const { error: stampError } = await admin
      .from("profiles")
      .update({ trial_reminder_sent_at: new Date().toISOString() })
      .eq("id", profile.id)
      .is("trial_reminder_sent_at", null);

    if (stampError) {
      console.error("[trial-cron] could not stamp", profile.id, stampError);
      skipped += 1;
      continue;
    }

    const result = await sendTrialEndingEmail({
      to: profile.email,
      firstName: firstNameOf(profile.full_name),
      trialEndsAt: new Date(endMs).toISOString(),
      daysLeft,
    });

    if (result.ok) sent += 1;
    else console.error("[trial-cron] send failed for", profile.email, result.error);
  }

  console.log(`[trial-cron] checked ${candidates.length}, sent ${sent}, skipped ${skipped}`);
  return NextResponse.json({ checked: candidates.length, sent, skipped });
}
