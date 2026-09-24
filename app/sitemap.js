// app/sitemap.js
// Next.js App Router auto-generates https://www.betselstack.com/sitemap.xml from this file.
// Lists your public, indexable pages (auth/app pages are intentionally excluded).
// Stack Report articles are added automatically.

import { getPublishedPosts } from "@/lib/stack-report/posts";

const SITE = "https://www.betselstack.com";

// Rebuild hourly so scheduled Stack Report posts land in the sitemap too.
export const revalidate = 3600;

export default function sitemap() {
  const now = new Date();
  const posts = getPublishedPosts().map((p) => ({
    url: `${SITE}/stack-report/${p.slug}`,
    lastModified: new Date(p.publishAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [
    { url: `${SITE}/`,        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE}/software`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/pricing`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/stack-report`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...posts,
    { url: `${SITE}/compare/tops-pro-alternative`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/compare/cube-iq-alternative`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/contact`,  lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE}/privacy`,  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE}/terms`,    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
