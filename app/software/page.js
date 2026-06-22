import Link from "next/link";

export const metadata = { title: "Stack Software" };

const CAPS = [
  ["Deeper customization", "Build patterns the way your spec demands, not the way a template forces."],
  ["Standard & custom pallets", "GMA, block, stringer, and fully custom dimensions \u2014 quarter pallet to oversized."],
  ["Real-time 3D", "Inspect the load and pattern from any angle before production."],
  ["Board-level layout", "Deck boards, stringers, spacing, and overhang under your control."],
  ["PDF reports", "Branded, print-ready cut sheets and engineering summaries."],
  ["Excel export", "Bill-of-materials and pattern data that drops into your systems."],
];

const SHOTS = [
  {
    img: "/screenshots/builder.jpg",
    kicker: "Pattern Engine",
    title: "50+ optimized patterns, instantly",
    desc: "Enter your case and pallet dimensions and Betsel Stack instantly generates dozens of layouts \u2014 each ranked by cubic efficiency, case support, and stability. You start from the best option, not a blank screen.",
    why: "Stop guessing at Ti-Hi. See the most efficient, most stable pattern for your exact case in seconds.",
  },
  {
    img: "/screenshots/layers-2d.jpg",
    kicker: "Layer Planning",
    title: "Plan every layer, down to the case",
    desc: "Step through the load one layer at a time \u2014 including alternating and interlocked layers \u2014 with exact case placement, orientation, and dimensions called out.",
    why: "Gives your crew a clear, repeatable build map and fewer mistakes on the floor.",
  },
  {
    img: "/screenshots/mixed-3d.jpg",
    kicker: "Mixed-Case Loads",
    title: "Multiple case sizes on one pallet",
    desc: "Real shipments are not one SKU. Combine different cases and box sizes, layer by layer, and see the finished unit load rendered in full 3D.",
    why: "Build and document accurate mixed loads that match what actually ships.",
  },
  {
    img: "/screenshots/truck-load.jpg",
    kicker: "Trailer Loading",
    title: "Fill the trailer, keep it balanced",
    desc: "Plan how pallets fit a 53' reefer, dry van, or custom trailer \u2014 with live pallet counts, column-and-row layout, and a center-of-mass balance check.",
    why: "Maximize every trailer and cut freight cost per unit shipped.",
  },
];

function Shot({ img, alt }) {
  return (
    <div
      className="feature-media"
      style={{ border: "1px solid var(--line)", borderRadius: 14, background: "var(--panel)", padding: 6 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt={alt} style={{ width: "100%", height: "auto", borderRadius: 9, display: "block" }} />
    </div>
  );
}

export default function SoftwarePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero" style={{ paddingBottom: 56 }}>
        <div className="container">
          <p className="eyebrow">Betsel Stack&trade;</p>
          <h1 style={{ fontSize: "clamp(38px, 5.5vw, 60px)", maxWidth: "16ch" }}>
            The Pallet Pattern Creator
          </h1>
          <p className="lead">
            A standalone software product built to close a real gap for
            packaging engineers &mdash; one tool for patterns, layers,
            mixed-case loads, trailer planning, and engineering reports.
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section className="section--tight">
        <div className="container">
          <div className="grid grid-2" style={{ gap: 40 }}>
            <p className="lead" style={{ marginTop: 0 }}>
              Betsel Stack&trade; goes far beyond traditional Ti-Hi
              calculations. Build complex mixed-case pallet patterns, place
              multiple case sizes on a single pallet, customize footprints from
              quarter pallets to full and fully custom sizes, and optimize
              trailer loading across multiple trailer types.
            </p>
            <p className="lead" style={{ marginTop: 0 }}>
              By combining flexibility, real-time visualization, and
              engineering-focused tools, it helps companies improve pallet
              efficiency, maximize trailer utilization, reduce transportation
              costs, and develop smarter packaging solutions.
            </p>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="section" style={{ paddingTop: 8 }}>
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

      {/* SCREENSHOT SHOWCASE */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <p className="eyebrow">See it in action</p>
          <h2 className="section-title">Inside the software</h2>
          <p className="lead">
            A look at the actual tools your team uses every day &mdash; from the
            pattern engine to layer-by-layer build maps.
          </p>

          <div style={{ marginTop: 24 }}>
            {SHOTS.map((s) => (
              <div className="feature-row" key={s.img}>
                <div>
                  <div className="feature-tag">{s.kicker}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <p className="feature-why">
                    <span>Why it matters &mdash; </span>
                    {s.why}
                  </p>
                </div>
                <Shot img={s.img} alt={s.title} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROFESSIONAL OUTPUT */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="card" style={{ padding: "34px 30px" }}>
            <div className="feature-tag">Professional Output</div>
            <h3 style={{ fontSize: "clamp(22px, 3vw, 28px)", marginBottom: 12 }}>
              Export print-ready engineering reports
            </h3>
            <p style={{ color: "var(--muted)", maxWidth: "70ch" }}>
              Compose a custom report from 3D renders, 2D layer diagrams, and
              case, pallet, and truck stats &mdash; then export a polished,
              branded Pallet Pattern Engineering Report with dimensions, cubic
              efficiency, support, stability, weight breakdowns, and truck
              loading. Ready to print, email, or export to Excel.
            </p>
            <p className="feature-why" style={{ maxWidth: "70ch" }}>
              <span>Why it matters &mdash; </span>
              Look professional, keep specs on file, and give every job a
              documented paper trail.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <h2>Start your 7-day free trial</h2>
            <p>
              Full access to the Pallet Pattern Creator &mdash; no credit card
              required. Add a card whenever you are ready to keep going.
            </p>
            <div className="cta-actions">
              <Link href="/signup" className="btn btn--primary">
                Start free trial
              </Link>
              <Link href="/pricing" className="btn btn--ghost">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
