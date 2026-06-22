import Stripe from "stripe";

// Real key comes from STRIPE_SECRET_KEY at runtime. The placeholder lets
// `next build` import this file before that variable is set; it is never used
// once STRIPE_SECRET_KEY is configured in Vercel.
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_build_only",
  {
    appInfo: { name: "Betsel Stack", version: "1.0.0" },
  }
);
