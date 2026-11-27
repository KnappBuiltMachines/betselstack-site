// app/api/team/route.js
//
// Added users (multi-user licensing). Only a user with their OWN active
// subscription (the "owner") can use this route.
//
//   GET     -> the owner's list of added users + pricing info
//   POST    { email }                  -> add a user (charges a prorated amount today)
//   POST    { email, action: "resend" } -> re-send the invite email
//   DELETE  { email }                  -> remove a user (no refund or credit)
//
// Billing: the owner's Stripe subscription carries an "Additional user" line
// (STRIPE_PRICE_SEAT_MONTHLY or STRIPE_PRICE_SEAT_ANNUAL, matching the plan).
// Its quantity is always set to the number of rows in team_members for that
// owner, so the two can never drift apart for long.
//
//   Adding:   proration_behavior "always_invoice" -> the prorated cost for the
//             rest of the current month/year is charged right away. If the card
//             is declined ("error_if_incomplete"), nothing changes and the user
//             is not added.
//   Removing: proration_behavior "none" -> no refund or credit; the lower
//             amount applies from the next renewal. (Annual is non-refundable.)

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveSubscription } from "@/lib/subscription";
import {
  SEAT_PRICES,
  SEAT_LABELS,
  MAX_ADDED_USERS,
  normalizeEmail,
  splitItems,
  planOfSubscription,
} from "@/lib/team";
import { sendTeamInviteEmail, sendInternalAlert } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Signed-in user + their own active subscription, or an error response. */
async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: fail("Not authenticated.", 401) };

  const sub = await getActiveSubscription(supabase, user.id);
  if (!sub) {
    return {
      error: fail("Adding users needs an active subscription on your account.", 403),
    };
  }
  return { user, sub };
}

async function listRows(admin, ownerId) {
  const { data, error } = await admin
    .from("team_members")
    .select("id, email, created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new Error(`team_members list failed: ${error.message}`);
  return data || [];
}

/** Rows + whether each person has created their account yet. */
async function listForDisplay(admin, ownerId) {
  const rows = await listRows(admin, ownerId);
  let joined = new Set();
  if (rows.length) {
    const { data } = await admin
      .from("profiles")
      .select("email")
      .in("email", rows.map((r) => r.email));
    joined = new Set((data || []).map((p) => (p.email || "").toLowerCase()));
  }
  return rows.map((r) => ({
    email: r.email,
    addedAt: r.created_at,
    joined: joined.has(r.email),
  }));
}

/**
 * Sets the "Additional user" quantity on the owner's Stripe subscription to
 * `count`, adding or removing the line as needed. Throws on Stripe errors.
 */
async function setSeatQuantity(subscriptionId, count, { charging }) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const plan = planOfSubscription(sub);
  const seatPrice = SEAT_PRICES[plan];
  if (!seatPrice) throw new Error(`STRIPE_PRICE_SEAT_${plan.toUpperCase()} is not set`);

  const { seatItem } = splitItems(sub);
  const opts = charging
    ? { proration_behavior: "always_invoice", payment_behavior: "error_if_incomplete" }
    : { proration_behavior: "none" };

  if (count < 1) {
    if (seatItem) await stripe.subscriptionItems.del(seatItem.id, { proration_behavior: "none" });
  } else if (seatItem) {
    if (seatItem.quantity !== count) {
      await stripe.subscriptionItems.update(seatItem.id, { quantity: count, ...opts });
    }
  } else {
    await stripe.subscriptionItems.create({
      subscription: sub.id,
      price: seatPrice,
      quantity: count,
      ...opts,
    });
  }
}

/** Mirror the paid count locally right away (the webhook also writes it). */
async function saveExtraSeats(admin, subscriptionId, count) {
  const { error } = await admin
    .from("subscriptions")
    .update({ extra_seats: count, updated_at: new Date().toISOString() })
    .eq("id", subscriptionId);
  if (error) console.error("[team] extra_seats update failed", error.message);
}

async function ownerName(admin, ownerId) {
  const { data } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", ownerId)
    .maybeSingle();
  return data?.full_name || null;
}

/* ------------------------------------------------------------------ */

export async function GET() {
  const { user, sub, error } = await requireOwner();
  if (error) return error;

  try {
    const admin = createAdminClient();
    const users = await listForDisplay(admin, user.id);
    const plan = sub.plan === "annual" ? "annual" : "monthly";
    return NextResponse.json({
      users,
      plan,
      pricePerUser: SEAT_LABELS[plan],
      max: MAX_ADDED_USERS,
    });
  } catch (err) {
    console.error("[team] GET", err);
    return fail("Could not load your users.", 500);
  }
}

