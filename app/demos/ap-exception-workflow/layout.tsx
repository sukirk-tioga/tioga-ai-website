import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Governed AP Exception Workflow Demo — Tioga AI",
  description:
    "Propose a fix to an Oracle Fusion Cloud ERP Payables invoice stuck on a matching hold — watch a deterministic policy auto-execute, escalate, block, or roll back the action, with every decision landing in an audit-grade ledger.",
  alternates: { canonical: "/demos/ap-exception-workflow" },
  openGraph: {
    title: "Governed AP Exception Workflow Demo — Tioga AI",
    description:
      "A live, governed write-path demo against Oracle Fusion Cloud ERP's Payables flow: read, decision, approval, simulated write, audit, rejection, rollback.",
  },
};

export default function ApExceptionWorkflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
