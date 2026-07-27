import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live AI Demos",
  description:
    "Try Tioga AI's live, interactive demos — document classification, email triage, invoice parsing, MCP enterprise integrations, and more, powered by Claude.",
  openGraph: {
    title: "Live AI Demos — Tioga AI",
    description:
      "Try our live, interactive AI demos — powered by Claude, not staged screenshots.",
  },
};

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
