import type { Metadata } from "next";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "What Actually Drives Oracle Fusion Cloud AI-Agent Readiness",
  description:
    "A concrete, reproducible way to score whether it's safe to run governed AI agents against an Oracle Fusion Cloud ERP environment, from use case, integration method, and which governance controls already exist.",
  alternates: { canonical: "/articles/migration-complexity-scoring" },
  openGraph: {
    type: "article",
    publishedTime: "2026-08-03",
    title: "What Actually Drives AI-Agent Readiness — Tioga AI",
    description: "A real scoring model for Oracle Fusion Cloud ERP AI-agent readiness.",
  },
};

// Retired and retargeted 2026-09-10: this article originally described the
// scoring model behind the site's Oracle EBS -> S/4HANA migration-assessment
// demo, which was itself retired the same day (see next.config.js's
// redirect from /demos/migration-assessment). Keeping this piece describing
// a tool that no longer exists at that link would have been the site making
// a "here's evidence for my live demo" claim about a demo that's gone —
// retargeted to describe the real, current scoring model instead of leaving
// the URL up with a stale claim. The slug is left unchanged rather than
// adding a redirect nobody asked for; the content is what changed.
const content: ArticleContent = {
  slug: "migration-complexity-scoring",
  query: "Oracle Fusion Cloud ERP AI agent readiness assessment",
  date: "2026-08-03",
  title: "What actually drives Oracle Fusion Cloud ERP AI-agent readiness",
  dek: "Not every environment is equally ready for a governed AI agent, and the difference is measurable before you deploy one — from which controls already exist and how the agent would reach the system, not from a generic readiness questionnaire.",
  evidenceLabel: "Evidence: the actual scoring model behind my live Fusion Cloud AI-Readiness Assessment demo.",
  sections: [
    {
      heading: "The inputs that matter most",
      body: (
        <p>
          My live assessment tool scores readiness on a 1–10 scale (higher is
          more ready) from three concrete inputs: the target agent use case —
          AP invoice exceptions, procurement requisition triage, GL journal
          review, or expense auditing carry very different risk profiles —
          the current integration method (nothing yet, direct REST calls,
          Oracle Integration Cloud, or Oracle&apos;s own AI Agent Studio), and
          which governance controls are already in place: agent-scoped
          security roles, REST API scope discipline, an exported audit trail,
          and human-approval gates extended to agent-initiated actions. An
          AP-exceptions agent going through AI Agent Studio with all four
          controls in place and one with none of them are not the same risk,
          and shouldn&apos;t get the same readiness verdict from a template.
        </p>
      ),
    },
    {
      heading: "Why the reasoning has to be shown, not just the number",
      body: (
        <p>
          A readiness score with no explanation is a guess wearing a number.
          My tool requires the reasoning behind every score to reference the
          specific use case and controls that produced it — so whoever&apos;s
          reviewing the output can check whether the assessment actually
          engaged with their environment, rather than returning the same
          generic &ldquo;6 out of 10, proceed with caution&rdquo; regardless
          of input.
        </p>
      ),
    },
    {
      heading: "What this changes about scoping a real deployment",
      body: (
        <p>
          Treating a thin governance-control set as a structural blocker to
          autonomous agent action — not a stylistic nitpick to mention in
          passing — produces a recommended approach and a named-gaps list
          that&apos;s specific enough to argue with, which is the point. A
          readiness assessment that can&apos;t be disagreed with on specifics
          isn&apos;t doing its job.
        </p>
      ),
    },
  ],
  relatedService: {
    href: "/solutions/oracle",
    label: "AI agents for Oracle Fusion Cloud ERP & EBS",
  },
  related: [
    { href: "/demos/fusion-ai-readiness-assessment", label: "Try the live assessment" },
    { href: "/solutions/oracle", label: "Governed AI for Oracle Fusion Cloud ERP & EBS" },
  ],
};

export default function MigrationComplexityArticle() {
  return <ArticlePage content={content} />;
}
