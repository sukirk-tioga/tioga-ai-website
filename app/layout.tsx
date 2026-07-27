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
    "Tioga AI builds production-ready AI systems, MCP integrations, and intelligent automations for enterprise clients.",
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
      "Tioga AI builds production-ready AI systems, MCP integrations, and intelligent automations for enterprise clients.",
    url: "https://tioga.ai",
    siteName: "Tioga AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tioga AI — Enterprise AI Implementation",
    description:
      "Tioga AI builds production-ready AI systems, MCP integrations, and intelligent automations for enterprise clients.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
