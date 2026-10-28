// app/page.js — Betsel Stack home page
// Oct 2026: brand positioning pass ("Powerful packaging engineering — made
// practical.") + looping product video in the hero.
// Uses:
//   app/home.css
//   components/HomeMotion.js   (RevealObserver, LoopVideo)
//   components/Testimonial.js
//   /public/betsel-home-loop.mp4 + /public/betsel-home-loop-poster.jpg
//   /public/screenshots/*.jpg

import Link from "next/link";
import "./home.css";
import Testimonial from "@/components/Testimonial";
import { RevealObserver, LoopVideo } from "@/components/HomeMotion";

export const metadata = {
  title: { absolute: "Betsel Stack™ — Powerful Packaging Engineering, Made Practical" },
  description:
    "Pallet pattern software for packaging engineers. Create uniform or mixed-case pallet patterns in seconds, check the load in 3D, plan the trailer, and export branded reports, right in your browser. $29/month, 7-day free trial, no card.",
};

// The four things the brand promises, each backed by something the product
// actually does.
const PILLARS = [
  {
    n: "01",
    title: "Simplify complexity",
    body: "Enter your case and pallet dimensions and get ranked pallet patterns back. Easy to pick up, even on your first day with the software.",
    proof: "Case in. Ranked patterns out.",
  },
  {
    n: "02",
    title: "Give engineers their time back",
    body: "No repetitive calculations, hand-drawn layouts, spreadsheet work, or avoidable rework.",
    proof: "Ti-Hi, overhang & stability, calculated for you",
  },
  {
    n: "03",
    title: "Built for real-world packaging",
    body: "Every tool is grounded in how packaging is designed, manufactured, warehoused, and shipped.",
    proof: "Corrugate flutes · full, half & quarter pallets · 53′ reefers",
  },
  {
    n: "04",
    title: "Powerful tools, made accessible",
    body: "Focused software without unnecessary features, lengthy onboarding, or enterprise-level complexity.",
    proof: "Runs in your browser · $29/month",
  },
];

