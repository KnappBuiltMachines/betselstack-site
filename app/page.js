// app/page.js — Betsel Stack home page (showcase redesign, Oct 2026)
// Replaces the ENTIRE contents of app/page.js.
// Needs these new files next to it:
//   app/home.css
//   components/HeroPallet.js
//   components/TiHiDemo.js
//   components/HomeMotion.js
// Uses existing assets only: /screenshots/*.jpg and the software tour video.

import Link from "next/link";
import "./home.css";
import HeroPallet from "@/components/HeroPallet";
import TiHiDemo from "@/components/TiHiDemo";
import Testimonial from "@/components/Testimonial";
import { RevealObserver, LoopVideo } from "@/components/HomeMotion";

export const metadata = {
  title: { absolute: "Betsel Stack™ — Pallet Pattern Software in Your Browser" },
  description:
    "Fit more on every pallet. Betsel Stack ranks the best pallet patterns for your case in seconds, shows the load in 3D, and plans the trailer — right in your browser. $29/month, 7-day free trial, no card.",
};

const CHAPTERS = [
  {
    tag: "Pattern engine",
    title: ["Start from the best pattern.", "Not a blank screen."],
    body: "Enter a case and a pallet. Betsel Stack returns 50+ layouts, ranked by cubic efficiency, case support, and stability.",
    img: "/screenshots/builder.jpg",
    alt: "Pallet Pattern Builder showing a ranked pattern list and a 3D unit load",
  },
  {
    tag: "Layer planning",
    title: ["Every layer,", "called out."],
    body: "Step through the load one layer at a time, interlocked or alternating, with every case placed and turned exactly as it ships.",
    img: "/screenshots/layers-2d.jpg",
    alt: "Layer-by-layer 2D build map with case placement",
  },
  {
    tag: "Mixed-case loads",
    title: ["Real shipments", "aren’t one SKU."],
    body: "Stack different case sizes on one pallet, layer by layer, and see the finished unit load in 3D before anyone builds it.",
    img: "/screenshots/mixed-3d.jpg",
    alt: "3D view of a mixed-case pallet with three case sizes",
  },
  {
    tag: "Trailer loading",
    title: ["Fill the trailer.", "Keep it balanced."],
    body: "Drop pallets into a 53′ reefer, dry van, or custom trailer. Live counts and a center-of-mass check tell you it works.",
    img: "/screenshots/truck-load.jpg",
    alt: "Trailer top view loaded with 26 pallets, balanced",
    wide: true,
  },
];

const NOS = [
  ["No install.", "It runs in your browser, on a Mac or a PC."],
  ["No license keys.", "Sign in from any computer and your patterns are there."],
  ["No IT ticket.", "Nothing to download, so nothing to approve."],
  ["No sales call.", "Start a full 7-day trial yourself. No card required."],
];

export default function HomePage() {
  return (
    <div className="hm">
      <RevealObserver />

      {/* ============ HERO ============ */}
      <section className="hm-hero">
        <div className="hm-floor" aria-hidden="true" />
        <div className="container hm-hero-inner">
          <p className="hm-kicker rv">Betsel Stack&trade; Pallet Pattern Creator</p>
          <h1 className="hm-display rv">
            Fit more on every pallet.
            <span className="hm-dim">Ship fewer trucks.</span>
          </h1>
          <p className="hm-sub rv">
            The best pallet patterns for your case, ranked in seconds. Checked
            in 3D. Loaded into the trailer. All in your browser.
          </p>
          <div className="hm-actions rv">
            <Link href="/signup" className="btn btn--primary hm-btn-lg">
              Start free trial
            </Link>
            <a href="#try" className="hm-textlink">
              Try it right here <span aria-hidden="true">&darr;</span>
            </a>
          </div>
          <p className="hm-fine rv">7 days free &middot; no credit card &middot; then $29/month</p>
        </div>
        <div className="hm-hero-stage rv">
          <HeroPallet />
        </div>
      </section>

      {/* ============ PROOF STRIP ============ */}
      <section className="hm-proof">
        <div className="container hm-proof-grid">
          <div className="rv"><b>Seconds</b><span>from case size to ranked patterns</span></div>
          <div className="rv"><b>50+</b><span>patterns scored for every case</span></div>
          <div className="rv"><b>0</b><span>software to install</span></div>
          <div className="rv"><b>$29</b><span>a month, or $279 a year</span></div>
        </div>
      </section>

      {/* ============ TRY IT ============ */}
      <section className="hm-section" id="try">
        <div className="container">
          <div className="hm-head rv">
            <p className="hm-tag">Try it now</p>
            <h2 className="hm-h2">Type a case. Watch it stack.</h2>
            <p className="hm-lede">
              No sign-up for this part. Change any number and the layer redraws
              instantly.
            </p>
          </div>
          <div className="rv">
            <TiHiDemo />
          </div>
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
            <figure className={`hm-shot rv ${c.wide ? "hm-shot--wide" : ""}`}>
              <img src={c.img} alt={c.alt} loading="lazy" decoding="async" />
            </figure>
          </div>
        </section>
      ))}

      {/* ============ WATCH ============ */}
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
              weights, ready for your customer or your floor.
            </p>
          </div>
          <div className="hm-video rv">
            <LoopVideo
              src="/betsel-software-tour.mp4"
              poster="/betsel-software-tour-poster.jpg"
              label="Betsel Stack building a pallet pattern, checking it in 3D, loading a trailer, and exporting a report"
            />
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
              Pallet software,
              <br />
              <span className="hm-dim">without the baggage.</span>
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

      {/* ============ ORIGIN ============ */}
      <section className="hm-origin">
        <div className="container hm-origin-inner rv">
          <p className="hm-tag">Who builds it</p>
          <h2 className="hm-h2">Made by people who build packaging machines.</h2>
          <p className="hm-lede">
            Betsel Stack comes from the team at Knapp Built Machines, a
            family-owned maker of agricultural packaging and vegetable
            processing equipment in Hammonton, New Jersey. We spend our days
            around packing lines, cases, and pallets, and we built Betsel Stack
            around the questions packaging engineers actually ask.
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
            <p className="hm-lede">Every trial starts with 7 free days and full access. No card needed.</p>
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
            Both plans include the full Pallet Pattern Creator: ranked patterns,
            3D, mixed cases, trailer loading, and custom reports.{" "}
            <Link href="/pricing" className="hm-inline">Plan details</Link>
          </p>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="hm-final">
        <div className="container rv">
          <h2 className="hm-display hm-display--sm">
            Your next pallet pattern
            <span className="hm-dim">is a few seconds away.</span>
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
