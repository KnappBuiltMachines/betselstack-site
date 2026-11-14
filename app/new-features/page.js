// app/new-features/page.js — "New Features" tab
// Showcases tools as they're released. First up: Packaging Qualification Plans (Beta).
// Screenshots live in /public/new-features/ and show sample data.

import Link from "next/link";
import "./new-features.css";

export const metadata = {
  title: "New Features",
  description:
    "New in Betsel Stack: Packaging Qualification Plans (Beta). Build numbered, searchable qualification plans with risk levels, test recommendations, line trials, electronic approvals and PDF export — included with your subscription.",
  alternates: { canonical: "/new-features" },
};

const STEPS = [
  {
    tag: "Organized",
    title: "Every plan numbered and searchable",
    body:
      "Each plan gets a unique number (QP-2026-0001, QP-2026-0002…) and a revision letter the moment it's saved. Find any plan by number, title, customer, product or SKU, and see its risk level and status at a glance.",
    img: "/new-features/qp-list.jpg",
    w: 1662,
    h: 977,
    alt: "Qualification Plans list showing numbered plans with revision, customer, product, risk level and status",
  },
  {
    tag: "Guided",
    title: "Answer a few questions. Get a risk level and a test plan.",
    body:
      "A step-by-step form walks through the product, packaging materials and distribution environment. Betsel Stack scores the risk and recommends tests against recognized standards such as ASTM and ISTA, with sample sizes. Keep what fits, uncheck what doesn't, and add your own.",
    why: "The risk score is shown factor by factor, so you can see exactly how it was reached.",
    img: "/new-features/qp-review.jpg",
    w: 1662,
    h: 1502,
    alt: "Risk assessment showing points per factor and a list of recommended tests with ASTM and ISTA standards",
  },
  {
    tag: "Real-world",
    title: "Line trials, not just lab tests",
    body:
      "Qualification doesn't stop at the lab. Plans include production-line trials suggested from your materials — like running aluminum cans through the filler and seamer — with the line, target speed, run size, what to measure and how to judge it.",
    img: "/new-features/qp-line-trials.jpg",
    w: 1662,
    h: 1240,
    alt: "Line trials step suggesting a can filling and double-seam trial, a cartoning trial and a palletizing trial",
  },
  {
    tag: "Approved",
    title: "Electronic sign-off with date and time",
    body:
      "Submit a plan for approval and each role signs electronically. The name, account and date and time are recorded automatically, and the plan becomes Approved when every role has signed. The approvals table in the document fills itself in — no blank signature lines.",
    img: "/new-features/qp-approvals.jpg",
    w: 1662,
    h: 773,
    alt: "Approved plan showing three electronic signatures with names and timestamps",
  },
  {
    tag: "Closed out",
    title: "Record results and complete the qualification",
    body:
      "Once a plan is approved, record the result of every test and line trial — pass, fail or conditional, with the date, what was measured and who ran it. Finish with a qualification outcome and notes. Need a change later? Start a new revision and the history is kept.",
    img: "/new-features/qp-results.jpg",
    w: 1662,
    h: 1190,
    alt: "Results table for recording pass or fail, date, measurements and tester for each test and line trial",
  },
  {
    tag: "Ready to share",
    title: "A complete plan document, exported to PDF",
    body:
      "Every plan becomes a clean, numbered document: purpose, scope, background, product, packaging materials, distribution environment, risk assessment, tests, line trials, acceptance criteria, approvals, results and revision history. Export it to PDF in one click.",
    img: "/new-features/qp-document.jpg",
    w: 1662,
    h: 1390,
    alt: "Qualification plan document with plan number, revision, purpose, scope and background sections",
  },
];

