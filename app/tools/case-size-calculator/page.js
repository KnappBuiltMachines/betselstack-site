// app/tools/case-size-calculator/page.js — Free Case Size Calculator
// Public, no-login tool. The calculator itself is a client component
// (components/tools/CaseSizeCalculator.js); everything else on this page is
// plain server-rendered text so search engines can read it.

import Link from "next/link";
import "../tools.css";
import CaseSizeCalculator from "@/components/tools/CaseSizeCalculator";
import { CARTON_STYLES } from "@/lib/case-size/calc";

const SITE = "https://www.betselstack.com";
const PATH = "/tools/case-size-calculator";

export const metadata = {
  title: { absolute: "Free Case Size Calculator — Carton Dimensions | Betsel Stack" },
  description:
    "Free case size calculator for packaging engineers. Enter unit size and count to get every case arrangement with outside dimensions, weight and cube.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Free Case Size Calculator for Packaging Engineers",
    description:
      "Size a shipping case from your unit dimensions: boxes, jars, cans and bottles. Every arrangement, outside dimensions, weight and cube. No login.",
    url: SITE + PATH,
    type: "website",
  },
};

const FAQ = [
  {
    q: "What is the difference between inside and outside case dimensions?",
    a: "Inside dimensions (ID) are the space your units need: the unit grid plus clearance. Outside dimensions (OD) add the corrugated board walls and the extra board where flaps overlap, so OD is always larger. Use ID to talk about fit and OD for pallet patterns, shelf space and shipping.",
  },
  {
    q: "How much clearance should I add?",
    a: "The calculator starts at 1/8 inch (3 mm) per dimension, which is a common starting point for a slip fit. Tighter clearance can let units rub or crush the case; looser clearance lets them shift. Adjust it for your product and confirm with your box supplier.",
  },
  {
    q: "Which flute should I use?",
    a: "E-flute is thin and prints well, so it is common for retail-ready and display packaging. B-flute gives good puncture resistance for smaller cases. C-flute is the most common general shipping board. BC double wall is used for heavier loads and tall stacks. Your box supplier can recommend a board grade for your weight and stacking needs.",
  },
  {
    q: "Does this calculator tell me which case is best on a pallet?",
    a: "No. This free tool sizes the case. Betsel Stack, the full pallet pattern software, compares every case option on your pallet, ranks the pallet patterns, shows the load in 3D and exports branded PDF reports. You can try it free for 7 days.",
  },
];

const JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Case Size Calculator",
      url: SITE + PATH,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web browser",
      isAccessibleForFree: true,
      description:
        "Free case size calculator: enter a box-shaped or cylindrical unit and units per case to get every case arrangement with outside dimensions, estimated weight and cube.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Free Tools", item: `${SITE}/tools` },
        { "@type": "ListItem", position: 3, name: "Case Size Calculator", item: SITE + PATH },
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

export default function CaseSizeCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />

      <section className="tools-hero">
        <div className="container">
          <nav className="tools-crumbs" aria-label="Breadcrumb">
            <Link href="/tools">Free Tools</Link>{" \u203a "}Case Size Calculator
          </nav>
          <h1>Case size calculator</h1>
          <p className="lead">
            Enter your unit (a box shape, or a cylinder like a jar, can or bottle) and how many
            go in a case. You get every way to arrange them, with the case&rsquo;s outside
            dimensions, estimated weight and cube. Free, no login.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 12 }}>
        <div className="container">
          <CaseSizeCalculator />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container tools-prose">
          <h2>How the case size calculator works</h2>
          <p>
            <strong>1. Arrangements.</strong> The calculator finds every way to split your
            units per case into a grid of length &times; width &times; layers, up to the maximum
            layers you allow. Box-shaped units are tried both ways in the footprint. Cylinders
            are placed in a square grid using the diameter.
          </p>
          <p>
            <strong>2. Inside dimensions.</strong> For each arrangement, the inside of the case
            is the unit grid plus your clearance on each dimension.
          </p>
          <p>
            <strong>3. Outside dimensions.</strong> The carton style and board thickness
            (t) set how much is added to get the outside size:
          </p>
          <table className="tools-ref">
            <thead>
              <tr><th>Carton style</th><th>Added to inside dimensions</th></tr>
            </thead>
            <tbody>
              {Object.values(CARTON_STYLES).map((s) => (
                <tr key={s.short}><td>{s.label}</td><td>{s.allowance}</td></tr>
              ))}
            </tbody>
          </table>
          <p>
            <strong>4. Weight and cube.</strong> Case weight is your units plus an estimate of
            the corrugated board, based on the blank size for that carton style and typical
            board weights. Cube is the outside volume in cubic feet.
          </p>

          <h3>Board thickness reference</h3>
          <table className="tools-ref">
            <thead>
              <tr><th>Board</th><th>Approx. thickness</th></tr>
            </thead>
            <tbody>
              <tr><td>E-Flute</td><td>1/16&Prime; (about 1.6 mm)</td></tr>
              <tr><td>B-Flute</td><td>1/8&Prime; (about 3.2 mm)</td></tr>
              <tr><td>C-Flute</td><td>5/32&Prime; (about 4 mm)</td></tr>
              <tr><td>BC Double Wall</td><td>1/4&Prime; (about 6.4 mm)</td></tr>
            </tbody>
          </table>
          <p>
            Every result is an engineering estimate. Actual outside dimensions depend on your
            supplier&rsquo;s board and scoring, so confirm final sizes with your box supplier.
          </p>

          <h2 style={{ marginTop: 48 }}>Common questions</h2>
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <h2>Got your case size? Now build the pallet.</h2>
            <p>
              Betsel Stack creates ranked pallet patterns from your case and pallet
              dimensions, shows the load in 3D, and exports branded PDF reports.
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
