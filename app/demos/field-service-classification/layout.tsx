import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Governed Field Service Billable Classification Demo — Tioga AI",
  description:
    "Classify a completed field-service call as contract-covered or billable T&M — watch a deterministic policy auto-execute, escalate, or block an interpretation risk, not a dollar threshold, with an independent ERP-layer check that catches what policy alone can't.",
  alternates: { canonical: "/demos/field-service-classification" },
  openGraph: {
    title: "Governed Field Service Billable Classification Demo — Tioga AI",
    description:
      "A live, governed write-path demo grounded in a real SAP Plant Maintenance/Customer Service pattern: is a completed service call contract-covered or billable — and when is that an agent's call to make alone?",
  },
};

export default function FieldServiceClassificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
