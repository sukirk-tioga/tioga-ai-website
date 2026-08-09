import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tioga.ai"),
  title: {
    default: "Tioga AI — Governed AI Agents for Oracle and SAP",
    template: "%s — Tioga AI",
  },
  description:
    "Tioga AI builds governed AI agents for Oracle and SAP — finance, procurement and operations automation that works inside your existing systems without weakening your controls.",
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
    title: "Tioga AI — Governed AI Agents for Oracle and SAP",
    description:
      "Tioga AI builds governed AI agents for Oracle and SAP — finance, procurement and operations automation that works inside your existing systems without weakening your controls.",
    url: "https://tioga.ai",
    siteName: "Tioga AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tioga AI — Governed AI Agents for Oracle and SAP",
    description:
      "Tioga AI builds governed AI agents for Oracle and SAP — finance, procurement and operations automation that works inside your existing systems without weakening your controls.",
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
    founder: {
      "@type": "Person",
      name: "Sukir Kumaresan",
    },
    description:
      "Tioga AI builds governed AI agents for Oracle and SAP — finance, procurement and operations automation, with NIST AI RMF, ISO 42001, and EU AI Act governance built into the architecture.",
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
    <html lang="en" className={inter.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Nav />
        {children}
        <Footer />
        <ChatWidget />
        <Analytics />
      </body>
    </html>
  );
}