const CHAPTERS = [
  {
    tag: "Pattern engine",
    title: ["Start from the best pattern.", "Not a blank screen."],
    body: "Enter a case and a pallet. Betsel Stack does the repetitive math and puts the strongest layout at the top, ranked by cubic efficiency, case support, and stability.",
    img: "/screenshots/builder.jpg",
    alt: "Pallet Pattern Builder showing a ranked pattern list and a 3D unit load",
  },
  {
    tag: "Layer planning",
    title: ["Every layer,", "called out."],
    body: "Step through the load one layer at a time, interlocked or alternating, with every case placed and turned exactly as it ships. A build map your floor can follow, with less rework.",
    img: "/screenshots/layers-2d.jpg",
    alt: "Layer-by-layer 2D build map with case placement",
  },
  {
    tag: "Uniform or mixed",
    title: ["One case size or several.", "Your call."],
    body: "Build a uniform pallet from a single case size, or combine different case sizes on one pallet, layer by layer. Either way, see the finished unit load in 3D before anyone builds it.",
    img: "/screenshots/mixed-3d.jpg",
    alt: "3D view of a mixed-case pallet with three case sizes",
    narrow: true,
  },
  {
    tag: "Trailer loading",
    title: ["Fill the trailer.", "Keep it balanced."],
    body: "Drop pallets into a 53′ reefer, 53′ dry van, 48′ trailer, or custom trailer. Live counts and a center-of-mass check tell you it works.",
    img: "/screenshots/truck-load.jpg",
    alt: "Trailer top view loaded with 26 pallets, balanced",
    wide: true,
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
        <div className="container hm-hero-grid">
        <div className="hm-hero-inner">
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
            <Link href="/software#watch" className="hm-textlink">
              Watch the full tour <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <p className="hm-fine rv">7 days free &middot; no credit card &middot; then $29/month</p>
        </div>
        <div className="hm-hero-stage rv">
          <div className="hm-video hm-video--hero">
            <LoopVideo
              src="/betsel-home-loop.mp4"
              poster="/betsel-home-loop-poster.jpg"
              label="Betsel Stack in use: size a case, generate pallet patterns, compare them in 3D, plan the truck load, and export a branded report"
              eager
              control
            />
          </div>
          <ol className="hm-steps" aria-label="What the video shows">
            <li><b>01</b> Size the case</li>
            <li><b>02</b> Generate patterns</li>
            <li><b>03</b> Compare in 3D</li>
            <li><b>04</b> Rotate &amp; inspect</li>
            <li><b>05</b> Plan the truck</li>
            <li><b>06</b> Export a report</li>
          </ol>
        </div>
        </div>
      </section>

      {/* ============ PROOF STRIP ============ */}
      <section className="hm-proof">
        <div className="container hm-proof-grid">
          <div className="rv"><b>Seconds</b><span>from case size to ranked patterns</span></div>
          <div className="rv"><b>1 click</b><span>to a branded, customer-ready report</span></div>
          <div className="rv"><b>0</b><span>software to install</span></div>
          <div className="rv"><b>$29</b><span>a month, or $279 a year</span></div>
        </div>
      </section>

      {/* ============ POSITIONING ============ */}
      <section className="hm-section" id="why">
        <div className="container hm-pos">
          <div className="hm-pos-intro rv">
            <p className="hm-tag">What we stand for</p>
            <h2 className="hm-h2">
              Focused by design.
              <br />
              <span className="hm-dim">Powerful where it matters.</span>
            </h2>
            <p className="hm-lede">
              Packaging decisions are complex. The software you use to make them
              shouldn&rsquo;t be. Every feature in Betsel Stack earns its place
              by saving an engineer real time on a real load.
            </p>
          </div>
          <ol className="hm-pillars">
            {PILLARS.map((p) => (
              <li className="hm-pillar rv" key={p.n}>
                <span className="hm-pillar-n">{p.n}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                  <p className="hm-pillar-proof">{p.proof}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ CHAPTERS ============ */}
      {CHAPTERS.map((c, i) => (
        <section className={`hm-chapter ${i % 2 ? "hm-chapter--alt" : ""}`} key={c.tag}>
          <div className="container">
            <div className="hm-head hm-head--center rv">
              <p className="hm-tag">{c.tag}</p>
              <h2 className="hm-h2">
                {c.title[0]}
                <br />
                <span className="hm-dim">{c.title[1]}</span>
              </h2>
              <p className="hm-lede">{c.body}</p>
            </div>
            <figure className={`hm-shot rv ${c.wide ? "hm-shot--wide" : ""} ${c.narrow ? "hm-shot--narrow" : ""}`}>
              <img src={c.img} alt={c.alt} loading="lazy" decoding="async" />
            </figure>
          </div>
        </section>
      ))}

      {/* ============ REPORTS ============ */}
      <section className="hm-section hm-watch">
        <div className="container">
          <div className="hm-head hm-head--center rv">
            <p className="hm-tag">Reports</p>
            <h2 className="hm-h2">
              From first pattern
              <br />
              <span className="hm-dim">to a branded report.</span>
            </h2>
            <p className="hm-lede">
              Build it, check it, load it, and export a pallet pattern
              engineering report with dimensions, efficiency, stability, and
              weights, ready for your customer or your floor. No retyping
              numbers into a spreadsheet.
            </p>
          </div>
          <p className="hm-center rv">
            <Link href="/software#watch" className="hm-textlink">
              Watch the full guided tour <span aria-hidden="true">&rarr;</span>
            </Link>
          </p>
        </div>
      </section>

      {/* ============ NO BAGGAGE ============ */}
      <section className="hm-section">
        <div className="container">
          <div className="hm-head rv">
            <p className="hm-tag">Why switch</p>
            <h2 className="hm-h2">
              Powerful tools,
              <br />
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

      {/* ============ TESTIMONIAL ============ */}
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
