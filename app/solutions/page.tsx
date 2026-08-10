import type { Metadata } from "next";
import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Governed AI solutions for Oracle EBS, SAP, accounts payable, ERP write-paths, MCP security, AI governance, and EBS-to-S4HANA migration.",
  alternates: { canonical: "/solutions" },
  openGraph: {
    title: "Solutions — Tioga AI",
    description: "Governed AI solutions for enterprise systems, by buyer and problem.",
  },
};

const SOLUTIONS = [
  {
    href: "/solutions/oracle",
    name: "Oracle EBS",
    desc: "AI agents that work inside your existing Oracle E-Business Suite — no rip-and-replace.",
  },
  {
    href: "/solutions/sap",
    name: "SAP",
    desc: "Governed AI agents for SAP — real module integration, not generic RPA that breaks on a UI change.",
  },
  {
    href: "/solutions/ap-automation",
    name: "AP Automation",
    desc: "Invoice to approval, with an audit trail a finance-controls reviewer will actually approve.",
  },
  {
    href: "/solutions/governed-write-path",
    name: "Governed Write-Path",
    desc: "How to let an AI agent actually write to your ERP — policy enforcement, approval gates, rollback.",
  },
  {
    href: "/solutions/mcp-security",
    name: "MCP Security",
    desc: "Scoped permissions, call-level audit logging, and policy enforcement for MCP-based agents.",
  },
  {
    href: "/solutions/ai-governance",
    name: "AI Governance",
    desc: "NIST AI RMF, ISO 42001, EU AI Act, and US state-law programs — built in, not backfilled.",
  },
  {
    href: "/solutions/ebs-to-s4hana",
    name: "Oracle EBS → S/4HANA",
    desc: "Know what breaks before you migrate, not after — a real readiness assessment, not a slide deck.",
  },
  {
    href: "/solutions/standing-watch",
    name: "Standing Watch",
    desc: "Cross-system AI agent governance across SAP, Workday, Databricks, and ServiceNow — governed as one estate, not four panes of glass.",
  },
];

export default function SolutionsHubPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-16 px-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Solutions</h1>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-16">
          Governed AI automation for the enterprise systems you already run — organized by buyer and problem, not by generic AI capability. Every page links to a live demo and the specific engagement that fits.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {SOLUTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group p-6 rounded-2xl transition-all hover:border-slate-500 block"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h2 className="text-lg font-semibold text-white mb-2">{s.name}</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">{s.desc}</p>
              <span className="text-sm font-medium inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
                Learn more →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <TrackedCTA
            href="/#contact"
            event="cta_book_call"
            data={{ location: "solutions_hub" }}
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Start a conversation
          </TrackedCTA>
          <p className="text-xs text-slate-400 mt-4">
            Not sure which fits?{" "}
            <Link href="/services" style={{ color: "var(--accent)" }} className="hover:text-white transition-colors">
              See all 13 engagements →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
