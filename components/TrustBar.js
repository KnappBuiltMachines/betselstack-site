import Link from "next/link";
import { StripeBadge, SupabaseBadge } from "@/components/TrustBadges";

// Homepage trust strip, directly under the hero.
// Keep the three points in step with /security and the security overview PDF.

const POINTS = [
  {
    label: "Encrypted in transit and at rest",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="10.5" width="16" height="10" rx="2.2" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
  {
    label: "Your data isolated to your account",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
        <path d="m8.8 12 2.2 2.2 4.2-4.4" />
      </svg>
    ),
  },
  {
    label: "Hosted in the United States",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="4" width="17" height="6.5" rx="1.6" />
        <rect x="3.5" y="13.5" width="17" height="6.5" rx="1.6" />
        <path d="M7.5 7.25h.01M7.5 16.75h.01" />
      </svg>
    ),
  },
];

export default function TrustBar() {
  return (
    <section className="tb" aria-label="Security">
      <style>{`
        .tb {
          border-top: 1px solid var(--line-soft);
          border-bottom: 1px solid var(--line-soft);
          background: var(--ink-2);
          padding: 26px 0;
        }
        .tb-in {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 16px 32px;
        }
        .tb-points {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px 28px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .tb-point {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--text);
          font-family: var(--display);
          font-weight: 500;
          font-size: 15px;
          letter-spacing: -0.005em;
        }
        .tb-point svg { color: var(--amber); flex: none; }
        .tb-right {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px 18px;
        }
        .tb-link {
          color: var(--amber);
          font-family: var(--display);
          font-weight: 600;
          font-size: 14px;
          white-space: nowrap;
        }
        .tb-link:hover { color: var(--amber-soft); }
        @media (max-width: 720px) {
          .tb { padding: 22px 0; }
          .tb-points { flex-direction: column; align-items: flex-start; gap: 12px; }
          .tb-in { justify-content: flex-start; }
        }
      `}</style>
      <div className="container tb-in">
        <ul className="tb-points">
          {POINTS.map((p) => (
            <li className="tb-point" key={p.label}>
              {p.icon}
              {p.label}
            </li>
          ))}
        </ul>
        <div className="tb-right">
          <SupabaseBadge />
          <StripeBadge />
          <Link href="/security" className="tb-link">
            How we protect your data <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
