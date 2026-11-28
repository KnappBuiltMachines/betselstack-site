/** @type {import('next').NextConfig} */

// ---------------------------------------------------------------------------
// Security headers, sent with every page and API response.
//
// The Content-Security-Policy lists every outside source the site and the
// pallet builder load from. If a feature ever breaks after adding a new outside
// script, font, image or API, add that domain to the matching line below.
//
// Emergency rollback for the CSP only: change the key
//   "Content-Security-Policy"  ->  "Content-Security-Policy-Report-Only"
// and commit. The browser will then report problems without blocking anything.
// ---------------------------------------------------------------------------
const csp = [
  "default-src 'self'",
  // Builder libraries (three.js, jsPDF, xlsx) come from cdnjs; Next.js and the
  // builder use inline scripts.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // supabase.com serves the official "Made with Supabase" badge.
  "img-src 'self' data: blob: https://supabase.com",
  "media-src 'self' blob:",
  // Sign-in and account pages talk to Supabase directly; Vercel Analytics.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  // The builder and mobile viewer are same-site iframes; PDFs preview from blob: URLs.
  "frame-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework in responses.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Bundle the protected builder HTML into the /api/builder serverless
  // function on Vercel (it lives outside /public so it can't be fetched directly).
  outputFileTracingIncludes: {
    "/api/builder": ["./protected/**"],
    "/api/mobile": ["./protected/**"],
    "/api/engine": ["./protected/**"],
    // The Stack Report reads its Markdown posts at runtime (hourly refresh),
    // so the post files have to ship with those functions too.
    "/stack-report": ["./content/stack-report/**"],
    "/stack-report/**": ["./content/stack-report/**"],
    "/sitemap.xml": ["./content/stack-report/**"],
  },
};

export default nextConfig;