export async function POST(req) {
  const { user, sub, error } = await requireOwner();
  if (error) return error;

  let body = {};
  try {
    body = await req.json();
  } catch {
    // fall through to validation
  }

  const email = normalizeEmail(body?.email);
  if (!email) return fail("Enter a valid email address.");

  const admin = createAdminClient();
  const name = await ownerName(admin, user.id);

  /* ---- Re-send invite ---- */
  if (body?.action === "resend") {
    const { data: row } = await admin
      .from("team_members")
      .select("id")
      .eq("owner_id", user.id)
      .eq("email", email)
      .maybeSingle();
    if (!row) return fail("That email isn't on your list.", 404);
    await sendTeamInviteEmail({ to: email, ownerName: name, ownerEmail: user.email });
    return NextResponse.json({ ok: true, resent: true });
  }

  /* ---- Add a user ---- */
  if (sub.status === "past_due") {
    return fail("Your last payment didn't go through. Update your card under Manage billing first.", 402);
  }
  if (email === (user.email || "").toLowerCase()) {
    return fail("That's your own email. Your account is already included.");
  }

  const plan = sub.plan === "annual" ? "annual" : "monthly";
  if (!SEAT_PRICES[plan]) {
    return fail("Adding users isn't switched on yet. Please contact us.", 503);
  }

  let rows;
  try {
    rows = await listRows(admin, user.id);
  } catch (err) {
    console.error("[team] list", err);
    return fail("Could not load your users.", 500);
  }
  if (rows.length >= MAX_ADDED_USERS) {
    return fail(`You can add up to ${MAX_ADDED_USERS} users. Contact us if you need more.`);
  }

  // Don't bill twice for someone who already pays for their own subscription.
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingProfile) {
    const theirSub = await getActiveSubscription(admin, existingProfile.id);
    if (theirSub) {
      return fail(
        "That person already has their own Betsel Stack subscription. They'd need to cancel it before you add them.",
        409
      );
    }
  }

  // 1) Reserve the email. The unique index stops it being on two lists.
  const { data: inserted, error: insertError } = await admin
    .from("team_members")
    .insert({ owner_id: user.id, email })
    .select("id")
    .single();
  if (insertError) {
    if (insertError.code === "23505") {
      const mine = rows.some((r) => r.email === email);
      return fail(
        mine ? "That user is already on your list." : "That email is already added to another Betsel Stack account.",
        409
      );
    }
    console.error("[team] insert", insertError);
    return fail("Could not add that user.", 500);
  }

  // 2) Charge for it. If Stripe says no, undo step 1.
  const newCount = rows.length + 1;
  try {
    await setSeatQuantity(sub.id, newCount, { charging: true });
  } catch (err) {
    await admin.from("team_members").delete().eq("id", inserted.id);
    const msg = err?.raw?.message || err?.message || "Payment failed.";
    console.error("[team] stripe add failed", msg);
    return fail(`The charge for this user didn't go through: ${msg}`, 402);
  }

  await saveExtraSeats(admin, sub.id, newCount);

  // 3) Tell them. Best effort: the add has already succeeded.
  await sendTeamInviteEmail({ to: email, ownerName: name, ownerEmail: user.email });
  await sendInternalAlert({
    subject: `Betsel Stack user added: ${email}`,
    lines: [
      `<strong>${user.email}</strong> added <strong>${email}</strong>.`,
      `Plan: ${plan}. Added users now: ${newCount}.`,
    ],
  });

  const users = await listForDisplay(admin, user.id).catch(() => []);
  return NextResponse.json({ ok: true, users });
}

export async function DELETE(req) {
  const { user, sub, error } = await requireOwner();
  if (error) return error;

  let body = {};
  try {
    body = await req.json();
  } catch {
    // fall through
  }
  const email = normalizeEmail(body?.email);
  if (!email) return fail("Enter a valid email address.");

  const admin = createAdminClient();

  // 1) Remove access right away.
  const { data: removed, error: delError } = await admin
    .from("team_members")
    .delete()
    .eq("owner_id", user.id)
    .eq("email", email)
    .select("id");
  if (delError) {
    console.error("[team] delete", delError);
    return fail("Could not remove that user.", 500);
  }
  if (!removed?.length) return fail("That email isn't on your list.", 404);

  // 2) Lower the bill from the next renewal (no refund or credit).
  let rows = [];
  try {
    rows = await listRows(admin, user.id);
    await setSeatQuantity(sub.id, rows.length, { charging: false });
    await saveExtraSeats(admin, sub.id, rows.length);
  } catch (err) {
    console.error("[team] stripe remove failed", err?.message || err);
    await sendInternalAlert({
      subject: `Betsel Stack: seat count NOT lowered for ${user.email}`,
      lines: [
        `${user.email} removed ${email}, but updating Stripe failed.`,
        `Set the Additional user quantity on subscription ${sub.id} to ${rows.length} by hand.`,
      ],
    });
    return NextResponse.json({
      ok: true,
      warning:
        "The user was removed, but your bill didn't update. We've been notified and will fix it.",
      users: await listForDisplay(admin, user.id).catch(() => []),
    });
  }

  const users = await listForDisplay(admin, user.id).catch(() => []);
  return NextResponse.json({ ok: true, users });
}
