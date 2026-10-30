// app/page.js — Betsel Stack home page
// Oct 30 2026 redesign: a simple, scroll-driven story.
//   1. Centered hero               5. Why switch
//   2. Proof strip                 6. From the field (review card, 5 stars)
//   3. What we stand for (pillars) 7. Pricing
//   4. How it works (scroll story) 8. Final CTA
// The looping product video moved to the Stack Software page (/software).
//
// Uses:
//   app/home.css
//   components/HomeMotion.js   (RevealObserver)
//   components/ScrollStory.js  + components/StoryArt.js
//   components/Testimonial.js
//   /public/story/*.jpg
//
// REAL PHOTOS for the truck and warehouse steps: upload
//   /public/story/truck-photo.jpg   and/or   /public/story/warehouse-photo.jpg
// (landscape, about 1600 x 1200). They replace the illustrations automatically
// on the next deploy. No code change needed.

import fs from "fs";
import path from "path";
import Link from "next/link";
import "./home.css";
import Testimonial from "@/components/Testimonial";
import ScrollStory from "@/components/ScrollStory";
import { RevealObserver } from "@/components/HomeMotion";

export const metadata = {
  title: { absolute: "Betsel Stack™ — Powerful Packaging Engineering, Made Practical" },
  description:
    "Pallet pattern software for packaging engineers. Create uniform or mixed-case pallet patterns in seconds, check the load in 3D, plan the trailer, and export branded reports, right in your browser. $29/month, 7-day free trial, no card.",
};

// Use a real photo when one has been uploaded to /public/story/.
function photoIfPresent(file) {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", "story", file)) ? `/story/${file}` : null;
  } catch {
    return null;
  }
}

