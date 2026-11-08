// app/founders-corner/page.js — Founders Corner
// Nov 8 2026: a single letter from the CEO & Founder. No photo, no extra sections.

import Link from "next/link";

export const metadata = {
  title: "Founders Corner",
  description:
    "Why I built Betsel Stack: a letter from James K, CEO & Founder, on building simple, powerful tools for packaging engineers.",
  alternates: { canonical: "/founders-corner" },
};

export default function FoundersCornerPage() {
  return (
    <section className="section fc">
      <div className="container">
        <article className="fc-letter">
          <p className="eyebrow">Founders Corner</p>
          <h1 className="fc-title">Why I Built Betsel Stack</h1>

          <div className="fc-body">
            <p>
              After more than 20 years in packaging engineering, I learned one
              important lesson: the best solutions are often the simplest.
            </p>
            <p>
              Too many tools make simple tasks harder than they need to be. They
              add complexity when what engineers really need is a faster, easier
              way to get the job done.
            </p>
            <p className="fc-strong">That&rsquo;s why I built Betsel Stack.</p>
            <p>
              Alongside a team of experienced engineers, we created a platform
              built around real packaging challenges. We&rsquo;ve worked through
              the deadlines, production trials, design changes, and everything
              else that comes with the job. We understand what packaging
              engineers need because we&rsquo;ve been there ourselves.
            </p>
            <p>
              Our first tool focuses on pallet patterns. What started as an idea
              has grown into a platform that is helping engineers work faster and
              smarter. We&rsquo;re proud of how far we&rsquo;ve come, and excited
              about the people already using it.
            </p>
            <p className="fc-strong">But we&rsquo;re just getting started.</p>
            <p>
              We&rsquo;re building more tools to make packaging engineering
              easier, more efficient, and more accessible.
            </p>
            <p>
              Our goal is simple: Give packaging engineers powerful tools without
              unnecessary complexity.
            </p>
            <p>
              If you&rsquo;re a packaging engineer,{" "}
              <Link href="/signup">give Betsel Stack a try</Link>. See how much
              easier your work can be.
            </p>
          </div>

          <footer className="fc-sign">
            <p className="fc-name">James K</p>
            <p className="fc-role">CEO &amp; Founder, Betsel Stack</p>
          </footer>
        </article>
      </div>
    </section>
  );
}
