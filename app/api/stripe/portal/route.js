import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.betselstack.com";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile, error: dbError } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (dbError) {
      console.error("portal: profile lookup failed:", dbError.message);
      return NextResponse.json({ error: "Could not load your billing profile." }, { status: 500 });
    }
    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing account is linked to this login yet." }, { status: 400 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${SITE_URL}/account`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error opening billing portal.";
    console.error("portal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
