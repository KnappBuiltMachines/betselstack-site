// app/robots.js
// Next.js App Router auto-generates https://www.betselstack.com/robots.txt from this file.
// Lets search engines crawl the marketing pages and points them at the sitemap.
// Member-only and API routes are kept out of search results.

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/account",
          "/builder",
          "/m$",
          "/subscribe",
          "/qualification-plans",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: "https://www.betselstack.com/sitemap.xml",
    host: "https://www.betselstack.com",
  };
}
