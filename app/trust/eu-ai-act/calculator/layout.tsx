import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EU AI Act Readiness Calculator",
  description:
    "A quick, rules-based check of which EU AI Act risk tier your AI system likely falls into — prohibited, high-risk, limited-risk, or minimal — and what that means for penalty exposure.",
  alternates: { canonical: "/trust/eu-ai-act/calculator" },
  openGraph: {
    title: "EU AI Act Readiness Calculator — Tioga AI",
    description: "Which EU AI Act risk tier does your AI system fall into?",
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
