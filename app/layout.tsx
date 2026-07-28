import type { Metadata } from "next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://tioga.ai"),
  title: {
    default: "Tioga AI — Enterprise AI Implementation",
    template: "%s — Tioga AI",
  },
  description:
    "Tioga AI builds production-ready AI systems, MCP integrations, and intelligent automations for enterprise systems.",
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
    title: "Tioga AI — Enterprise AI Implementation",
    description:
      "Tioga AI builds production-ready AI systems, MCP integrations, and intelligent automations for enterprise systems.",
    url: "https://tioga.ai",
    siteName: "Tioga AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tioga AI — Enterprise AI Implementation",
    description:
      "Tioga AI builds production-ready AI systems, MCP integrations, and intelligent automations for enterprise systems.",
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
      "Tioga AI builds production-ready AI agents, MCP integrations, and AI governance programs for enterprise systems — NIST AI RMF, ISO 42001, and EU AI Act compliance built into the architecture.",
    areaServed: "Global",
    knowsAbout: [
      "Model Context Protocol",
      "AI agent implementation",
      "NIST AI RMF",
      "ISO 42001",
      "EU AI Act",
    ],
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Nav />
        {children}
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
