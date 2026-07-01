import Link from "next/link";
import PalletMark from "@/components/PalletMark";

const PILLARS = [
  {
    t: "Deeper customization",
    d: "Build patterns the way your spec demands, not the way a template forces. Control orientation, overhang, and stacking rules down to the case.",
  },
  {
    t: "Real-time 3D",
    d: "Inspect the unit load and pattern from any angle before a single case is stacked on the floor.",
  },
  {
    t: "Mixed-case loads",
    d: "Real shipments are not one SKU. Combine different case sizes on a single pallet, layer by layer.",
  },
  {
    t: "Trailer optimization",
    d: "Plan how pallets fit a 53' reefer, dry van, or custom trailer with live counts and a balance check.",
  },
];

const CAPS = [
  ["Standard & custom pallets", "GMA, block, stringer, and fully custom dimensions \u2014 quarter pallet to oversized."],
  ["Board-level layout", "Deck boards, stringers, spacing, and overhang all under your control."],
  ["50+ patterns instantly", "Enter case and pallet dimensions and get dozens of ranked layouts in seconds."],
  ["Layer planning", "Step through the load one layer at a time with exact placement and orientation."],
  ["Custom reports", "Branded reports, custom-generated to meet your company\u2019s standards."],
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Betsel Stack&trade;</p>
            <h1>
              The <span className="accent">Pallet Pattern</span> Creator
            </h1>
            <p className="lead">
              Advanced pallet pattern software for packaging engineers. Go far
              beyond Ti-Hi &mdash; build complex mixed-case patterns, customize
              footprints, and optimize trailer loading, all with real-time 3D.
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="btn btn--primary">
                Start 7-day free trial &rarr;
              </Link>
              <Link href="/software" className="btn btn--ghost">
                See the software
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="num">50+</div>
                <div className="lbl">Ranked patterns, instantly</div>
              </div>
              <div className="hero-stat">
                <div className="num">3D</div>
                <div className="lbl">Real-time load visualization</div>
              </div>
              <div className="hero-stat">
                <div className="num">$89</div>
                <div className="lbl">Per month, cancel anytime</div>
              </div>
            </div>
          </div>
          <div className="pallet-wrap">
            <PalletMark />
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Why it exists</p>
          <h2 className="section-title">
            Most inefficiency starts before the line
          </h2>
          <div className="grid grid-2" style={{ marginTop: 28, gap: 40 }}>
            <p className="lead" style={{ marginTop: 0 }}>
              Many of the biggest costs in packaging and freight are decided
              long before a product reaches the line &mdash; they start with the
              pallet. Betsel Stack&trade; was built by people who understand the
              realities of packaging, automation, warehousing, and transportation.
            </p>
            <p className="lead" style={{ marginTop: 0 }}>
              By combining flexibility, real-time visualization, and
              engineering-focused tools, it helps teams improve pallet
              efficiency, maximize trailer utilization, cut transportation
              costs, and develop smarter packaging &mdash; whether the solution
              is a single SKU or a complex mixed load.
            </p>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <p className="eyebrow">What sets it apart</p>
          <h2 className="section-title">Built for the way loads really ship</h2>
          <div className="grid grid-4" style={{ marginTop: 36 }}>
            {PILLARS.map((p, i) => (
              <div className="card" key={p.t}>
                <div className="card-icon">{ICONS[i]}</div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <p className="eyebrow">In the toolkit</p>
          <h2 className="section-title">Everything in one engineering tool</h2>
          <div className="grid grid-3" style={{ marginTop: 36 }}>
            {CAPS.map(([t, d]) => (
              <div className="card" key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>
              Get started
            </p>
            <h2>Start your 7-day free trial</h2>
            <p>
              Full access to the Pallet Pattern Creator &mdash; no credit card
              required. Add a card whenever you are ready to keep going.
            </p>
            <div className="cta-actions">
              <Link href="/signup" className="btn btn--primary">
                Start free trial
              </Link>
              <Link href="/software" className="btn btn--ghost">
                See it in action
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const ICONS = [
  // sliders
  <svg key="0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="17" x2="20" y2="17" /><circle cx="9" cy="7" r="2.4" fill="#0b0c0e" /><circle cx="15" cy="17" r="2.4" fill="#0b0c0e" /></svg>,
  // cube
  <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 2 21 7v10l-9 5-9-5V7z" /><path d="M3 7l9 5 9-5M12 12v10" /></svg>,
  // layers
  <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3 3 8l9 5 9-5z" /><path d="M3 13l9 5 9-5" /></svg>,
  // truck
  <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M2 6h11v9H2zM13 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></svg>,
];
