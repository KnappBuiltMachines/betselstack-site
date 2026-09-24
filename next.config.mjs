/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bundle the protected builder HTML into the /api/builder serverless
  // function on Vercel (it lives outside /public so it can't be fetched directly).
  outputFileTracingIncludes: {
    "/api/builder": ["./protected/**"],
    // The Stack Report reads its Markdown posts at runtime (hourly refresh),
    // so the post files have to ship with those functions too.
    "/stack-report": ["./content/stack-report/**"],
    "/stack-report/**": ["./content/stack-report/**"],
    "/sitemap.xml": ["./content/stack-report/**"],
  },
};

export default nextConfig;
