// lib/team.js
// Shared helpers for added users (multi-user licensing).
//
// A subscriber on either plan can add users by email. Each added user is one
// unit of an "Additional user" price on the subscriber's Stripe subscription:
//   Monthly plan: STRIPE_PRICE_SEAT_MONTHLY  ($10 / month each)
//   Annual plan:  STRIPE_PRICE_SEAT_ANNUAL   ($96 / year each)
// Server-only: imports nothing client-side, never import into "use client".

export const SEAT_PRICES = {
  monthly: process.env.STRIPE_PRICE_SEAT_MONTHLY,
  annual: process.env.STRIPE_PRICE_SEAT_ANNUAL,
};

// Display prices (keep in step with the Stripe prices above).
export const SEAT_LABELS = {
  monthly: "$10/month",
  annual: "$96/year",
};

// Safety cap so a typo loop can't run up a huge bill.
export const MAX_ADDED_USERS = 50;

export function isSeatPrice(priceId) {
  if (!priceId) return false;
  return priceId === SEAT_PRICES.monthly || priceId === SEAT_PRICES.annual;
}

/** Lowercase + trim. Returns null if it doesn't look like an email. */
export function normalizeEmail(raw) {
  const email = String(raw || "").trim().toLowerCase();
  if (email.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

/**
 * Splits a Stripe subscription's line items into the base plan item and the
 * "Additional user" item (if any). Works whatever order Stripe returns them in.
 */
export function splitItems(sub) {
  const items = sub?.items?.data || [];
  const seatItem = items.find((it) => isSeatPrice(it.price?.id)) || null;
  const baseItem = items.find((it) => !isSeatPrice(it.price?.id)) || items[0] || null;
  return { baseItem, seatItem };
}

/** "monthly" or "annual", read from the base item's billing interval. */
export function planOfSubscription(sub) {
  const { baseItem } = splitItems(sub);
  const interval = baseItem?.price?.recurring?.interval;
  if (interval === "year") return "annual";
  if (interval === "month") return "monthly";
  return sub?.metadata?.plan === "annual" ? "annual" : "monthly";
}
