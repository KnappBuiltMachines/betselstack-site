// app/tools/sustainability-library/page.js — Free Sustainability Library
// Public, no-login reference for packaging engineers: materials and their
// recyclability ratings, regulations, certifications and claim guidance.
// The materials explorer is a client component; everything else is plain
// server-rendered text so search engines can read it.
// Content lives in lib/sustainability/library.js (update LAST_REVIEWED there).

import Link from "next/link";
import "../tools.css";
import SustainabilityLibrary from "@/components/tools/SustainabilityLibrary";
import {
  LAST_REVIEWED,
  H2R,
  MATERIALS,
  REGULATIONS,
  STANDARDS,
  CLAIMS,
  SOURCES,
} from "@/lib/sustainability/library";

const SITE = "https://www.betselstack.com";
const PATH = "/tools/sustainability-library";

export const metadata = {
  title: { absolute: "Sustainable Packaging Library — Materials, Regulations & Green Guides | Betsel Stack" },
  description:
    "Free sustainable packaging reference: recyclability ratings for packaging and pallet materials, FTC Green Guides claim tips, state EPR, SB 343, PFAS and EU PPWR.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Sustainable Packaging Library for Packaging Engineers",
    description:
      "Compare packaging and pallet materials on recyclability, recycled content and reuse, and check the regulations and claims rules that apply.",
    url: SITE + PATH,
    type: "website",
  },
};

const TONE = {
  inforce: { label: "In force", cls: "good" },
  phasing: { label: "Phasing in", cls: "mid" },
  paused: { label: "Enforcement paused", cls: "bad" },
  review: { label: "Under review", cls: "mid" },
};

const FAQ = [
  {
    q: "What makes packaging “recyclable” in the U.S.?",
    a: "Under the FTC Green Guides, you can make an unqualified recyclable claim only when recycling programs that accept the item are available to a substantial majority (at least 60%) of consumers or communities where it is sold. Below that, the claim should be qualified, for example “Check locally.” How2Recycle uses the same 60% threshold for its Widely Recyclable label.",
  },
  {
    q: "Is California's SB 343 in effect?",
    a: "Not right now. A federal court issued a preliminary injunction on July 14, 2026 that blocks California from enforcing SB 343 while the lawsuit continues. The law has not been repealed, so keep substantiation for any recyclability claims and watch for updates.",
  },
  {
    q: "Which states have packaging EPR laws?",
    a: "Seven: Maine, Oregon, Colorado, California, Minnesota, Maryland and Washington. Oregon and Colorado are collecting producer fees; the others are in registration and planning. Oregon and California include most business-to-business packaging, such as stretch film and strapping.",
  },
  {
    q: "Which pallet is most sustainable?",
    a: "Reuse usually wins. Pooled block pallets and plastic pallets make many trips, and wood pallets are widely repaired and recycled. The right choice also depends on what your retailer accepts, your load weight and whether you ship internationally (ISPM 15).",
  },
  {
    q: "How do pallet patterns affect sustainability?",
    a: "A pattern with higher cube efficiency puts more product on each pallet and each truck, which cuts pallets, stretch film and freight per unit shipped. Right-sized cases, no overhang and a stable interlock also reduce damage, which is often the biggest waste of all.",
  },
];

const JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Sustainable Packaging Library",
      url: SITE + PATH,
      description:
        "Reference for packaging engineers: material recyclability ratings, sustainability regulations, certifications and FTC Green Guides claim guidance.",
      isAccessibleForFree: true,
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Free Tools", item: `${SITE}/tools` },
        { "@type": "ListItem", position: 3, name: "Sustainability Library", item: SITE + PATH },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function SustainabilityLibraryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />

      <section className="tools-hero">
        <div className="container">
          <nav className="tools-crumbs" aria-label="Breadcrumb">
            <Link href="/tools">Free Tools</Link>{" › "}Sustainability Library
          </nav>
          <h1>Sustainable packaging library</h1>
          <p className="lead">
            Compare packaging and pallet materials on recyclability, recycled content and reuse,
            then check the regulations and claim rules that apply. Built for packaging engineers.
            Free, no login.
          </p>
          <ul className="sl-jump">
            <li><a href="#materials">Materials</a></li>
            <li><a href="#regulations">Regulations</a></li>
            <li><a href="#claims">Green Guides claims</a></li>
            <li><a href="#standards">Labels &amp; certifications</a></li>
          </ul>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 12 }} id="materials">
        <div className="container">
          <div className="sl-intro">
            <h2>Materials</h2>
            <p>
              Each material is rated 1 to 5 on four factors. The badge shows the How2Recycle
              designation that packages of that type typically get in the U.S.; a specific
              package can differ because of its labels, inks, closures, size and colour.
            </p>
          </div>
          <SustainabilityLibrary />
          <div className="sl-legend">
            {["widely", "check", "dropoff", "notyet", "b2b"].map((k) => (
              <p key={k}>
                <span className={`sl-badge sl-badge--${H2R[k].tone}`}>{H2R[k].label}</span> {H2R[k].text}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="regulations">
        <div className="container">
          <div className="sl-intro">
            <h2>Regulations to know</h2>
            <p>Status as of {LAST_REVIEWED}. Laws change often, so check the linked source before you act.</p>
          </div>
          <div className="sl-regs">
            {REGULATIONS.map((r) => (
              <article key={r.id} className="sl-reg">
                <div className="sl-reg__top">
                  <span className="sl-card__cat">{r.region}</span>
                  <span className={`sl-badge sl-badge--${TONE[r.tone].cls}`}>{TONE[r.tone].label}</span>
                </div>
                <h3>{r.name}</h3>
                <p className="sl-reg__status">{r.status}</p>
                <p className="sl-fine"><strong>Applies to:</strong> {r.applies}</p>
                <ul>{r.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>
                <a className="csc-textlink" href={r.url} target="_blank" rel="noopener noreferrer">
                  {r.sourceLabel} &rarr;
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="claims">
        <div className="container">
          <div className="sl-intro">
            <h2>Making claims: a Green Guides cheat sheet</h2>
            <p>
              The FTC Green Guides explain how the FTC judges environmental claims under Section 5
              of the FTC Act. They aren&rsquo;t a regulation, but they&rsquo;re the starting point
              for any claim on a U.S. package, and several states write them into law.
            </p>
          </div>
          <div className="csc-tablewrap" style={{ maxHeight: "none" }}>
            <table className="tools-ref sl-claims">
              <thead>
                <tr><th>Claim</th><th>Better</th><th>Avoid</th></tr>
              </thead>
              <tbody>
                {CLAIMS.map((c) => (
                  <tr key={c.claim}>
                    <td>{c.claim}</td>
                    <td className="sl-wrap">{c.ok}</td>
                    <td className="sl-wrap">{c.avoid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="standards">
        <div className="container">
          <div className="sl-intro">
            <h2>Labels, certifications &amp; standards</h2>
          </div>
          <div className="tools-cards">
            {STANDARDS.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="tool-card">
                <span className="tool-card__tag">{s.type}</span>
                <h2>{s.name}</h2>
                <p>{s.text}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container tools-prose">
          <h2>How the ratings work</h2>
          <p>
            <strong>Recyclability</strong> reflects U.S. collection access, sortation and end
            markets, guided by How2Recycle designations and the APR Design Guide.{" "}
            <strong>Recycled content</strong> is how easily you can buy the material with recycled
            content today. <strong>Renewable source</strong> scores plant- and wood-based
            feedstock. <strong>Reuse potential</strong> scores whether the item is commonly reused,
            repaired or pooled before it is recycled.
          </p>
          <p>
            These are Betsel Stack&rsquo;s editorial ratings for general guidance across{" "}
            {MATERIALS.length} common materials. They aren&rsquo;t a certification or legal advice.
            Confirm claims with your suppliers, your legal team and the current rules where you sell.
          </p>

          <h2 style={{ marginTop: 48 }}>Common questions</h2>
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}

          <h3>Sources</h3>
          <ul className="sl-sources">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
          <p className="sl-fine">Last reviewed {LAST_REVIEWED}.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <h2>Fewer pallets, less film, less freight.</h2>
            <p>
              Betsel Stack ranks pallet patterns by cube efficiency so more product ships on every
              pallet and truck, and exports branded PDF reports.
            </p>
            <div className="cta-actions">
              <Link href="/signup" className="btn btn--primary">Start 7-day free trial</Link>
              <Link href="/tools" className="btn btn--ghost">More free tools</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
