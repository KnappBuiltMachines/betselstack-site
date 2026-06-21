/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bundle the protected builder HTML into the /api/builder serverless
  // function on Vercel (it lives outside /public so it can't be fetched directly).
  outputFileTracingIncludes: {
    "/api/builder": ["./protected/**"],
  },
};

export default nextConfig;
