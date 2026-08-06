import Link from "next/link";
import PalletMark from "@/components/PalletMark";

export const metadata = { title: "Pricing" };

const CORE_FEATURES = [
  "Full Pallet Pattern Creator access",
  "Real-time 3D load visualization",
  "Mixed-case pallet patterns",
  "Standard & custom pallet sizes",
  "PDF & Excel report export",
];

const MONTHLY_FEATURES = [...CORE_FEATURES, "Cancel anytime"];
const ANNUAL_FEATURES = [...CORE_FEATURES, "Rate locked for 12 months"];

function Check() {
  return (
    <span className="check" aria-hidden="true">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

function FeatureList({ items }) {
  return (
    <ul className="price-list">
      {items.map((f) => (
        <li key={f}>
          <Check />
          {f}
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 40 }}>
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Pricing</p>
            <h1 style={{ fontSize: "clamp(38px, 5.5vw, 60px)" }}>
              Try it free for <span className="accent">7 days</span>
            </h1>
            <p className="lead">
              Start with a 7-day free trial &mdash; no credit card required
              &mdash; or subscribe now and jump straight in. Pay monthly, or pay
              for the year up front and save 20%.
            </p>
          </div>
          <div className="pallet-wrap">
            <PalletMark />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }}>
        <div className="container">
          <div className="price-duo">
            {/* ---------- Monthly ---------- */}
            <div className="price-card">
              <span className="price-badge">Monthly</span>
              <div className="price-amount">
                <span className="big">$29</span>
                <span className="per">/ month</span>
              </div>
              <p className="price-sub">
                7-day free trial &middot; no credit card required
              </p>

              <FeatureList items={MONTHLY_FEATURES} />

              <Link href="/signup" className="btn btn--primary btn--block">
                Start 7-day free trial
              </Link>
              <Link
                href="/subscribe"
                className="btn btn--ghost btn--block"
                style={{ marginTop: 10 }}
              >
                Subscribe now &mdash; $29/month
              </Link>
              <p className="price-fine">
                Billed monthly in advance. Cancel anytime from your account page.
              </p>
            </div>

            {/* ---------- Annual ---------- */}
            <div className="price-card price-card--feature">
              <span className="price-badge">Yearly &mdash; save 20%</span>
              <div className="price-amount">
                <span className="big">$279</span>
                <span className="per">/ year</span>
              </div>
              <p className="price-sub">
                $23.25 / month &middot; you save $69 a year
              </p>

              <FeatureList items={ANNUAL_FEATURES} />

              <Link href="/signup" className="btn btn--primary btn--block">
                Start 7-day free trial
              </Link>
              <Link
                href="/subscribe"
                className="btn btn--ghost btn--block"
                style={{ marginTop: 10 }}
              >
                Pay yearly &mdash; $279
              </Link>
              <p className="price-fine">
                Paid in full up front and renews yearly. You can turn off renewal
                at any time; the prepaid year is not refundable.
              </p>
            </div>
          </div>

          <p className="price-fine" style={{ maxWidth: 620, margin: "26px auto 0" }}>
            The free trial needs no card and works with either plan &mdash; pick
            monthly or yearly when it ends. Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--amber)" }}>
              Log in
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <h2>Questions before you start?</h2>
            <p>
              Tell us about your cases, pallets, and trailers and we will point
              you in the right direction.
            </p>
            <div className="cta-actions">
              <Link href="/contact" className="btn btn--ghost">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
