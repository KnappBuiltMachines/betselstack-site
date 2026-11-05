import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Founders Corner",
  description:
    "A note from James K, CEO & Founder of Betsel Stack: where the platform stands today, the pillars behind it, and the packaging engineering tools coming next.",
  alternates: { canonical: "/founders-corner" },
};

const PROGRESS = [
  {
    title: "A pattern engine built for real loads",
    body: "Enter case and pallet dimensions and Betsel Stack generates and ranks viable pallet patterns in seconds, from 100% column stacks to interlocked layers, for uniform or mixed-case loads.",
  },
  {
    title: "See it before you ship it",
    body: "Every pattern renders in 3D, with trailer load planning for reefers, dry vans and custom trailer dimensions, so the decision gets made at the desk instead of on the dock.",
  },
  {
    title: "Reports that are ready to hand off",
    body: "Branded PDF reports for standard and mixed loads, saved to the cloud alongside your patterns and settings, so your work is there whenever you log back in.",
  },
  {
    title: "On the line, not just at the desk",
    body: "The mobile companion puts saved pallet patterns in your pocket for quick checks on the go and down at the manufacturing line.",
  },
];

const PILLARS = [
  {
    n: "01",
    title: "Simplify complexity",
    body: "Packaging problems are complex. The tools that solve them should not be. We take hard problems back to the basics so the answer is clear and intuitive.",
  },
  {
    n: "02",
    title: "Give engineers their time back",
    body: "Hours spent fighting software are hours not spent engineering. Betsel Stack is built to get you from question to answer quickly.",
  },
  {
    n: "03",
    title: "Build for real-world packaging",
    body: "Our team has spent decades in the field. Every feature starts with a problem we have faced ourselves, on real lines, with real product.",
  },
  {
    n: "04",
    title: "Make powerful tools accessible",
    body: "No unnecessary features, no lengthy onboarding, no enterprise-level complexity. Professional capability at a price any engineer can justify.",
  },
];

const ROADMAP = [
  {
    tag: "Live now",
    title: "Pallet patterns",
    body: "The foundation of the platform, and the first tool in the Betsel Stack lineup. We keep refining the engine with every release.",
  },
  {
    tag: "In the pipeline",
    title: "Packaging specifications",
    body: "A home for drawings and material specs in the cloud, with the ability to turn them into customer-ready templates without starting from scratch.",
  },
  {
    tag: "In the pipeline",
    title: "Packaging qualification",
    body: "Tools to plan and organize packaging qualification work, built around how engineers actually run it.",
  },
  {
    tag: "On the horizon",
    title: "More to come",
    body: "There is a long list of problems we want to make simple. Pallet patterns are only the beginning.",
  },
];

export default function FoundersCornerPage() {
  return (
    <>
      {/* INTRO */}
      <section className="section" style={{ paddingBottom: 48 }}>
        <div className="container">
          <p className="eyebrow">Founders Corner</p>
          <h1 className="section-title" style={{ maxWidth: "22ch" }}>
            Powerful where it matters. Simple everywhere else.
          </h1>
          <p className="lead" style={{ maxWidth: "62ch" }}>
            A note from our founder on what we have built so far, the
            principles behind it, and what is coming next for the packaging
            engineering community.
          </p>
        </div>
      </section>

      {/* IMAGE */}
      <section style={{ paddingBottom: 72 }}>
        <div className="container">
          <div
            style={{
              borderRadius: "var(--radius)",
              overflow: "hidden",
              border: "1px solid var(--line-soft)",
            }}
          >
            <Image
              src="/founders-corner-team.jpg"
              alt="The Betsel Stack team gathered around a laptop showing the Betsel Stack logo"
              width={1800}
              height={1000}
              priority
              sizes="(max-width: 1160px) 100vw, 1160px"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* LETTER */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ maxWidth: "68ch" }}>
            <p className="eyebrow">A letter from the founder</p>
            <h2 className="section-title">Back to the basics</h2>
            <div style={{ marginTop: 28, lineHeight: 1.7 }}>
              <p>
                I spent more than twenty years as a packaging engineer before
                starting Betsel Stack. In that time I learned something that
                has shaped every decision we make here: the hardest problems
                get easier the moment you strip them back to the basics. Most
                of the tools I used along the way did the opposite. They
                buried simple answers under layers of complexity.
              </p>
              <p>
                Betsel Stack exists to change that. I built it alongside a team
                of seasoned engineers who have worked across a wide range of
                industries. We have lived the deadlines, the line trials and
                the late-night spec revisions. We know what packaging engineers
                need because we have needed it ourselves.
              </p>
              <p>
                Our first release focuses on pallet patterns, and I am proud of
                what we have accomplished. In a short time we have gone from an
                idea to a platform engineers rely on, and the response has been
                humbling. Every new client who signs up tells us we are on the
                right track.
              </p>
              <p>
                But I want to be clear: this is only the beginning. There are
                more tools in the pipeline, and they are built on the same
                promise. Powerful capability, made practical. No bloat, no
                learning curve, no complexity for its own sake.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRESS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <p className="eyebrow">Progress so far</p>
          <h2 className="section-title">What we have built</h2>
          <div className="grid grid-2" style={{ marginTop: 36 }}>
            {PROGRESS.map((p) => (
              <article className="card" key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <p className="eyebrow">Focused by design</p>
          <h2 className="section-title">The pillars of Betsel Stack</h2>
          <div className="grid grid-4" style={{ marginTop: 36 }}>
            {PILLARS.map((p) => (
              <article className="card" key={p.n}>
                <span
                  className="card-index"
                  style={{ color: "var(--amber)", fontFamily: "var(--display)" }}
                >
                  {p.n}
                </span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <p className="eyebrow">The road ahead</p>
          <h2 className="section-title">What is coming next</h2>
          <div className="grid grid-2" style={{ marginTop: 36 }}>
            {ROADMAP.map((r) => (
              <article className="card" key={r.title}>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: r.tag === "Live now" ? "var(--amber)" : "var(--silver)",
                    fontWeight: 600,
                  }}
                >
                  {r.tag}
                </p>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING + SIGNATURE */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ maxWidth: "68ch", lineHeight: 1.7 }}>
            <p>
              To every engineer who has trusted us with their work so far:
              thank you. I am excited to have you on this journey with us. Our
              goal is simple. We want to make the work, and the life, of the
              packaging engineer easier, simpler and less complicated. We have
              accomplished a lot, and there is so much more to be done.
            </p>
            <p>The best is still ahead.</p>
            <div
              style={{
                marginTop: 40,
                paddingTop: 24,
                borderTop: "1px solid var(--line)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--display)",
                  fontSize: 28,
                  fontWeight: 600,
                  color: "var(--text)",
                }}
              >
                James K
              </p>
              <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
                CEO &amp; Founder, Betsel Stack
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <p
              className="eyebrow"
              style={{ justifyContent: "center", display: "flex" }}
            >
              Join the journey
            </p>
            <h2>Start with pallet patterns today</h2>
            <p>Seven days of full access, no credit card required.</p>
            <div className="cta-actions">
              <Link href="/signup" className="btn btn--primary">
                Start free trial
              </Link>
              <Link href="/software" className="btn btn--ghost">
                See the software
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