export default function NewFeaturesPage() {
  return (
    <div className="nf">
      {/* ---------- intro ---------- */}
      <section className="section nf-hero">
        <div className="container">
          <p className="eyebrow">New Features</p>
          <h1 className="nf-title">More packaging tools, built for the people who need them.</h1>
          <p className="lead">
            Betsel Stack started with pallet patterns. Now the team is building the next set of
            tools packaging engineers reach for every day — simple, practical, and ready for
            real-world work. Here&rsquo;s what&rsquo;s new.
          </p>
        </div>
      </section>

      {/* ---------- feature: qualification plans ---------- */}
      <section className="nf-feature">
        <div className="container">
          <div className="nf-feature__head">
            <div className="nf-badges">
              <span className="nf-badge nf-badge--beta">Beta</span>
              <span className="nf-badge">Included with your subscription</span>
            </div>
            <h2 className="nf-h2">Packaging Qualification Plans</h2>
            <p className="nf-sub">
              Create complete, controlled packaging qualification plans in minutes instead of
              starting from a blank document — from scope and risk through testing, line trials,
              sign-off and results.
            </p>
          </div>

          <div className="nf-beta">
            <strong>Now in Beta.</strong> Qualification Plans is ready to use today, and the team is
            actively improving it — expect new options, refinements and more standards over the
            coming months. Have an idea or spot something? Tell us at{" "}
            <a href="mailto:team@betselstack.com">team@betselstack.com</a>.
          </div>

          <div className="nf-included">
            <div>
              <h3>Included with Betsel Stack</h3>
              <p>
                No add-on and no extra charge. Every Betsel Stack subscription — including the
                7-day free trial — includes Qualification Plans alongside the Pallet Pattern
                Creator. Open it from your Account page.
              </p>
            </div>
            <div className="nf-included__btns">
              <Link href="/qualification-plans" className="btn btn--primary">Open Qualification Plans</Link>
              <Link href="/signup" className="btn btn--ghost">Start free trial</Link>
            </div>
          </div>

          <div className="nf-steps">
            {STEPS.map((s, i) => (
              <article key={s.title} className="nf-step">
                <div className="nf-step__text">
                  <p className="nf-step__tag">
                    <span>{String(i + 1).padStart(2, "0")}</span> {s.tag}
                  </p>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  {s.why && <p className="nf-step__why">{s.why}</p>}
                </div>
                <figure className="nf-shot">
                  <a href={s.img} target="_blank" rel="noopener" aria-label={`Open full-size screenshot: ${s.title}`}>
                    <img src={s.img} width={s.w} height={s.h} alt={s.alt} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
                  </a>
                  <figcaption>Click to enlarge</figcaption>
                </figure>
              </article>
            ))}
          </div>

          <div className="nf-inside">
            <h3>What&rsquo;s in every plan</h3>
            <ul>
              <li>Unique plan number &amp; revision</li>
              <li>Purpose, scope &amp; background</li>
              <li>Product description</li>
              <li>Packaging materials list</li>
              <li>Distribution environment</li>
              <li>Risk assessment</li>
              <li>Recommended tests &amp; sample sizes</li>
              <li>Line trials</li>
              <li>Acceptance criteria</li>
              <li>Electronic approvals</li>
              <li>Results &amp; conclusion</li>
              <li>Revision history &amp; PDF export</li>
            </ul>
          </div>

          <p className="nf-note">Screenshots show sample data.</p>
        </div>
      </section>

      {/* ---------- more coming ---------- */}
      <section className="section">
        <div className="container">
          <div className="cta-band nf-more">
            <p className="eyebrow">More on the way</p>
            <h2>Qualification Plans is one of many.</h2>
            <p>
              The Betsel Stack team is building more tools to make packaging engineering easier,
              faster and more accessible. New features will appear here as they&rsquo;re released.
            </p>
            <div className="nf-included__btns" style={{ justifyContent: "center" }}>
              <Link href="/signup" className="btn btn--primary">Try Betsel Stack free</Link>
              <Link href="/contact" className="btn btn--ghost">Suggest a feature</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
