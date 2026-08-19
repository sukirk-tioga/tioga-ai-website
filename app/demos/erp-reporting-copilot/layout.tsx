import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ERP Reporting Copilot Demo — Tioga AI",
  description:
    "Ask a natural-language question against a composite semiconductor capital-equipment manufacturer's SAP quote and order data — watch the query get decomposed into SAP-style tables and gaps standard reporting doesn't cover, then get a real answer table. A read-side reporting demo, not a governed write-path one.",
  alternates: { canonical: "/demos/erp-reporting-copilot" },
  openGraph: {
    title: "ERP Reporting Copilot Demo — Tioga AI",
    description:
      "Historical quotation lookup, expiring-quote tracking, pricing-change history — the read-side reporting gaps standard SAP leaves to a custom query, answered live.",
  },
};

export default function ErpReportingCopilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
