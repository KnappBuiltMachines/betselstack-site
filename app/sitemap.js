// app/sitemap.js
// Next.js App Router auto-generates https://www.betselstack.com/sitemap.xml from this file.
// Lists your public, indexable pages (auth/app pages are intentionally excluded).

const SITE = "https://www.betselstack.com";

export default function sitemap() {
  const now = new Date();
  return [
    { url: `${SITE}/`,        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE}/software`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/pricing`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/compare/tops-pro-alternative`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/compare/cube-iq-alternative`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/contact`,  lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE}/privacy`,  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE}/terms`,    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
