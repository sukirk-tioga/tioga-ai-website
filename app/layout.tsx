import type { Metadata } from "next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Tioga AI — Enterprise AI Implementation",
  description:
    "Tioga AI builds production-ready AI systems, MCP integrations, and intelligent automations for enterprise clients.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
