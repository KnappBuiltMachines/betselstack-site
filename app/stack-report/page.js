// app/stack-report/page.js
//
// The Stack Report — your articles + the auto-updating Industry Wire.
// Rebuilds itself hourly (REPORT.refreshSeconds), which refreshes the Wire
// and releases any posts whose date has arrived. Nothing to manage.

import Link from "next/link";
import { REPORT } from "@/lib/stack-report/config";
import { getPublishedPosts, formatDate } from "@/lib/stack-report/posts";
import { getWire } from "@/lib/stack-report/wire";

export const revalidate = 3600; // keep in sync with REPORT.refreshSeconds

const SITE = "https://www.betselstack.com";

export const metadata = {
  title: `${REPORT.name} \u2014 Palletizing & Packaging Insights`,
  description: REPORT.description,
  alternates: {
    canonical: SITE + REPORT.path,
    types: { "application/rss+xml": `${SITE}${REPORT.path}/feed.xml` },
  },
  openGraph: {
    title: `${REPORT.name} \u2014 Betsel Stack`,
    description: REPORT.tagline,
    url: SITE + REPORT.path,
    siteName: "Betsel Stack",
    type: "website",
  },
};

function timeAgo(iso) {
  if (!iso) return "";
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
}

function layerNo(n) {
  return String(n).padStart(2, "0");
}

export default async function StackReportPage() {
  const posts = getPublishedPosts();
  const wire = await getWire();
  const [lead, ...rest] = posts;
  const updated = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  });

  return (
    <div className="sr">
      {/* ---------- masthead ---------- */}
      <section className="sr-hero">
        <div className="container">
          <p className="eyebrow">Updates &amp; field notes</p>
          <h1 className="sr-title">
            The <span className="sr-amber">Stack</span> Report
          </h1>
          <p className="lead sr-lead">{REPORT.tagline}</p>
          <div className="sr-hero-meta">
            <span className="sr-live"><i aria-hidden="true" /> Wire refreshed {updated}</span>
            <a href={`${REPORT.path}/feed.xml`} className="sr-rss">RSS feed</a>
          </div>
        </div>
        <div className="sr-layers" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>
      </section>

      {/* ---------- our articles ---------- */}
      <section className="section--tight">
        <div className="container">
          <div className="sr-section-head">
            <h2>From the Betsel desk</h2>
            <span className="sr-count">{posts.length} {posts.length === 1 ? "layer" : "layers"} stacked</span>
          </div>

          {!lead && (
            <div className="card sr-empty">
              <p>First articles are on their way. In the meantime, the Industry Wire below is live.</p>
            </div>
          )}

          {lead && (
            <Link href={`${REPORT.path}/${lead.slug}`} className="sr-lead-card">
              <div className="sr-lead-body">
                <span className="sr-layer">Layer {layerNo(posts.length)} &middot; Latest</span>
                <h3>{lead.title}</h3>
                {lead.summary && <p>{lead.summary}</p>}
                <div className="sr-meta">
                  <span>{formatDate(lead.date)}</span>
                  <span>{lead.readMinutes} min read</span>
                  {lead.tags.slice(0, 3).map((t) => (
                    <span key={t} className="sr-tag">{t}</span>
                  ))}
                </div>
              </div>
              {lead.cover ? (
                <img className="sr-lead-img" src={lead.cover} alt="" />
              ) : (
                <div className="sr-lead-art" aria-hidden="true">
                  {Array.from({ length: 11 }).map((_, i) => <span key={i} />)}
                </div>
              )}
            </Link>
          )}

          {rest.length > 0 && (
            <div className="sr-grid">
              {rest.map((p, i) => (
                <Link key={p.slug} href={`${REPORT.path}/${p.slug}`} className="card sr-card">
                  <span className="sr-layer">Layer {layerNo(posts.length - 1 - i)}</span>
                  <h3>{p.title}</h3>
                  {p.summary && <p>{p.summary}</p>}
                  <div className="sr-meta">
                    <span>{formatDate(p.date)}</span>
                    <span>{p.readMinutes} min</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- industry wire ---------- */}
      <section className="section--tight sr-wire-section">
        <div className="container">
          <div className="sr-section-head">
            <h2>Industry Wire</h2>
            <span className="sr-count">Packaging, palletizing &amp; supply chain &middot; updated hourly</span>
          </div>

          {wire.length === 0 ? (
            <div className="card sr-empty">
              <p>The wire is quiet right now. Check back shortly.</p>
            </div>
          ) : (
            <ol className="sr-wire">
              {wire.map((w) => (
                <li key={w.link}>
                  <a href={w.link} target="_blank" rel="noopener noreferrer nofollow">
                    <span className="sr-wire-src">{w.source}</span>
                    <span className="sr-wire-title">{w.title}</span>
                    {w.summary && <span className="sr-wire-sum">{w.summary}</span>}
                    <span className="sr-wire-time">{timeAgo(w.date)}</span>
                  </a>
                </li>
              ))}
            </ol>
          )}
          <p className="sr-fine">
            Headlines link to their original publishers. Betsel Stack is not affiliated with these sources.
          </p>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section--tight">
        <div className="container">
          <div className="sr-cta">
            <div>
              <h2>Put it on a pallet.</h2>
              <p>Build and compare pallet patterns in your browser. 7-day free trial, no card required.</p>
            </div>
            <Link href="/signup" className="btn btn--primary">Start free trial</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
