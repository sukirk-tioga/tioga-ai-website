import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Audit-ledger redesign, 2026-09-01: Libre Franklin (headings — document/
// masthead authority) + Spectral (body — built for on-screen reading, reads
// as report rather than SaaS landing page). Replaces Inter site-wide.
//
// 2026-09-23: all three fonts are committed woff2 files (app/fonts/, the
// same latin subsets Google Fonts serves) loaded via next/font/local instead
// of next/font/google. The google loader fetches font CSS at build time, and
// when Google returned something unexpected to the CI runner the build died
// in loader.js ("Cannot read properties of null (reading '1')"), failing E2E
// before any test ran (09-21, 09-23). Local files mean no network at build.
// The variable files are declared once per weight (not as a "600 900"
// range), exactly as Google's CSS declared them, so in-between weights like
// the 650 on /solutions keep snapping to 700 and rendering is unchanged.
const displayFont = localFont({
  src: [
    { path: "./fonts/LibreFranklin-variable-latin.woff2", weight: "600", style: "normal" },
    { path: "./fonts/LibreFranklin-variable-latin.woff2", weight: "700", style: "normal" },
    { path: "./fonts/LibreFranklin-variable-latin.woff2", weight: "800", style: "normal" },
    { path: "./fonts/LibreFranklin-variable-latin.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});
const bodyFont = localFont({
  src: [
    { path: "./fonts/Spectral-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Spectral-500-latin.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Spectral-600-latin.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

// Martian Mono was previously pulled in via a render-blocking @import of
// fonts.googleapis.com at the top of globals.css (~760ms of Lighthouse
// render-blocking on every page) for a single rule in solutions-hub.css.
// Self-hosted via next/font instead; preload:false because only /solutions
// uses it, so other pages don't download it.
const monoFont = localFont({
  src: [
    { path: "./fonts/MartianMono-variable-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/MartianMono-variable-latin.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono-martian",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tioga.ai"),
  title: {
    default: "Tioga AI — AI Agents, Built and Governed in Your Real Systems",
    template: "%s — Tioga AI",
  },
  description:
    "Tioga AI builds AI agents inside the systems you already run — from SAP and Oracle to Salesforce, Snowflake, and QuickBooks — with governance mapped to NIST AI RMF, ISO 42001, and the EU AI Act built in, not bolted on.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Tioga AI — AI Agents, Built and Governed in Your Real Systems",
    description:
      "Tioga AI builds AI agents inside the systems you already run — from SAP and Oracle to Salesforce, Snowflake, and QuickBooks — with governance mapped to NIST AI RMF, ISO 42001, and the EU AI Act built in, not bolted on.",
    url: "https://tioga.ai",
    siteName: "Tioga AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tioga AI — AI Agents, Built and Governed in Your Real Systems",
    description:
      "Tioga AI builds AI agents inside the systems you already run — from SAP and Oracle to Salesforce, Snowflake, and QuickBooks — with governance mapped to NIST AI RMF, ISO 42001, and the EU AI Act built in, not bolted on.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Tioga AI",
    url: "https://tioga.ai",
    description:
      "Tioga AI builds AI agents inside the systems businesses already run — from SAP and Oracle to Salesforce, Snowflake, and QuickBooks — with NIST AI RMF, ISO 42001, and EU AI Act governance built into the architecture.",
    areaServed: "Global",
    knowsAbout: [
      "Oracle ERP",
      "SAP",
      "Model Context Protocol",
      "AI agent implementation",
      "NIST AI RMF",
      "ISO 42001",
      "EU AI Act",
    ],
  };

  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Nav />
        {children}
        <Footer />
        <ChatWidget />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
