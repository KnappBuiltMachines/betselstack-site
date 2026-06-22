import Link from "next/link";
import PalletMark from "@/components/PalletMark";

export const metadata = { title: "Pricing" };

const FEATURES = [
  "Full Pallet Pattern Creator access",
  "Real-time 3D load visualization",
  "Mixed-case pallet patterns",
  "Standard & custom pallet sizes",
  "PDF & Excel report export",
  "Cancel anytime",
];

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
              &mdash; or subscribe now and jump straight in. One simple
              membership, cancel anytime.
            </p>
          </div>
          <div className="pallet-wrap">
            <PalletMark />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }}>
        <div className="container">
          <div className="price-card">
            <span className="price-badge">Monthly membership</span>
            <div className="price-amount">
              <span className="big">$89</span>
              <span className="per">/ month</span>
            </div>
            <p className="price-sub">7-day free trial &middot; no credit card required</p>

            <ul className="price-list">
              {FEATURES.map((f) => (
                <li key={f}>
                  <span className="check" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Link href="/signup" className="btn btn--primary btn--block">
              Start 7-day free trial
            </Link>
            <Link href="/subscribe" className="btn btn--ghost btn--block" style={{ marginTop: 10 }}>
              Subscribe now &mdash; $89/month
            </Link>
            <p className="price-fine">
              Free trial needs no card. Prefer to skip it? Subscribe now and get
              billed today. Cancel anytime.{" "}
              Already have an account? <Link href="/login" style={{ color: "var(--amber)" }}>Log in</Link>.
            </p>
          </div>
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
