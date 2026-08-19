import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Autonomy Tier Mapper — Tioga AI",
  description:
    "Map an AI-agent use case to Gartner's four-tier autonomy framework (Observe/Advise/Act with Approval/Act Autonomously) and see how it lines up with Tioga's own Safe/Ask-first/Never governance tiers.",
  alternates: { canonical: "/demos/agent-autonomy-mapper" },
  openGraph: {
    title: "Agent Autonomy Tier Mapper — Tioga AI",
    description:
      "A short self-assessment mapping your AI-agent use case to Gartner's autonomy framework and Tioga's Safe/Ask-first/Never governance tiers.",
  },
};

export default function AgentAutonomyMapperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
