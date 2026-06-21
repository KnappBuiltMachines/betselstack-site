import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccess, getActiveSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account" };

const amber = { color: "var(--amber)" };

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
          <Link href="/builder" className="btn btn--primary btn--block" style={{ marginBottom: 18 }}>
            Open the Pallet Builder
          </Link>
        )}

        {sub ? (
          <div>
            <p>Status: <strong style={amber}>{sub.status}</strong></p>
            {sub.current_period_end && (
              <p style={{ color: "var(--muted)" }}>
                {sub.cancel_at_period_end ? "Ends" : "Renews"}:{" "}
                {new Date(sub.current_period_end).toLocaleDateString()}
              </p>
            )}
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
              No card on file yet. Subscribe anytime to keep access when your
              trial ends.
            </p>
            <Link href="/pricing" className="btn btn--ghost btn--block" style={{ marginTop: 14 }}>
              Subscribe
            </Link>
          </div>
        ) : (
          <div>
            <p>
              {access.reason === "expired"
                ? "Your free trial has ended."
                : "No active membership."}
            </p>
            <Link href="/pricing" className="btn btn--primary btn--block" style={{ marginTop: 14 }}>
              {access.reason === "expired" ? "Subscribe to continue" : "Choose a plan"}
            </Link>
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
