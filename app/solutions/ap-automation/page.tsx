import type { Metadata } from "next";
import SolutionPage, { SolutionContent } from "@/components/SolutionPage";

export const metadata: Metadata = {
  title: "Governed AP Automation",
  description:
    "AI-powered accounts payable automation — invoice extraction, exception flagging, and approval routing with a full audit trail.",
  alternates: { canonical: "/solutions/ap-automation" },
  openGraph: {
    title: "Governed AP Automation — Tioga AI",
    description: "Invoice to approval, with an audit trail a finance-controls reviewer will actually approve.",
  },
};

const content: SolutionContent = {
  slug: "ap-automation",
  eyebrow: "Accounts Payable",
  title: "Governed AP automation — invoice to approval, with an audit trail",
  buyer:
    "Controllers and AP managers drowning in manual invoice processing who need automation that a finance-controls reviewer will actually approve.",
  problem:
    "Most invoice-automation tools stop at OCR — extract the data and hand it back to a human for every decision. That's faster data entry, not automation.",
  outcome:
    "An AI agent that reads an invoice, checks it against PO and policy, flags exceptions, and routes for approval — with every step logged for audit, not just the final result.",
  proof: [
    {
      label: "Live invoice-extraction demo",
      detail:
        "Try the invoice-processing demo below — upload a PDF, get structured vendor, amount, and line-item data in under 5 seconds. Real extraction, not a mockup.",
    },
    {
      label: "Built by someone who ran AP, not just automated it",
      detail:
        "Before founding Tioga AI, the founder managed ERP and business-reporting systems — including AP workflows — across four sister companies.",
    },
    {
      label: "Exception-first design",
      detail:
        "Engagements are scoped around what happens when the agent is uncertain, not just the happy path — an unclear match routes to a human with the reasoning attached, not a silent best-effort guess.",
    },
    {
      label: "No black-box approvals",
      detail:
        "You set the approval boundary. Every recommendation the agent makes comes with the evidence behind it, reviewable before or after the fact.",
    },
  ],
  offers: [
    {
      name: "AI Agent Pilot",
      price: "$25–50K",
      duration: "4–8 weeks",
      desc: "Production-ready AI agent built against your AP workflow, integrated with your real systems, with governance documentation delivered alongside the code.",
    },
    {
      name: "AI Operations Assessment",
      price: "$10–15K",
      duration: "2–3 weeks",
      desc: "If you're not yet sure where the highest-ROI automation opportunity is in your AP process, this maps it first — ranked by ROI and feasibility.",
    },
  ],
  faq: [
    {
      q: "Does the agent actually approve invoices, or just flag them?",
      a: "You decide the approval boundary. Most engagements start with the agent recommending and routing, with a human making the final call — full autonomous approval only ships once you're comfortable with the audit trail.",
    },
    {
      q: "What happens when the agent isn't sure?",
      a: "It's explicitly designed to flag exceptions rather than guess — an uncertain match routes to a human with the reasoning attached, not a silent best-effort answer.",
    },
    {
      q: "Can we see this working before committing?",
      a: "Yes — try the live invoice-processing demo on this page, or start with the 5-day Discovery Sprint against your real invoice formats.",
    },
    {
      q: "Does this integrate with our existing AP system, or replace it?",
      a: "Integrates. The agent works inside your existing ERP/AP workflow rather than becoming a second system of record.",
    },
  ],
  related: [
    { href: "/solutions/oracle", label: "AP automation for Oracle EBS" },
    { href: "/solutions/sap", label: "AP automation for SAP" },
    { href: "/articles/ap-exception-auto-approve-antipattern", label: "Read: why a single spend threshold isn't a policy" },
    { href: "/services", label: "See all engagements" },
  ],
  demoLink: { href: "/demos?tab=invoice", label: "Try the invoice-processing demo" },
};

export default function ApAutomationSolutionPage() {
  return <SolutionPage content={content} />;
}
