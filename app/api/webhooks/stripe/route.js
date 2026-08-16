// app/api/webhooks/stripe/route.js
//
// Stripe webhook handler for Betsel Stack lifecycle email.
//
// IMPORTANT: if this file already exists in your repo, do NOT replace it.
// Merge the event cases below into your existing switch statement instead.
//
// Environment variables required:
//   STRIPE_SECRET_KEY            (you already have this)
//   STRIPE_WEBHOOK_SECRET        whsec_xxxx — from the Stripe webhook endpoint page
//   NEXT_PUBLIC_SUPABASE_URL     (you already have this)
//   SUPABASE_SERVICE_ROLE_KEY    (you already have this)
//   RESEND_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
  sendWelcomeEmail,
  sendTrialEndingEmail,
  sendInternalSignupAlert,
} from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

/**
 * Returns true the first time an event id is seen, false on replays.
 * Relies on the unique index on webhook_events.event_id.
 */
async function claimEvent(eventId, eventType) {
  const { error } = await supabase
    .from('webhook_events')
    .insert({ event_id: eventId, event_type: eventType });

  if (error) {
    // 23505 = unique_violation → we've already handled this event
    if (error.code === '23505') return false;
    console.error('[stripe-webhook] idempotency insert failed', error);
    // Fail open: better a duplicate email than a silently dropped one
    return true;
  }
  return true;
}

/** Pull a usable email + first name off the Stripe customer. */
async function resolveRecipient(customerId, fallbackEmail) {
  let email = fallbackEmail || null;
  let firstName = null;

  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer.deleted) {
        email = customer.email || email;
        const full = (customer.name || '').trim();
        if (full) firstName = full.split(/\s+/)[0];
      }
    } catch (err) {
      console.error('[stripe-webhook] could not retrieve customer', customerId, err.message);
    }
  }

  return { email, firstName };
}

export async function POST(req) {
  const signature = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err.message);
    return new Response(`Webhook signature verification failed: ${err.message}`, {
      status: 400,
    });
  }

  const isFirstTime = await claimEvent(event.id, event.type);
  if (!isFirstTime) {
    console.log('[stripe-webhook] duplicate event ignored', event.id);
    return Response.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      /* ---------- Someone signed up and the trial started ---------- */
      case 'customer.subscription.created': {
        const sub = event.data.object;
        if (sub.status !== 'trialing') break;

        const { email, firstName } = await resolveRecipient(sub.customer);
        if (!email) {
          console.error('[stripe-webhook] no email on customer', sub.customer);
          break;
        }

        await sendWelcomeEmail({ to: email, firstName, trialEnd: sub.trial_end });

        await sendInternalSignupAlert({
          customerEmail: email,
          plan: sub.items?.data?.[0]?.price?.nickname
            || sub.items?.data?.[0]?.price?.id,
          trialEnd: sub.trial_end,
        });
        break;
      }

      /* ---------- Three days before the trial converts ---------- */
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object;
        const { email, firstName } = await resolveRecipient(sub.customer);
        if (!email) break;

        await sendTrialEndingEmail({ to: email, firstName, trialEnd: sub.trial_end });
        break;
      }

      default:
        console.log('[stripe-webhook] unhandled event type', event.type);
    }
  } catch (err) {
    // Log loudly but return 200 — a 500 makes Stripe retry for three days
    // and you'd send the same email up to 20 times.
    console.error('[stripe-webhook] handler error on', event.type, err);
  }

  return Response.json({ received: true });
}
