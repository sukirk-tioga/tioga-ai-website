/** @type {import('next').NextConfig} */

// Next.js needs 'unsafe-inline' script-src for its own hydration payload;
// 'unsafe-eval' is only needed by the dev-mode bundler/HMR, never in a
// production build, so it's scoped to NODE_ENV instead of shipped always-on.
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/pricing", destination: "/services", permanent: false },
      { source: "/blog", destination: "/articles", permanent: false },
      // Retired 2026-09-10 with the Oracle EBS -> Fusion Cloud ERP pivot:
      // the EBS -> S/4HANA migration-assessment demo was replaced by the
      // Fusion Cloud AI-Readiness Assessment (a different question — "is it
      // safe to run governed AI agents here" vs. "should you migrate off
      // EBS"), so these route to the closest live equivalent rather than
      // 404ing on any inbound link/bookmark.
      { source: "/demos/migration-assessment", destination: "/demos/fusion-ai-readiness-assessment", permanent: true },
      { source: "/engineering/migration-assessment", destination: "/engineering/fusion-ai-readiness-assessment", permanent: true },
      { source: "/solutions/ebs-to-s4hana", destination: "/solutions/oracle", permanent: true },
    ];
  },
};

module.exports = nextConfig;
