
Route · JS
// app/api/webhooks/stripe/route.js
//
// Stripe webhook: subscription state sync (original) + lifecycle email (new).
//
// Order matters here. Subscription sync runs first and is allowed to return 500
// so Stripe retries it. Email sending happens after, gated by an idempotency
// claim, so a retry re-runs the sync without resending the email.
 
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendWelcomeEmail,
  sendTrialEndingEmail,
  sendInternalSignupAlert,
} from "@/lib/email";
 
export const runtime = "nodejs";
 
/* ------------------------------------------------------------------ */
/* Subscription state sync — unchanged from the original handler       */
/* ------------------------------------------------------------------ */
 
async function upsertSubscription(sub) {
  const admin = createAdminClient();
 
  let userId = sub.metadata?.userId;
  if (!userId) {
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();
    userId = data?.id;
  }
  if (!userId) {
    console.error("Webhook: could not resolve userId for subscription", sub.id);
    return;
  }
 
  const priceId = sub.items?.data?.[0]?.price?.id ?? null;
  const item = sub.items?.data?.[0];
  const periodEnd = item?.current_period_end ?? sub.current_period_end ?? null;
 
  await admin.from("subscriptions").upsert(
    {
      id: sub.id,
      user_id: userId,
      status: sub.status,
      price_id: priceId,
      plan: sub.metadata?.plan ?? null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
}
 
/* ------------------------------------------------------------------ */
/* Email helpers                                                       */
/* ------------------------------------------------------------------ */
 
/**
 * Returns true the first time an event id is claimed, false on replays.
 * Relies on the unique constraint on webhook_events.event_id.
 * Only gates email — never the subscription sync above.
 */
async function claimEmailForEvent(eventId, eventType) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("webhook_events")
    .insert({ event_id: eventId, event_type: eventType });
 
  if (error) {
    if (error.code === "23505") return false; // unique_violation: already sent
    console.error("Webhook: idempotency insert failed", error);
    return false; // fail closed on email: a missed email beats a duplicate
  }
  return true;
}
 
/** Resolve a recipient email and first name from the Stripe customer. */
async function resolveRecipient(customerRef) {
  const customerId = typeof customerRef === "string" ? customerRef : customerRef?.id;
  if (!customerId) return { email: null, firstName: null };
 
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return { email: null, firstName: null };
    const full = (customer.name || "").trim();
    return {
      email: customer.email || null,
      firstName: full ? full.split(/\s+/)[0] : null,
    };
  } catch (err) {
    console.error("Webhook: could not retrieve customer", customerId, err.message);
    return { email: null, firstName: null };
  }
}
 
/**
 * Fire lifecycle email. Never throws — email problems must not trigger a
 * Stripe retry, which would replay the subscription sync unnecessarily.
 */
async function handleLifecycleEmail(event) {
  try {
    if (event.type === "customer.subscription.created") {
      const sub = event.data.object;
      if (sub.status !== "trialing") return;
 
      if (!(await claimEmailForEvent(event.id, event.type))) return;
 
      const { email, firstName } = await resolveRecipient(sub.customer);
      if (!email) {
        console.error("Webhook: no email on customer for welcome", sub.id);
        return;
      }
 
      await sendWelcomeEmail({ to: email, firstName, trialEnd: sub.trial_end });
      await sendInternalSignupAlert({
        customerEmail: email,
        plan: sub.metadata?.plan ?? sub.items?.data?.[0]?.price?.id,
        trialEnd: sub.trial_end,
      });
      return;
    }
 
    if (event.type === "customer.subscription.trial_will_end") {
      const sub = event.data.object;
 
      if (!(await claimEmailForEvent(event.id, event.type))) return;
 
      const { email, firstName } = await resolveRecipient(sub.customer);
      if (!email) return;
 
      await sendTrialEndingEmail({ to: email, firstName, trialEnd: sub.trial_end });
    }
  } catch (err) {
    console.error("Webhook: lifecycle email error on", event.type, err);
  }
}
 
/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */
 
export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
 
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "invalid";
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }
 
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          if (!sub.metadata?.userId && session.client_reference_id) {
            await stripe.subscriptions.update(sub.id, {
              metadata: { ...sub.metadata, userId: session.client_reference_id },
            });
            sub.metadata = { ...sub.metadata, userId: session.client_reference_id };
          }
          await upsertSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.trial_will_end": {
        await upsertSubscription(event.data.object);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subId = invoice.subscription ?? null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(sub);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
 
  // Sync succeeded. Email is best-effort and idempotent.
  await handleLifecycleEmail(event);
 
  return NextResponse.json({ received: true });
}
 
