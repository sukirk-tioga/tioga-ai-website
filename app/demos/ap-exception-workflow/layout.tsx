import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Governed AP Exception Workflow Demo — Tioga AI",
  description:
    "Propose a fix to an invoice that failed three-way match — watch a deterministic policy auto-execute, escalate, block, or roll back the action, with every decision landing in an audit-grade ledger.",
  alternates: { canonical: "/demos/ap-exception-workflow" },
  openGraph: {
    title: "Governed AP Exception Workflow Demo — Tioga AI",
    description:
      "A live, governed write-path demo: read, decision, approval, simulated write, audit, rejection, rollback.",
  },
};

export default function ApExceptionWorkflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
