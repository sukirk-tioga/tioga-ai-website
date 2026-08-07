import type { Metadata } from "next";
import SolutionPage, { SolutionContent } from "@/components/SolutionPage";

export const metadata: Metadata = {
  title: "Governed Write-Path for AI Agents",
  description:
    "How to let an AI agent actually write to your ERP — policy enforcement, approval gates, and a rollback path, not a direct database write.",
  alternates: { canonical: "/solutions/governed-write-path" },
  openGraph: {
    title: "Governed Write-Path for AI Agents — Tioga AI",
    description: "A working, governed write path from your AI agent into your ERP.",
  },
};

const content: SolutionContent = {
  slug: "governed-write-path",
  eyebrow: "Governed Write-Path",
  title: "The one thing every \"AI for ERP\" pitch skips: how the agent actually writes",
  buyer:
    "IT and security leaders who've been pitched AI-for-ERP demos that all quietly stop at read-only — and want to know how a write actually gets approved, logged, and rolled back.",
  problem:
    "Every AI-agent vendor can show you a read. Almost none can show you a write that a security review would actually pass — policy enforcement, approval gates, and a rollback path, not a direct database write with a prayer.",
  outcome:
    "A working, governed write path from your AI agent into your ERP — executing through the application's own logic layer, with a policy-enforcement gate, a full evidence trail, and a defined rejection/rollback flow.",
  proof: [
    {
      label: "A named engagement, not a hand-wave",
      detail:
        "The Agent-Ready ERP Diagnostic & Governed Write-Path is scoped specifically around one stalled write path in your environment — chosen because it's the constraint actually blocking you.",
    },
    {
      label: "Try the actual write-path pattern, live",
      detail:
        "The Governed AP Exception Workflow demo runs the full loop — propose, policy decision, approval or block, simulated write, audit, and rollback — the same pattern this engagement builds around your write path.",
    },
    {
      label: "Operator experience on both sides",
      detail:
        "Before founding Tioga AI, Sukir managed ERP systems across four sister companies — including the approval and control workflows a governed write has to respect.",
    },
    {
      label: "Audit-grade evidence, not a screenshot",
      detail:
        "Every write produces a reviewable record — what was proposed, what policy check ran, who or what approved it, and what happened if it was rejected.",
    },
  ],
  offers: [
    {
      name: "Agent-Ready ERP Diagnostic & Governed Write-Path",
      price: "$60–120K",
      duration: "~6 weeks",
      desc: "Assess one stalled agent-to-ERP write path, then build a governed version of it — executing through your application's own logic layer, with policy enforcement and an audit-grade evidence trail your control owners can actually clear.",
    },
  ],
  faq: [
    {
      q: "What does \"governed write\" mean technically?",
      a: "The agent never writes directly to the database. It executes through your application's own API/logic layer — the same path a human user's action would take — with a policy-enforcement check and logging before and after.",
    },
    {
      q: "What if the agent gets it wrong?",
      a: "The write path is designed with an explicit rejection and rollback flow from day one, not added after an incident.",
    },
    {
      q: "How is this different from just giving an agent API credentials?",
      a: "API credentials alone don't give you policy enforcement, an approval gate, or an audit trail scoped to what a control owner needs to see. This engagement builds all three around the write, not just the API call.",
    },
    {
      q: "Can we see the audit trail this produces?",
      a: "Yes — see the live Governed AP Exception Workflow demo: every proposal, decision, approval, execution, rejection, and rollback lands in the ledger with its full policy-check trail.",
    },
  ],
  related: [
    { href: "/solutions/oracle", label: "Governed write-path for Oracle EBS" },
    { href: "/solutions/sap", label: "Governed write-path for SAP" },
    { href: "/demos/governance-ledger", label: "See the Governance Ledger demo" },
    { href: "/articles/governed-write-path-pattern", label: "Read: how the governed write-path pattern works" },
    { href: "/trust", label: "See the Trust Center" },
  ],
  demoLink: { href: "/demos/ap-exception-workflow", label: "Try the AP Exception Workflow demo" },
};

export default function GovernedWritePathSolutionPage() {
  return <SolutionPage content={content} />;
}
