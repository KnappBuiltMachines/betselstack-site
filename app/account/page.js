import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccess, getActiveSubscription } from "@/lib/subscription";
import BillingButtons from "@/components/BillingButtons";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account" };

const amber = { color: "var(--amber)" };

/**
 * Both plan options, side by side, so the yearly discount is visible at the
 * point where someone decides to pay. Shown to trial users and to anyone
 * without an active subscription.
 */
function PlanPicker() {
  return (
    <div style={{ marginTop: 16 }}>
      <div className="plan-option">
        <div className="price-amount" style={{ marginBottom: 6 }}>
          <span className="big" style={{ fontSize: 34 }}>
            $29
          </span>
          <span className="per">/ month</span>
        </div>
        <p className="plan-option__note">
          Billed monthly. Cancel anytime from this page.
        </p>
        <BillingButtons plan="monthly" label="Subscribe monthly" variant="ghost" />
      </div>

      <div className="plan-option plan-option--feature">
        <span className="price-badge" style={{ marginBottom: 12 }}>
          Save 20%
        </span>
        <div className="price-amount" style={{ marginBottom: 6 }}>
          <span className="big" style={{ fontSize: 34 }}>
            $279
          </span>
          <span className="per">/ year</span>
        </div>
        <p className="plan-option__note">
          $23.25 a month, billed once. Renews yearly &mdash; you can turn off
          renewal any time, and the prepaid year is not refundable.
        </p>
        <BillingButtons plan="annual" label="Pay yearly — $279" variant="primary" />
      </div>
    </div>
  );
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const sub = await getActiveSubscription(supabase, user.id);
  const access = await getAccess(supabase, user.id);

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1>My account</h1>
        <p className="sub">{user.email}</p>

        {access.allowed && (
          <>
            <Link href="/builder" className="btn btn--primary btn--block" style={{ marginBottom: 10 }}>
              Open the Pallet Builder
            </Link>
            <Link href="/m" className="btn btn--ghost btn--block" style={{ marginBottom: 18 }}>
              Mobile version &mdash; review saved files
            </Link>
          </>
        )}

        {sub ? (
          <div>
            <p>Status: <strong style={amber}>{sub.status}</strong></p>
            {sub.plan && (
              <p style={{ color: "var(--muted)" }}>
                Plan: {sub.plan === "annual" ? "Yearly — $279/year" : "Monthly — $29/month"}
              </p>
            )}
            {sub.current_period_end && (
              <p style={{ color: "var(--muted)" }}>
                {sub.cancel_at_period_end ? "Ends" : "Renews"}:{" "}
                {new Date(sub.current_period_end).toLocaleDateString()}
              </p>
            )}
            <div style={{ marginTop: 14 }}>
              <BillingButtons subscribed />
            </div>
          </div>
        ) : access.reason === "trial" ? (
          <div>
            <p>Status: <strong style={amber}>Free trial</strong></p>
            <p>
              <strong style={amber}>
                {access.trialDaysLeft} day{access.trialDaysLeft === 1 ? "" : "s"} left
              </strong>
              {access.trialEndsAt
                ? ` \u00b7 ends ${new Date(access.trialEndsAt).toLocaleDateString()}`
                : ""}
            </p>
            <p style={{ color: "var(--muted)" }}>
              No card on file yet. Pick a plan below to keep access when your
              trial ends.
            </p>
            <PlanPicker />
          </div>
        ) : (
          <div>
            <p>
              {access.reason === "expired"
                ? "Your free trial has ended."
                : "No active membership."}
            </p>
            <p style={{ color: "var(--muted)" }}>
              Pick a plan to unlock the Pallet Pattern Creator.
            </p>
            <PlanPicker />
          </div>
        )}

        <form action="/auth/signout" method="post" style={{ marginTop: 22 }}>
          <button className="btn btn--ghost btn--block" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </section>
  );
}
