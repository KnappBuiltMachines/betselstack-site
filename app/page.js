// app/page.js — Betsel Stack home page
// Nov 7 2026 simplification. Three sections, top to bottom:
//   1. Hero: message on the left, step animation on the right
//      (Case -> Layer -> Pallet -> Trailer -> Truck -> Warehouse)
//   2. Why switch (with the TOPS Pro / Cube-IQ comparison links)
//   3. What we stand for (pillars)
// Removed from the home page: proof strip, scroll story, review card,
// pricing, final CTA band. Pricing lives on /pricing.
//
// Uses:
//   app/home.css
//   components/HomeMotion.js   (RevealObserver)
//   components/HeroSteps.js    (hero animation, all renderings generated in code)

import Link from "next/link";
import "./home.css";
import HeroSteps from "@/components/HeroSteps";
import { RevealObserver } from "@/components/HomeMotion";

export const metadata = {
  title: { absolute: "Betsel Stack™ — Powerful Packaging Engineering, Made Practical" },
  description:
    "Pallet pattern software for packaging engineers. Create uniform or mixed-case pallet patterns in seconds, check the load in 3D, plan the trailer, and export branded reports, right in your browser. 7-day free trial, no card.",
};

// Brand pillars, each with a simple icon that shows the idea.
const ICONS = {
  simplify: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M5 30c4-14 8 6 12-6s7-10 9 0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" opacity=".6" />
      <path d="M26 24h16m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  time: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M9 24a15 15 0 1 0 4.4-10.6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M8 8v7h7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 15v10l6 4" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  real: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="9" y="10" width="14" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <rect x="25" y="10" width="14" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <rect x="9" y="23" width="30" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <path d="M6 37h36M10 37v4M24 37v4M38 37v4" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  ),
  access: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="5" y="9" width="38" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <path d="M5 16h38" stroke="currentColor" strokeWidth="2.6" />
      <path d="M17 26.5l5 5 9-10" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const PILLARS = [
  {
    icon: "simplify",
    title: "Simplify complexity",
    body: "Enter a case and a pallet. Get ranked patterns back. Easy from day one.",
  },
  {
    icon: "time",
    title: "Give engineers their time back",
    body: "No repetitive math, hand-drawn layouts, or spreadsheet rework.",
  },
  {
    icon: "real",
    title: "Built for real-world packaging",
    body: "Grounded in how packaging is made, stored, and shipped.",
  },
  {
    icon: "access",
    title: "Powerful tools, made accessible",
    body: "Runs in your browser. No bloat, no long onboarding, no enterprise price.",
  },
];

const NOS = [
  ["No install.", "It runs in your browser on a Mac or a PC. Sign in anywhere and your patterns are there."],
  ["No IT ticket.", "Nothing to download, so nothing to approve."],
  ["No lengthy onboarding.", "If you know your case and your pallet, you already know where to start."],
  ["No sales call.", "Start a full 7-day trial yourself. No card required."],
];

export default function HomePage() {
  return (
    <div className="hm">
      <RevealObserver />

      {/* ============ HERO ============ */}
      <section className="hm-hero hm-hero--split">
        <div className="hm-floor" aria-hidden="true" />
        <div className="container hm-split">
          <div>
            <p className="hm-kicker rv">Betsel Stack&trade; &middot; Pallet pattern software</p>
            <h1 className="hm-display rv">
              Powerful packaging engineering.
              <span className="hm-dim">Made practical.</span>
            </h1>
            <p className="hm-sub rv">
              Betsel Stack makes pallet pattern creation simple for packaging
              engineers. Enter your case and pallet dimensions to generate
              ranked patterns in seconds. View your load in 3D and create a
              professional, branded report.
            </p>
            <div className="hm-actions rv">
              <Link href="/signup" className="btn btn--primary hm-btn-lg">
                Start free trial
              </Link>
              <Link href="/software#watch" className="hm-textlink">
                Watch the tour <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <p className="hm-fine rv">7 days free &middot; no credit card</p>
          </div>
          <div className="rv">
            <HeroSteps />
          </div>
        </div>
      </section>

      {/* ============ WHY SWITCH ============ */}
      <section className="hm-section">
        <div className="container">
          <div className="hm-head rv">
            <p className="hm-tag">Why switch</p>
            <h2 className="hm-h2">
              Powerful tools,
              <span className="hm-dim">without the enterprise baggage.</span>
            </h2>
          </div>
          <div className="hm-nos">
            {NOS.map(([t, d]) => (
              <div className="hm-no rv" key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <p className="hm-compare rv">
            Coming from desktop software? See how it compares with{" "}
            <Link href="/compare/tops-pro-alternative">TOPS Pro</Link> and{" "}
            <Link href="/compare/cube-iq-alternative">Cube-IQ</Link>.
          </p>
        </div>
      </section>

      {/* ============ WHAT WE STAND FOR ============ */}
      <section className="hm-section" id="why">
        <div className="container">
          <div className="hm-head hm-head--center rv">
            <p className="hm-tag">What we stand for</p>
            <h2 className="hm-h2">
              Focused by design.
              <span className="hm-dim">Powerful where it matters.</span>
            </h2>
            <p className="hm-lede">
              Packaging decisions are complex. The software you use to make them
              shouldn&rsquo;t be.
            </p>
          </div>
          <ul className="hm-pillars">
            {PILLARS.map((p) => (
              <li className="hm-pillar rv" key={p.title}>
                <span className="hm-pillar-icon">{ICONS[p.icon]}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
          <div className="hm-actions hm-pillars-cta rv">
            <Link href="/signup" className="btn btn--primary hm-btn-lg">
              Start free trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
