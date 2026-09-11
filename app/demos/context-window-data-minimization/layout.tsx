import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Context-Window Data Minimization Demo — Tioga AI",
  description:
    "The same HR question answered by a naive agent that pulls whole employee records into context and a governed agent enforcing a field-level allowlist — a side-by-side log of exactly which fields entered each agent's prompt. 100% synthetic data.",
  alternates: { canonical: "/demos/context-window-data-minimization" },
  openGraph: {
    title: "Context-Window Data Minimization Demo — Tioga AI",
    description:
      "Making the invisible visible: exactly which employee-record fields enter an agent's context to answer an overtime question — naive vs. a field-level allowlist enforced at the boundary.",
  },
};

export default function ContextWindowDataMinimizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
