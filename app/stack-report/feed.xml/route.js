// app/stack-report/feed.xml/route.js
// RSS feed of your own Stack Report articles at /stack-report/feed.xml.
// Readers, LinkedIn automation tools, and the future newsletter can all
// subscribe to this.

import { REPORT } from "@/lib/stack-report/config";
import { getPublishedPosts } from "@/lib/stack-report/posts";

export const revalidate = 3600;

const SITE = "https://www.betselstack.com";

function x(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const posts = getPublishedPosts().slice(0, 30);
  const items = posts
    .map((p) => {
      const url = `${SITE}${REPORT.path}/${p.slug}`;
      return `    <item>
      <title>${x(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.publishAt).toUTCString()}</pubDate>
      <description>${x(p.summary)}</description>
${p.tags.map((t) => `      <category>${x(t)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${x(REPORT.name)} \u2014 Betsel Stack</title>
    <link>${SITE}${REPORT.path}</link>
    <description>${x(REPORT.tagline)}</description>
    <language>en-us</language>
    <atom:link href="${SITE}${REPORT.path}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
