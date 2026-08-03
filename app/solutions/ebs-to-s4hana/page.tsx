import type { Metadata } from "next";
import SolutionPage, { SolutionContent } from "@/components/SolutionPage";

export const metadata: Metadata = {
  title: "Oracle EBS to SAP S/4HANA Migration Readiness",
  description:
    "A concrete Oracle EBS to SAP S/4HANA migration-readiness assessment — what maps cleanly, what needs rework, what's a real risk.",
  openGraph: {
    title: "Oracle EBS → SAP S/4HANA Migration Readiness — Tioga AI",
    description: "Know what breaks before you migrate, not after.",
  },
};

const content: SolutionContent = {
  slug: "ebs-to-s4hana",
  eyebrow: "ERP Migration",
  title: "Oracle EBS → S/4HANA — know what breaks before you migrate, not after",
  buyer:
    "IT leaders and finance-transformation teams planning or mid-migration from Oracle EBS to SAP S/4HANA who need a readiness read they can act on, not a generic migration-consulting slide deck.",
  problem:
    "EBS-to-S4HANA migrations are notorious for surfacing integration and data-mapping problems only after cutover — when they're most expensive to fix.",
  outcome:
    "A concrete migration-readiness assessment — what maps cleanly, what needs rework, what's a real risk — plus, if needed, an AI-agent layer that keeps working through the transition instead of breaking at cutover.",
  proof: [
    {
      label: "Live migration-readiness demo",
      detail:
        "Try the demo below — a sample Oracle EBS → SAP migration readiness assessment in 60 seconds, running live against sample data.",
    },
    {
      label: "Operator experience in both systems",
      detail:
        "Before founding Tioga AI, Sukir managed both Oracle EBS and SAP environments across four sister companies — most migration consultants specialize in one side of this transition, not both.",
    },
    {
      label: "A named engagement, not a bolt-on",
      detail:
        "The ERP Modernization Advisory engagement explicitly covers this transition, with AI integration continuity as a first-class requirement, not an afterthought.",
    },
    {
      label: "Governed write-paths that survive cutover",
      detail:
        "If you've already built AI agents against EBS, the Governed Write-Path engagement can help make sure they keep working — or migrate cleanly — through the transition.",
    },
  ],
  offers: [
    {
      name: "ERP Modernization Advisory",
      price: "$15–25K/month",
      duration: "3–12 months",
      desc: "Ongoing strategic guidance for organizations modernizing from Oracle EBS to SAP S/4HANA — with AI integration continuity as a first-class requirement.",
    },
    {
      name: "Agent-Ready ERP Diagnostic & Governed Write-Path",
      price: "$60–120K",
      duration: "~6 weeks",
      desc: "If you have (or plan) AI agents writing into EBS, this scopes a governed write-path designed to survive the migration, not break at cutover.",
    },
  ],
  faq: [
    {
      q: "Can the readiness assessment run against our real EBS data?",
      a: "The live demo runs on sample data; a real assessment for your environment starts with the 5-day Discovery Sprint against your actual configuration.",
    },
    {
      q: "Do you do the SAP S/4HANA implementation itself?",
      a: "The ERP Modernization Advisory engagement is strategic guidance with AI integration as a first-class requirement — not the systems-integrator implementation work itself. Happy to clarify fit on a call.",
    },
    {
      q: "What happens to any AI agents we've already built on EBS during the migration?",
      a: "That's exactly the gap this exists to close — an agent built without a migration plan usually breaks at cutover. Scoping that continuity is part of the assessment.",
    },
    {
      q: "We're only exploring migration, not committed yet — is this still useful?",
      a: "Yes — the readiness assessment is designed to inform the go/no-go decision, not assume you've already committed.",
    },
  ],
  related: [
    { href: "/solutions/oracle", label: "AI agents for Oracle EBS (if staying)" },
    { href: "/solutions/sap", label: "AI agents for SAP (post-migration)" },
    { href: "/articles/migration-complexity-scoring", label: "Read: what actually drives migration complexity" },
    { href: "/services", label: "See all engagements" },
  ],
  demoLink: { href: "/demos/migration-assessment", label: "Try the migration-readiness demo" },
};

export default function EbsToS4hanaSolutionPage() {
  return <SolutionPage content={content} />;
}
