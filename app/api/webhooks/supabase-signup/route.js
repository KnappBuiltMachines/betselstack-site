// app/api/webhooks/supabase-signup/route.js
//
// Receives a Supabase Database Webhook fired on INSERT into public.profiles
// and sends the welcome email. This is the real "someone signed up" moment,
// because the Betsel Stack trial is a no-card trial tracked in profiles.
//
// Environment variables:
//   SUPABASE_WEBHOOK_SECRET   any long random string; also set as a header
//                             on the webhook in the Supabase dashboard
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO, INTERNAL_ALERT_EMAIL

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TRIAL_DAYS } from "@/lib/subscription";
import { sendWelcomeEmail, sendInternalAlert, firstNameOf } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

/** True the first time this key is claimed. Reuses the webhook_events table. */
async function claimOnce(key, type) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("webhook_events")
    .insert({ event_id: key, event_type: type });

  if (error) {
    if (error.code === "23505") return false; // already sent
    console.error("[supabase-signup] idempotency insert failed", error);
    return false; // fail closed: a missed email beats a duplicate
  }
  return true;
}

export async function POST(req) {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[supabase-signup] SUPABASE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  if (req.headers.get("x-webhook-secret") !== secret) {
    console.error("[supabase-signup] rejected: bad or missing secret header");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload?.type !== "INSERT" || payload?.table !== "profiles") {
    console.log("[supabase-signup] ignoring", payload?.type, payload?.table);
    return NextResponse.json({ received: true, ignored: true });
  }

  const profile = payload.record || {};
  const { id, email, full_name: fullName, created_at: createdAt } = profile;

  if (!email) {
    console.error("[supabase-signup] profile has no email", id);
    return NextResponse.json({ received: true, skipped: "no_email" });
  }

  if (!(await claimOnce(`welcome:${id}`, "profile_welcome"))) {
    console.log("[supabase-signup] welcome already sent for", id);
    return NextResponse.json({ received: true, duplicate: true });
  }

  const start = createdAt ? new Date(createdAt).getTime() : Date.now();
  const trialEndsAt = new Date(start + TRIAL_DAYS * DAY_MS).toISOString();

  try {
    await sendWelcomeEmail({
      to: email,
      firstName: firstNameOf(fullName),
      trialEndsAt,
    });

    await sendInternalAlert({
      subject: `New Betsel Stack signup: ${email}`,
      lines: [
        `<strong>${email}</strong> created an account.`,
        `Name: ${fullName || "(not given)"}`,
        `Trial ends: ${new Date(trialEndsAt).toLocaleDateString("en-US", { timeZone: "America/New_York" })}`,
      ],
    });
  } catch (err) {
    console.error("[supabase-signup] send failed", err);
  }

  return NextResponse.json({ received: true });
}
