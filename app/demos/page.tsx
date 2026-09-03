import type { Metadata } from "next";
import DemosClient from "./DemosClient";

// Server-rendered shell added 2026-09-02 (2026-09-02 comprehensive
// business-readiness audit, G-43/G-50): this page was previously 100%
// client-rendered ("use client" at the top of what's now DemosClient.tsx)
// -- server HTML was ~330 characters of layout/footer with the entire
// body left as an unresolved streaming placeholder. Any crawler that
// doesn't execute JS (which includes most LLM/AI-search crawlers) saw an
// empty page behind the nav item labelled "Live Demos." This file is now
// a real Server Component: it renders genuine static content (the same
// four demos already described in plain text on the homepage's "Try It
// Right Now" section) before handing off to DemosClient for the actual
// interactive experience. No change to DemosClient's behavior --
// identical file, just moved and renamed so it can be wrapped by a server
// parent instead of being the route's own entry point.

export const metadata: Metadata = {
  title: "Live Demos",
  description:
    "Four real AI workflows running against Tioga AI's own agent infrastructure: invoice processing, email triage, an EBS-to-S/4HANA migration assessment, and Standing Watch governance findings. No signup, no mockups.",
  alternates: { canonical: "/demos" },
  openGraph: {
    title: "Live Demos — Tioga AI",
    description: "Four real AI workflows, no signup, no mockups — the same models built into every Tioga AI engagement.",
  },
};

const DEMOS = [
  {
    title: "Invoice Processing",
    desc: "Upload a PDF. Get structured vendor, amount and line-item data in under 5 seconds.",
    tag: "AP Automation",
    href: "/demos?tab=invoice",
  },
  {
    title: "Email Triage",
    desc: "Paste any email. AI classifies urgency, routes to the right team, drafts a response.",
    tag: "Operations",
    href: "/demos?tab=email",
  },
  {
    title: "Migration Assessment",
    desc: "Get a sample Oracle EBS → SAP S/4HANA migration readiness assessment in 60 seconds.",
    tag: "Oracle EBS → S/4HANA",
    href: "/demos/migration-assessment",
  },
  {
    title: "Standing Watch",
    desc: "Real, dated findings from Tioga's own governance automations — what got auto-fixed, and what it correctly left for a human.",
    tag: "AI Governance",
    href: "/demos/standing-watch",
  },
];

export default function DemosPage() {
  return (
    <>
      {/* Real, server-rendered content for crawlers and non-JS clients --
          visually redundant with DemosClient's own hero/cards for a real
          browser (which hydrates immediately), so this is kept minimal
          rather than duplicating the full interactive UI. */}
      <h1 className="sr-only">Live Demos — Tioga AI</h1>
      <p className="sr-only">
        Four real AI workflows running against Tioga AI&apos;s own agent infrastructure, no signup and no mockups:
      </p>
      <ul className="sr-only">
        {DEMOS.map((demo) => (
          <li key={demo.title}>
            <a href={demo.href}>{demo.title}</a> ({demo.tag}): {demo.desc}
          </li>
        ))}
      </ul>
      <DemosClient />
    </>
  );
}
