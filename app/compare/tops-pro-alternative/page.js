// app/compare/tops-pro-alternative/page.js
// Drop-in Next.js App Router page. Self-contained styling (prefixed .bsa-* classes),
// no external font or Tailwind dependency. Swap --bsa-accent to match your brand token.

const SITE = "https://www.betselstack.com";
const PATH = "/compare/tops-pro-alternative";

export const metadata = {
  title: "TOPS Pro Alternative — Browser-Based Pallet Pattern Software | Betsel Stack",
  description:
    "Looking for a TOPS Pro alternative? Betsel Stack builds pallet patterns and reports in your browser — no install, public $29/mo pricing, and a 7-day free trial you can start now.",
  keywords: [
    "TOPS Pro alternative",
    "pallet pattern software",
    "palletization software",
    "cloud pallet software",
    "pallet optimization",
  ],
  alternates: { canonical: SITE + PATH },
  openGraph: {
    title: "TOPS Pro Alternative — Betsel Stack",
    description:
      "Pallet patterns and reports in your browser. No install, transparent pricing, 7-day free trial.",
    url: SITE + PATH,
    siteName: "Betsel Stack",
    type: "website",
  },
};

const faq = [
  {
    q: "Is there a browser-based alternative to TOPS Pro?",
    a: "Yes. Betsel Stack runs entirely in a modern web browser, so there is nothing to install and it works on a laptop, a shared plant-floor machine, or a tablet. TOPS Pro is a desktop application that has to be installed per seat.",
  },
  {
    q: "How does Betsel Stack pricing compare to TOPS Pro?",
    a: "Betsel Stack is $29 per month with the monthly plan, or $279 a year if you pay up front, both listed publicly. TOPS Pro pricing is quote-based — you contact the vendor and typically buy a perpetual license plus annual maintenance.",
  },
  {
    q: "Can I try it before I buy?",
    a: "Yes. Betsel Stack has a 7-day free trial that you start yourself in a couple of minutes — no demo booking or sales call required.",
  },
  {
    q: "Does it generate reports I can share?",
    a: "Yes. You can build reports and export clean PDFs, and save your work to the cloud so it is available on any device you sign in from.",
  },
  {
    q: "When does TOPS Pro still make more sense?",
    a: "TOPS Pro is a mature, broad packaging-design suite. If you need full carton and corrugate design, mixed-SKU container loading, and deep ERP/WMS integration in one package, it covers ground Betsel Stack does not try to. Betsel Stack is focused on fast pallet-pattern generation and reporting.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const rows = [
  ["Deployment", "Browser-based — nothing to install", "Desktop application (Windows install)"],
  ["Pricing", "$29/month or $279/year, listed publicly", "Contact vendor for a quote; perpetual license + annual maintenance"],
  ["Free trial", "7 days, self-serve, start instantly", "Available on request"],
  ["Access", "Any device with a browser", "Per-seat desktop installs"],
  ["Focus", "Pallet-pattern generation + reporting", "Broad suite: carton design, palletizing, container loading"],
  ["Best for", "Teams wanting fast, modern pallet patterns without IT overhead", "Large operations needing a full design suite with ERP/WMS integration"],
];

export default function TopsProAlternative() {
  return (
    <main className="bsa-root">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PalletStyles />

      {/* Hero */}
      <section className="bsa-hero">
        <div className="bsa-hero-copy">
          <span className="bsa-eyebrow">TOPS Pro alternative</span>
          <h1 className="bsa-h1">
            Pallet patterns in your browser — <span className="bsa-hl">no install, no sales call.</span>
          </h1>
          <p className="bsa-lede">
            Betsel Stack gives packaging engineers the pattern generation and
            reporting they rely on TOPS Pro for — on any device, with pricing you
            can read right here and a trial you can start in the next two minutes.
          </p>
          <div className="bsa-cta-row">
            <a className="bsa-btn bsa-btn-primary" href={SITE}>
              Start your 7-day free trial
            </a>
            <a className="bsa-btn bsa-btn-ghost" href="#compare">
              See the full comparison
            </a>
          </div>
          <p className="bsa-fineprint">$29/month after trial · or $279/year · no credit card demo call</p>
        </div>
        <div className="bsa-hero-art" aria-hidden="true">
          <PalletSVG />
        </div>
      </section>

      {/* Value props */}
      <section className="bsa-section">
        <h2 className="bsa-h2">Why packaging teams look past TOPS Pro</h2>
        <div className="bsa-grid">
          <Card
            k="Nothing to install"
            v="Runs in any modern browser — on the plant floor, at your desk, or on a tablet. No IT ticket to get started."
          />
          <Card
            k="Pricing you can see"
            v="$29/month, or $279/year if you pay up front — published on the page. No quote request, no procurement cycle before you know the number."
          />
          <Card
            k="Start today"
            v="A 7-day free trial you begin yourself. No demo to schedule, no waiting on a rep to call you back."
          />
          <Card
            k="Built this decade"
            v="Fast pattern generation, stability scoring, and clean PDF reports without a legacy-software learning curve."
          />
        </div>
      </section>

      {/* Comparison table */}
      <section className="bsa-section" id="compare">
        <h2 className="bsa-h2">Betsel Stack vs. TOPS Pro</h2>
        <div className="bsa-table-wrap">
          <table className="bsa-table">
            <thead>
              <tr>
                <th className="bsa-th-label"></th>
                <th className="bsa-th-us">Betsel Stack</th>
                <th>TOPS Pro</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, us, them]) => (
                <tr key={label}>
                  <td className="bsa-td-label">{label}</td>
                  <td className="bsa-td-us">{us}</td>
                  <td className="bsa-td-them">{them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="bsa-note">
          Comparison based on publicly available product information. TOPS Pro is a
          trademark of its respective owner; Betsel Stack is not affiliated with or
          endorsed by it.
        </p>
      </section>

      {/* Fairness */}
      <section className="bsa-section bsa-fair">
        <h2 className="bsa-h2">Where TOPS Pro still makes sense</h2>
        <p className="bsa-body">
          TOPS Pro is a mature, deep toolset. If you need full carton and corrugate
          design, mixed-SKU container loading, and tight ERP/WMS integration in a
          single package, it covers ground Betsel Stack does not try to. Betsel Stack
          is deliberately focused: the pallet-pattern and reporting job, done fast and
          cleanly, without the install or the licensing conversation.
        </p>
      </section>

      {/* FAQ */}
      <section className="bsa-section">
        <h2 className="bsa-h2">Common questions</h2>
        <div className="bsa-faq">
          {faq.map((f) => (
            <div className="bsa-faq-item" key={f.q}>
              <h3 className="bsa-faq-q">{f.q}</h3>
              <p className="bsa-faq-a">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bsa-final">
        <h2 className="bsa-final-h">See your first pattern in five minutes.</h2>
        <a className="bsa-btn bsa-btn-primary bsa-btn-lg" href={SITE}>
          Start your 7-day free trial
        </a>
      </section>
    </main>
  );
}

function Card({ k, v }) {
  return (
    <div className="bsa-card">
      <h3 className="bsa-card-k">{k}</h3>
      <p className="bsa-card-v">{v}</p>
    </div>
  );
}

function PalletSVG() {
  // Top-down pinwheel pallet pattern — the thing the product actually makes.
  const cases = [
    // x, y, w, h  (a simple pinwheel/brick layout on a pallet footprint)
    [12, 12, 84, 40],
    [100, 12, 40, 84],
    [12, 56, 40, 84],
    [56, 100, 84, 40],
    [96, 56, 44, 40],
    [12, 144, 84, 40],
    [100, 144, 40, 40],
  ];
  return (
    <svg viewBox="0 0 152 200" className="bsa-svg" role="img">
      <rect x="4" y="4" width="144" height="192" rx="6" className="bsa-pallet" />
      {cases.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="3" className="bsa-case" />
      ))}
    </svg>
  );
}

function PalletStyles() {
  return (
    <style>{`
      .bsa-root{
        --bsa-bg:#0e1420; --bsa-panel:#161d2b; --bsa-panel2:#1b2436;
        --bsa-line:#26324a; --bsa-text:#e9eef7; --bsa-muted:#94a3bd;
        --bsa-accent:#f5b301; --bsa-accent-ink:#0e1420; --bsa-good:#46c08a;
        background:var(--bsa-bg); color:var(--bsa-text);
        font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
        line-height:1.55; -webkit-font-smoothing:antialiased;
      }
      .bsa-root *{box-sizing:border-box;}
      .bsa-hero{
        max-width:1080px;margin:0 auto;padding:80px 24px 48px;
        display:grid;grid-template-columns:1.25fr 1fr;gap:48px;align-items:center;
      }
      .bsa-eyebrow{
        display:inline-block;font-size:12px;letter-spacing:.18em;text-transform:uppercase;
        font-weight:700;color:var(--bsa-accent);margin-bottom:18px;
      }
      .bsa-h1{
        font-size:clamp(34px,5vw,54px);line-height:1.04;letter-spacing:-0.02em;
        font-weight:800;margin:0 0 20px;
      }
      .bsa-hl{color:var(--bsa-accent);}
      .bsa-lede{font-size:clamp(16px,1.6vw,19px);color:var(--bsa-muted);max-width:34ch;margin:0 0 28px;}
      .bsa-cta-row{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:14px;}
      .bsa-btn{
        display:inline-block;padding:14px 22px;border-radius:10px;font-weight:700;
        font-size:15px;text-decoration:none;transition:transform .08s ease,filter .15s ease;
      }
      .bsa-btn:focus-visible{outline:3px solid var(--bsa-accent);outline-offset:2px;}
      .bsa-btn-primary{background:var(--bsa-accent);color:var(--bsa-accent-ink);}
      .bsa-btn-primary:hover{filter:brightness(1.06);transform:translateY(-1px);}
      .bsa-btn-ghost{background:transparent;color:var(--bsa-text);border:1px solid var(--bsa-line);}
      .bsa-btn-ghost:hover{border-color:var(--bsa-accent);}
      .bsa-btn-lg{padding:16px 30px;font-size:17px;}
      .bsa-fineprint{font-size:13px;color:var(--bsa-muted);margin:0;}
      .bsa-hero-art{display:flex;justify-content:center;}
      .bsa-svg{width:min(100%,300px);height:auto;}
      .bsa-pallet{fill:var(--bsa-panel);stroke:var(--bsa-line);stroke-width:1.5;}
      .bsa-case{fill:none;stroke:var(--bsa-accent);stroke-width:2;opacity:.9;}

      .bsa-section{max-width:1080px;margin:0 auto;padding:48px 24px;}
      .bsa-h2{font-size:clamp(24px,3vw,34px);letter-spacing:-0.01em;font-weight:800;margin:0 0 28px;}
      .bsa-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;}
      .bsa-card{background:var(--bsa-panel);border:1px solid var(--bsa-line);border-radius:14px;padding:24px;}
      .bsa-card-k{font-size:18px;font-weight:700;margin:0 0 8px;color:var(--bsa-text);}
      .bsa-card-v{margin:0;color:var(--bsa-muted);font-size:15px;}

      .bsa-table-wrap{overflow-x:auto;border:1px solid var(--bsa-line);border-radius:14px;}
      .bsa-table{width:100%;border-collapse:collapse;min-width:640px;}
      .bsa-table th,.bsa-table td{text-align:left;padding:16px 18px;vertical-align:top;font-size:15px;}
      .bsa-table thead th{font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:var(--bsa-muted);border-bottom:1px solid var(--bsa-line);}
      .bsa-th-us{color:var(--bsa-accent) !important;}
      .bsa-table tbody tr{border-bottom:1px solid var(--bsa-line);}
      .bsa-table tbody tr:last-child{border-bottom:none;}
      .bsa-td-label{font-weight:700;color:var(--bsa-text);white-space:nowrap;}
      .bsa-td-us{color:var(--bsa-text);background:rgba(245,179,1,0.05);}
      .bsa-td-them{color:var(--bsa-muted);}
      .bsa-note{font-size:12px;color:var(--bsa-muted);margin:14px 2px 0;}

      .bsa-fair .bsa-body{color:var(--bsa-muted);font-size:16px;max-width:70ch;margin:0;}

      .bsa-faq{display:grid;gap:16px;}
      .bsa-faq-item{background:var(--bsa-panel);border:1px solid var(--bsa-line);border-radius:12px;padding:20px 22px;}
      .bsa-faq-q{font-size:16px;font-weight:700;margin:0 0 8px;}
      .bsa-faq-a{margin:0;color:var(--bsa-muted);font-size:15px;}

      .bsa-final{max-width:1080px;margin:24px auto 96px;padding:56px 24px;text-align:center;
        background:var(--bsa-panel2);border:1px solid var(--bsa-line);border-radius:18px;}
      .bsa-final-h{font-size:clamp(24px,3.2vw,36px);font-weight:800;letter-spacing:-0.01em;margin:0 0 24px;}

      @media (max-width:820px){
        .bsa-hero{grid-template-columns:1fr;padding-top:56px;}
        .bsa-hero-art{order:-1;}
        .bsa-grid{grid-template-columns:1fr;}
      }
      @media (prefers-reduced-motion:reduce){
        .bsa-btn{transition:none;}
      }
    `}</style>
  );
}
