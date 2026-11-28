import Link from "next/link";

export const metadata = {
  title: "Security & Data Protection",
  alternates: { canonical: "/security" },
  description:
    "How Betsel Stack keeps your pallet patterns, reports and qualification plans private: per-account data isolation, encryption, US hosting and audited infrastructure.",
};

// Keep these in step with the downloadable one-pager in
// /public/betsel-stack-security-overview.pdf and with the Privacy Policy.
const POINTS = [
  {
    n: "01",
    title: "Your data stays your data",
    body: [
      "Every account is isolated at the database level with row-level security. Only your account, and the users you add to it, can read or change your pallet patterns, reports and qualification plans.",
      "We never sell customer data, and we never share your work with other customers or third parties for marketing.",
    ],
  },
  {
    n: "02",
    title: "Encrypted in transit and at rest",
    body: [
      "All traffic to Betsel Stack runs over HTTPS (TLS). Stored data is encrypted at rest by our database provider, and passwords are never stored in plain text.",
    ],
  },
  {
    n: "03",
    title: "Hosted in the United States",
    body: [
      "The application and its database run on US-based servers. Your engineering data does not leave the country to be processed or stored.",
    ],
  },
  {
    n: "04",
    title: "Payments handled by Stripe",
    body: [
      "Card details go directly to Stripe, a PCI DSS Level 1 certified payment processor. They never touch Betsel Stack servers. We keep only your subscription status.",
    ],
  },
  {
    n: "05",
    title: "Built on audited infrastructure",
    body: [
      "Betsel Stack runs on Supabase (database and sign-in), Vercel (hosting) and Stripe (billing). Each of these providers is independently audited to SOC 2 Type II.",
    ],
  },
  {
    n: "06",
    title: "You stay in control",
    body: [
      "Export your reports as PDF at any time. The account owner decides who has access. Ask us to delete your account and your data is permanently removed, apart from limited billing records we must keep for tax purposes.",
    ],
  },
];

export default function SecurityPage() {
  return (
    <div className="bss-wrap">
      <style>{`
        .bss-wrap {
          max-width: 980px;
          margin: 0 auto;
          padding: 56px 24px 96px;
          color: #d6dbe3;
          line-height: 1.7;
          font-size: 16px;
        }
        .bss-tag {
          font-family: var(--display);
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--amber);
          font-weight: 600;
          margin: 0 0 10px;
        }
        .bss-wrap h1 {
          font-family: var(--display);
          font-size: 2.4rem;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin: 0 0 14px;
          color: #f5f7fa;
        }
        .bss-lede {
          max-width: 680px;
          font-size: 1.08rem;
          color: #c3c9d2;
          margin: 0 0 28px;
        }
        .bss-lede strong { color: #f5f7fa; }
        .bss-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: 0 0 48px;
        }
        .bss-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .bss-card {
          background: var(--panel);
          border: 1px solid var(--line);
          border-top: 3px solid var(--amber);
          border-radius: var(--radius);
          padding: 22px 24px 20px;
        }
        .bss-num {
          font-family: var(--display);
          font-weight: 700;
          font-size: 13px;
          color: var(--amber);
          margin: 0 0 6px;
        }
        .bss-card h2 {
          font-family: var(--display);
          font-size: 1.2rem;
          line-height: 1.3;
          margin: 0 0 10px;
          color: #f5f7fa;
        }
        .bss-card p {
          margin: 0 0 10px;
          font-size: 15px;
        }
        .bss-card p:last-child { margin-bottom: 0; }
        .bss-band {
          margin-top: 40px;
          background: var(--panel-2);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 28px 28px 26px;
        }
        .bss-band h2 {
          font-family: var(--display);
          font-size: 1.3rem;
          margin: 0 0 8px;
          color: #f5f7fa;
        }
        .bss-band p { margin: 0 0 8px; }
        .bss-band a { color: var(--amber); text-decoration: underline; }
        .bss-note {
          margin-top: 28px;
          font-size: 14px;
          color: var(--muted-2);
        }
        .bss-note a { color: #7fb2ff; text-decoration: underline; }
        @media (max-width: 720px) {
          .bss-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .bss-wrap { padding: 36px 18px 72px; }
          .bss-wrap h1 { font-size: 1.85rem; }
        }
      `}</style>

      <p className="bss-tag">Security &amp; data protection</p>
      <h1>Your engineering work, kept private.</h1>
      <p className="bss-lede">
        Your pallet patterns, reports and qualification plans are your
        company&rsquo;s engineering work. Betsel Stack is built so that work
        stays <strong>private, protected and yours</strong>, without adding
        complexity to your day.
      </p>

      <div className="bss-actions">
        <a
          href="/betsel-stack-security-overview.pdf"
          className="btn btn--primary"
          download
        >
          Download security overview (PDF)
        </a>
        <Link href="/signup" className="btn btn--ghost">
          Start 7-day free trial
        </Link>
      </div>

      <div className="bss-grid">
        {POINTS.map((p) => (
          <section className="bss-card" key={p.n}>
            <p className="bss-num">{p.n}</p>
            <h2>{p.title}</h2>
            {p.body.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </section>
        ))}
      </div>

      <div className="bss-band">
        <h2>Designed, developed and supported in New Jersey, USA.</h2>
        <p>
          Have a vendor security questionnaire or a question from your IT
          team? Send it to{" "}
          <a href="mailto:team@betselstack.com">team@betselstack.com</a> and
          we&rsquo;ll answer it directly.
        </p>
      </div>

      <p className="bss-note">
        Last updated November 2026. This page describes our current practices
        and may be updated as the platform grows. For how we collect and use
        personal information, see our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </div>
  );
}
