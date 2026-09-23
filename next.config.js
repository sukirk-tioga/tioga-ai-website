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

// Presenter pages (/present/*, password-gated by middleware.ts) embed and
// probe the governed-agent ledger UI running on the presenter's own laptop,
// so they need exactly one extra origin. Everything else stays identical to
// the site-wide policy. Next applies the last matching header of the same
// key, so this entry must come after the /:path* one below.
const PRESENTER_LIVE_ORIGIN = "http://localhost:4003";
const PRESENTER_CSP = CSP.replace(
  "connect-src 'self'",
  `connect-src 'self' ${PRESENTER_LIVE_ORIGIN}`
) + `; frame-src ${PRESENTER_LIVE_ORIGIN}`;

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
      {
        source: "/present/:path*",
        headers: [{ key: "Content-Security-Policy", value: PRESENTER_CSP }],
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
