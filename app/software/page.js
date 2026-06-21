import Link from "next/link";

export const metadata = { title: "Stack Software" };

/*
  To use real screenshots later:
  1. Drop images into /public/screenshots/ (e.g. builder.jpg)
  2. Replace <MediaPlaceholder label="..." /> with:
       <img src="/screenshots/builder.jpg" alt="..." className="media-frame" />
*/

const FEATURES = [
  {
    tag: "Pattern Engine",
    h: "50+ optimized patterns, instantly",
    p: "Enter your case and pallet dimensions and Stack instantly generates dozens of layouts \u2014 each ranked by cubic efficiency, case support, and stability. You start from the best option, not a blank screen.",
    why: "Stop guessing at Ti-Hi. See the most efficient, most stable pattern for your exact case in seconds.",
    media: "Pattern engine \u2014 ranked layouts",
  },
  {
    tag: "Layer Planning",
    h: "Plan every layer, down to the case",
    p: "Step through the load one layer at a time \u2014 including alternating and interlocked layers \u2014 with exact case placement, orientation, and dimensions called out.",
    why: "Gives your crew a clear, repeatable build map and fewer mistakes on the floor.",
    media: "2D layer planning view",
  },
  {
    tag: "Mixed-Case Loads",
    h: "Multiple case sizes on one pallet",
    p: "Real shipments are not one SKU. Combine different cases and box sizes, layer by layer, and see the finished unit load rendered in full 3D.",
    why: "Build and document accurate mixed loads that match what actually ships.",
    media: "Mixed-case 3D unit load",
  },
  {
    tag: "Trailer Loading",
    h: "Fill the trailer, keep it balanced",
    p: "Plan how pallets fit a 53' reefer, dry van, or custom trailer \u2014 with live pallet counts, column-and-row layout, and a center-of-mass balance check.",
    why: "Maximize every trailer and cut freight cost per unit shipped.",
    media: "Trailer loading layout",
  },
  {
    tag: "Report Builder",
    h: "Build the spec sheet you need",
    p: "Drag in 3D renders, 2D layer diagrams, and case, pallet, and truck stats to compose a custom, branded report \u2014 or start from a ready-made layout.",
    why: "Hand customers and crews exactly the information they need, in your branding.",
    media: "Report builder canvas",
  },
];

function MediaPlaceholder({ label }) {
  return (
    <div className="media-frame feature-media">
      <span className="ph-label">
        <strong>{label}</strong>
        <span>Screenshot goes here</span>
      </span>
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

      {/* FEATURE ROWS */}
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <p className="eyebrow">See it in action</p>
          <h2 className="section-title">Inside the software</h2>
          <p className="lead">
            A look at the actual tools your team uses every day &mdash; from the
            pattern engine to print-ready engineering reports.
          </p>

          <div style={{ marginTop: 24 }}>
            {FEATURES.map((f) => (
              <div className="feature-row" key={f.tag}>
                <div>
                  <div className="feature-tag">{f.tag}</div>
                  <h3>{f.h}</h3>
                  <p>{f.p}</p>
                  <p className="feature-why">
                    <span>Why it matters &mdash; </span>
                    {f.why}
                  </p>
                </div>
                <MediaPlaceholder label={f.media} />
              </div>
            ))}

            {/* Professional output (no media swap on left) */}
            <div className="feature-row">
              <div>
                <div className="feature-tag">Professional Output</div>
                <h3>Export print-ready engineering reports</h3>
                <p>
                  One click turns any pattern into a polished, branded Pallet
                  Pattern Engineering Report &mdash; complete with dimensions,
                  cubic efficiency, support, stability, weight breakdowns, and
                  truck loading. Ready to print, email, or export to Excel.
                </p>
                <p className="feature-why">
                  <span>Why it matters &mdash; </span>
                  Look professional, keep specs on file, and give every job a
                  documented paper trail.
                </p>
              </div>
              <MediaPlaceholder label="Engineering report output" />
            </div>
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
              <Link href="/pricing" className="btn btn--primary">
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
