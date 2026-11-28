import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription, getTeamSeat } from "@/lib/subscription";
import BillingButtons from "@/components/BillingButtons";
import { StripeBadge } from "@/components/TrustBadges";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscribe" };

export default async function SubscribePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not signed in? Send them to create an account, then come straight back here.
  if (!user) redirect("/signup?next=/subscribe");

  // Already subscribed? Nothing to buy.
  const sub = await getActiveSubscription(supabase, user.id);
  if (sub) redirect("/account");

  // Added user on someone else's subscription? Also nothing to buy.
  if (await getTeamSeat(user.id)) redirect("/account");

  return (
    <section className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <h1>Subscribe</h1>
        <p className="sub">
          Betsel Stack&trade; membership &mdash; full access to the Pallet
          Pattern Creator. Signed in as {user.email}.
        </p>

        {/* ---------- Monthly ---------- */}
        <div className="plan-option">
          <div className="plan-option__head">
            <div className="price-amount" style={{ marginBottom: 0 }}>
              <span className="big" style={{ fontSize: 40 }}>
                $29
              </span>
              <span className="per">/ month</span>
            </div>
          </div>
          <p className="plan-option__note">
            Billed today, then monthly. Cancel anytime from your account page.
          </p>
          <BillingButtons
            plan="monthly"
            label="Subscribe monthly"
            variant="ghost"
          />
        </div>

        {/* ---------- Annual ---------- */}
        <div className="plan-option plan-option--feature">
          <span className="price-badge" style={{ marginBottom: 14 }}>
            Save 20%
          </span>
          <div className="plan-option__head">
            <div className="price-amount" style={{ marginBottom: 0 }}>
              <span className="big" style={{ fontSize: 40 }}>
                $279
              </span>
              <span className="per">/ year</span>
            </div>
          </div>
          <p className="plan-option__note">
            $23.25 a month, billed once today. Renews yearly &mdash; you can turn
            off renewal at any time, and the prepaid year is not refundable.
          </p>
          <BillingButtons plan="annual" label="Pay yearly — $279" variant="primary" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 20 }}>
          <StripeBadge />
          <p className="auth-foot" style={{ marginTop: 0 }}>
            Card details go straight to Stripe and never touch our servers.{" "}
            <Link href="/security">Security</Link>
          </p>
        </div>

        <p className="auth-foot" style={{ marginTop: 18 }}>
          Want to try first? <Link href="/signup">Start a 7-day free trial</Link>
        </p>
      </div>
    </section>
  );
}
