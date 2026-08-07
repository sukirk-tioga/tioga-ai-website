import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Migration Assessment Demo — Tioga AI",
  description:
    "Get an instant, honest readiness assessment for your Oracle EBS to SAP S/4HANA migration — complexity score, timeline, top risks, and recommended approach.",
  alternates: { canonical: "/demos/migration-assessment" },
  openGraph: {
    title: "Migration Assessment Demo — Tioga AI",
    description:
      "Instant Oracle EBS → SAP S/4HANA migration readiness assessment, powered by Claude.",
  },
};

export default function MigrationAssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
