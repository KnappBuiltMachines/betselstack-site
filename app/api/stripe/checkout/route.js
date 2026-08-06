import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.betselstack.com";

// Plan keys are mapped to Stripe price IDs here, on the server, on purpose.
// The client sends only "monthly" or "annual" — never a raw price ID — so a
// user cannot substitute an arbitrary price from the Stripe account.
const PLANS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  annual: process.env.STRIPE_PRICE_ANNUAL,
};

export async function POST(req) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // Read the requested plan. Default to monthly so any older caller that sends
  // no body at all still works.
  let plan = "monthly";
  try {
    const body = await req.json();
    if (body && typeof body.plan === "string") plan = body.plan;
  } catch {
    // No body / invalid JSON — keep the monthly default.
  }

  if (!Object.prototype.hasOwnProperty.call(PLANS, plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const priceId = PLANS[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: "Billing is not configured yet." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id || undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    subscription_data: { metadata: { userId: user.id, plan } },
    allow_promotion_codes: true,
    success_url: `${SITE_URL}/builder?checkout=success`,
    cancel_url: `${SITE_URL}/account?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
