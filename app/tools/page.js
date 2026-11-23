// app/tools/page.js — Free Tools hub
// Public, no-login tools for packaging engineers. Add a card to TOOLS for each
// new free tool (and its page under app/tools/, plus a line in app/sitemap.js).

import Link from "next/link";
import "./tools.css";

export const metadata = {
  title: "Free Packaging Engineering Tools",
  description:
    "Free tools for packaging engineers from Betsel Stack. Size a case from your product dimensions with the free Case Size Calculator. No login needed.",
  alternates: { canonical: "/tools" },
};

const TOOLS = [
  {
    href: "/tools/case-size-calculator",
    tag: "Case sizing",
    title: "Case Size Calculator",
    text:
      "Enter your unit size (box, jar, can or bottle) and how many go in a case. Get every case arrangement with outside dimensions, weight and cube.",
  },
];

export default function ToolsPage() {
  return (
    <>
      <section className="tools-hero">
        <div className="container">
          <p className="eyebrow">Free tools</p>
          <h1>Free tools for packaging engineers</h1>
          <p className="lead">
            Quick, practical calculators you can use right now, with no account and no
            download. Built by the team behind Betsel Stack.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <div className="tools-cards">
            {TOOLS.map((t) => (
              <Link key={t.href} href={t.href} className="tool-card">
                <span className="tool-card__tag">{t.tag}</span>
                <h2>{t.title}</h2>
                <p>{t.text}</p>
                <span className="tool-card__go">Open the calculator &rarr;</span>
              </Link>
            ))}
            <div className="tool-card tool-card--soon">
              <span className="tool-card__tag">Coming soon</span>
              <h2>More tools on the way</h2>
              <p>We&rsquo;re adding more free tools for everyday packaging work.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <h2>Need the full pallet pattern?</h2>
            <p>
              Betsel Stack creates ranked pallet patterns from your case and pallet
              dimensions, shows the load in 3D, and exports branded PDF reports.
            </p>
            <div className="cta-actions">
              <Link href="/signup" className="btn btn--primary">Start 7-day free trial</Link>
              <Link href="/software" className="btn btn--ghost">See the software</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
