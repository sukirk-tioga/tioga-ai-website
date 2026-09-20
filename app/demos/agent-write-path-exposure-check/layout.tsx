import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Write-Path Exposure Check — Tioga AI",
  description:
    "A free five-minute self-check on one AI-agent write into an ERP or CRM: credential, application-logic path, attribution, approval, verification, rollback and evidence. Runs in your browser; nothing you select is sent anywhere.",
  alternates: { canonical: "/demos/agent-write-path-exposure-check" },
  openGraph: {
    title: "Agent Write-Path Exposure Check — Tioga AI",
    description:
      "Twelve control points on one agent-to-ERP/CRM write, scored for exposure — with unknowns kept separate from gaps. Free, in your browser.",
  },
};

export default function AgentWritePathExposureCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
