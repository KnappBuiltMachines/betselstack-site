// app/page.js — Betsel Stack home page
// Nov 11 2026 rework. Four sections, top to bottom:
//   1. Hero: message on the left, animated showcase on the right
//      (Input -> Output -> 2D / 3D -> PDF Reports, swipe sideways)
//   2. What we stand for: the four pillars
//   3. Pricing (#pricing): 7-day trial, monthly and annual plans
//   4. Why switch (with the TOPS Pro / Cube-IQ comparison links)
// Pricing now lives here; /pricing stays up for links from the app.
//
// Uses:
//   app/home.css, app/showcase.css
//   components/HomeMotion.js            (RevealObserver)
//   components/showcase/HomeShowcase.js (hero showcase)

import Link from "next/link";
import "./home.css";
import "./showcase.css";
import HomeShowcase from "@/components/showcase/HomeShowcase";
import { RevealObserver } from "@/components/HomeMotion";

export const metadata = {
  title: { absolute: "Betsel Stack™ — Powerful Packaging Engineering, Made Practical" },
  description:
    "Pallet pattern software for packaging engineers. Enter your case and pallet dimensions to generate ranked patterns in seconds, view your load in 3D, and create a professional, branded PDF report. 7-day free trial, no card. $29/month.",
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
    n: "01",
    icon: "simplify",
    title: "Simplify complexity",
    body: "Enter a case and a pallet. Get ranked patterns back. Easy from day one.",
  },
  {
    n: "02",
    icon: "time",
    title: "Give engineers their time back",
    body: "No repetitive math, hand-drawn layouts, or spreadsheet rework.",
  },
  {
    n: "03",
    icon: "real",
    title: "Built for real-world packaging",
    body: "Grounded in how packaging is made, stored, and shipped.",
  },
  {
    n: "04",
    icon: "access",
    title: "Powerful tools, made accessible",
    body: "Runs in your browser. No bloat, no long onboarding, no enterprise price.",
  },
];

const CORE_FEATURES = [
  "Full Pallet Pattern Creator access",
  "Real-time 3D load visualization",
  "Mixed-case pallet patterns",
  "Standard & custom pallet sizes",
  "Custom branded PDF reports",
];

const PLANS = [
  {
    key: "monthly",
    name: "Monthly",
    price: "$29",
    per: "/month",
    sub: "7-day free trial – no credit card required",
    features: [...CORE_FEATURES, "Cancel anytime"],
    cta: "Subscribe now — $29/month",
    fine: "Billed monthly in advance. Cancel anytime from your account page.",
  },
  {
    key: "annual",
    name: "Annual",
    badge: "Save 20%",
    price: "$279",
    per: "/year",
    sub: "$23.25/month – you save $69 a year",
    features: [...CORE_FEATURES, "Rate locked for 12 months"],
    cta: "Pay yearly — $279",
    fine: "Paid in full up front and renews yearly. You can turn off renewal at any time; the prepaid year is not refundable.",
  },
];

const NOS = [
  ["No install.", "It runs in your browser on a Mac or a PC. Sign in anywhere and your patterns are there."],
  ["No IT ticket.", "Nothing to download, so nothing to approve."],
  ["No lengthy onboarding.", "If you know your case and your pallet, you already know where to start."],
  ["No sales call.", "Start a full 7-day trial yourself. No card required."],
];

function Check() {
  return (
    <span className="check" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="hm">
      <RevealObserver />

      {/* ============ HERO + SHOWCASE ============ */}
      <section className="hm-hero hm-hero--split hm-hero--show">
        <div className="hm-floor" aria-hidden="true" />
        <div className="container hm-split hm-split--show">
          <div>
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
            <p className="hm-fine rv">7 days free &middot; no credit card &middot; then $29/month</p>
          </div>
          <div className="rv">
            <HomeShowcase />
          </div>
        </div>
      </section>

      {/* ============ WHAT WE STAND FOR ============ */}
      <section className="hm-section hm-section--tight" id="why">
        <div className="container">
          <div className="hm-head rv">
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
          <ul className="hm-pillars hm-pillars--left">
            {PILLARS.map((p) => (
              <li className="hm-pillar rv" key={p.title}>
                <span className="hm-pillar-top">
                  <span className="hm-pillar-icon">{ICONS[p.icon]}</span>
                  <span className="hm-pillar-n">{p.n}</span>
                </span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="hm-section hm-section--tight hm-price" id="pricing">
        <div className="container">
          <div className="hm-price-top hm-price-top--solo">
            <div className="rv">
              <p className="hm-tag">Pricing</p>
              <h2 className="hm-h2">
                Try it free
                <span className="hm-dim">for 7 days.</span>
              </h2>
              <p className="hm-lede">
                Powerful tools shouldn&rsquo;t come with enterprise pricing. One
                plan with everything included: start with a 7-day free trial
                &mdash; no credit card required &mdash; or subscribe now and jump
                straight in. Pay monthly, or pay for the year up front and save 20%.
              </p>
            </div>
          </div>

          <div className="hm-plans2">
            {PLANS.map((p) => (
              <div className={`price-card hm-plan2 rv${p.badge ? " hm-plan2--best" : ""}`} key={p.key}>
                <div className="hm-plan2-head">
                  <span className="price-badge">{p.name}</span>
                  {p.badge && <span className="hm-plan2-save">{p.badge}</span>}
                </div>
                <div className="price-amount">
                  <span className="big">{p.price}</span>
                  <span className="per">{p.per}</span>
                </div>
                <p className="price-sub">{p.sub}</p>
                <ul className="price-list">
                  {p.features.map((f) => (
                    <li key={f}>
                      <Check />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="btn btn--primary btn--block">
                  Start 7-day free trial
                </Link>
                <Link href="/subscribe" className="btn btn--ghost btn--block" style={{ marginTop: 10 }}>
                  {p.cta}
                </Link>
                <p className="price-fine">{p.fine}</p>
              </div>
            ))}
          </div>
          <p className="price-fine hm-price-note rv">
            The free trial needs no card and works with either plan &mdash; pick
            monthly or yearly when it ends. Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--amber)" }}>
              Log in
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ============ WHY SWITCH ============ */}
      <section className="hm-section hm-section--tight">
        <div className="container hm-why">
          <div className="hm-head rv">
            <p className="hm-tag">Why switch</p>
            <h2 className="hm-h2">
              Powerful tools,
              <span className="hm-dim">without the enterprise baggage.</span>
            </h2>
          </div>
          <div className="hm-nos hm-nos--2">
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
          <div className="hm-actions hm-why-cta rv">
            <Link href="/signup" className="btn btn--primary hm-btn-lg">
              Start free trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
