import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription } from "@/lib/subscription";
import BillingButtons from "@/components/BillingButtons";

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

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1>Subscribe</h1>
        <p className="sub">
          Betsel Stack&trade; monthly membership &mdash; full access to the
          Pallet Pattern Creator.
        </p>

        <div className="price-amount" style={{ marginBottom: 4 }}>
          <span className="big">$89</span>
          <span className="per">/ month</span>
        </div>
        <p style={{ color: "var(--muted)", marginBottom: 18 }}>
          Billed today, then monthly. Cancel anytime. Signed in as {user.email}.
        </p>

        <BillingButtons />

        <p className="auth-foot" style={{ marginTop: 18 }}>
          Want to try first? <Link href="/signup">Start a 7-day free trial</Link>
        </p>
      </div>
    </section>
  );
}