const PROOF = [
  ["Seconds", "Case size in. Ranked patterns out."],
  ["1 click", "A branded report, ready to send."],
  ["0", "Downloads, installs, or IT tickets."],
  ["$29", "A month. Every feature included."],
];

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
  // One case, followed from the first number typed to the warehouse shelf.
  // The figures match the screenshots: 12x9x6.5 case, 48x40 pallet,
  // 17 per layer x 7 layers = 119 cases, 26 pallets in a 53' reefer.
  const STORY = [
    {
      key: "case",
      label: "Case",
      title: "It starts with one box.",
      body: "Type in your case size and choose a pallet. That's the whole setup.",
      chip: "12 × 9 × 6.5 in case · 48 × 40 pallet",
      art: "input",
    },
    {
      key: "layer",
      label: "Layer",
      title: "Every layer, mapped.",
      body: "Ranked patterns appear in seconds. Pick one and get a layer-by-layer build map your floor can follow.",
      chip: "17 cases per layer · 95.6% efficient",
      img: "/story/layer-2d.jpg",
      alt: "2D layer map of a 48 by 40 pallet with 17 cases",
    },
    {
      key: "pallet",
      label: "Pallet",
      title: "See the full pallet in 3D.",
      body: "Rotate it and check height, overhang, and stability before anyone stacks a single case.",
      chip: "119 cases · 51 in tall · 0 in overhang",
      img: "/story/pallet-3d.jpg",
      alt: "3D view of the finished pallet load, 48 by 40 by 51 inches",
    },
    {
      key: "trailer",
      label: "Trailer",
      title: "Fill the trailer. Keep it balanced.",
      body: "Drop pallets into a 53′ reefer, dry van, or custom trailer. Live counts and a center-of-mass check confirm it works.",
      chip: "26 pallets · balanced",
      img: "/story/truck-load.jpg",
      alt: "Top view of a 53 foot trailer loaded with 26 pallets, balanced",
      wide: true,
    },
    {
      key: "truck",
      label: "Truck",
      title: "On the road. No wasted space.",
      body: "A tighter pattern puts more product on every trip, so fewer trucks carry the same order.",
      chip: "3,094 cases on one truck",
      art: "truck",
      photo: photoIfPresent("truck-photo.jpg"),
      alt: "A loaded tractor-trailer on the highway",
    },
    {
      key: "dc",
      label: "Warehouse",
      title: "Arrives ready for the shelf.",
      body: "Square, stable pallets unload cleanly and fit the racking. Your report puts every number in front of the floor, the warehouse, and your customer.",
      chip: "Branded report shared in 1 click",
      art: "warehouse",
      photo: photoIfPresent("warehouse-photo.jpg"),
      alt: "Pallets stored in racking at a distribution center",
    },
  ];

  return (
    <div className="hm">
      <RevealObserver />

      {/* ============ HERO ============ */}
      <section className="hm-hero">
        <div className="hm-floor" aria-hidden="true" />
        <div className="container hm-hero-inner">
          <p className="hm-kicker rv">Betsel Stack&trade; &middot; Pallet pattern software for packaging engineers</p>
          <h1 className="hm-display rv">
            Powerful packaging engineering.
            <span className="hm-dim">Made practical.</span>
          </h1>
          <p className="hm-sub rv">
            Betsel Stack helps packaging engineers create pallet patterns
            quickly. Enter a case and a pallet, get ranked patterns in seconds,
            then check the load in 3D and send a branded report.
          </p>
          <div className="hm-actions rv">
            <Link href="/signup" className="btn btn--primary hm-btn-lg">
              Start free trial
            </Link>
            <a href="#how" className="hm-textlink">
              See how it works <span aria-hidden="true">&darr;</span>
            </a>
          </div>
          <p className="hm-fine rv">7 days free &middot; no credit card &middot; then $29/month</p>
        </div>
      </section>

      {/* ============ PROOF STRIP ============ */}
      <section className="hm-proof" aria-label="Betsel Stack at a glance">
        <div className="container hm-proof-grid">
          {PROOF.map(([b, s]) => (
            <div className="rv" key={b}><b>{b}</b><span>{s}</span></div>
          ))}
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
        </div>
      </section>

      {/* ============ HOW IT WORKS (scroll story) ============ */}
      <section className="hm-section hm-how" id="how">
        <div className="container">
          <div className="hm-head hm-head--center rv">
            <p className="hm-tag">How it works</p>
            <h2 className="hm-h2">
              From one case
              <span className="hm-dim">to a full truckload.</span>
            </h2>
            <p className="hm-lede">
              Follow a single case from your screen to the distribution center.
            </p>
          </div>
          <ScrollStory steps={STORY} />
          <div className="hm-actions rv">
            <Link href="/signup" className="btn btn--primary hm-btn-lg">
              Try it on your own case
            </Link>
            <Link href="/software#watch" className="hm-textlink">
              Watch the full tour <span aria-hidden="true">&rarr;</span>
            </Link>
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

      {/* ============ FROM THE FIELD ============ */}
      <div className="rv">
        <Testimonial />
      </div>

      {/* ============ PRICING ============ */}
      <section className="hm-section" id="pricing">
        <div className="container">
          <div className="hm-head hm-head--center rv">
            <p className="hm-tag">Pricing</p>
            <h2 className="hm-h2">One plan. Everything included.</h2>
            <p className="hm-lede">
              No tiers to decode and no features held back. Every trial starts
              with 7 free days and full access. No card needed.
            </p>
          </div>
          <div className="hm-plans">
            <div className="hm-plan rv">
              <p className="hm-plan-name">Monthly</p>
              <p className="hm-plan-price"><b>$29</b><span>/ month</span></p>
              <p className="hm-plan-note">Cancel anytime.</p>
              <Link href="/signup" className="btn btn--ghost btn--block">Start free trial</Link>
            </div>
            <div className="hm-plan hm-plan--best rv">
              <span className="hm-plan-badge">Save 20%</span>
              <p className="hm-plan-name">Annual</p>
              <p className="hm-plan-price"><b>$279</b><span>/ year</span></p>
              <p className="hm-plan-note">About $23 a month, billed once a year.</p>
              <Link href="/signup" className="btn btn--primary btn--block">Start free trial</Link>
            </div>
          </div>
          <p className="hm-center hm-fine rv">
            Both plans include the full Pallet Pattern Creator: ranked uniform
            and mixed-case patterns, 3D, trailer loading, and custom reports.{" "}
            <Link href="/pricing" className="hm-inline">Plan details</Link>
          </p>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="hm-final">
        <div className="container rv">
          <h2 className="hm-display hm-display--sm">
            Your next pallet pattern
            <span className="hm-dim">is seconds away.</span>
          </h2>
          <div className="hm-actions hm-actions--center">
            <Link href="/signup" className="btn btn--primary hm-btn-lg">
              Start free trial
            </Link>
            <Link href="/contact" className="hm-textlink">
              Talk to us <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
