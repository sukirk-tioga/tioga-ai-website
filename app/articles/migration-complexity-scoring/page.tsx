import type { Metadata } from "next";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "What Actually Drives Oracle EBS to S/4HANA Migration Complexity",
  description:
    "A concrete, reproducible way to score EBS-to-S/4HANA migration complexity from module footprint and data volume, instead of a generic readiness slide deck.",
  alternates: { canonical: "/articles/migration-complexity-scoring" },
  openGraph: {
    title: "What Actually Drives Migration Complexity — Tioga AI",
    description: "A real scoring model for Oracle EBS to S/4HANA migration readiness.",
  },
};

const content: ArticleContent = {
  slug: "migration-complexity-scoring",
  query: "Oracle EBS S/4HANA migration complexity assessment",
  title: "What actually drives Oracle EBS → S/4HANA migration complexity",
  dek: "Not every migration is equally hard, and the difference is measurable before you start — from which modules are in scope and how much data moves, not from a generic readiness questionnaire.",
  evidenceLabel: "Evidence: the actual scoring model behind our live Migration Assessment demo.",
  sections: [
    {
      heading: "The two inputs that matter most",
      body: (
        <p>
          Our live assessment tool scores complexity on a 1–10 scale from two
          concrete inputs: which EBS modules are in scope — FI, AP, AR, GL,
          FA, Inventory, and Purchasing carry very different migration risk
          — and data volume, from under 10GB up to over 1TB. A single-module
          FI migration under 10GB and a seven-module footprint over 1TB are
          not the same project, and shouldn&apos;t get the same timeline
          estimate from a template.
        </p>
      ),
    },
    {
      heading: "Why the reasoning has to be shown, not just the number",
      body: (
        <p>
          A complexity score with no explanation is a guess wearing a number.
          Our tool requires the reasoning behind every score to reference the
          specific modules and data volume that produced it — so a CIO
          reviewing the output can check whether the assessment actually
          engaged with their environment, rather than returning the same
          generic &ldquo;6 out of 10, moderate complexity&rdquo; regardless
          of input.
        </p>
      ),
    },
    {
      heading: "What this changes about scoping a real migration",
      body: (
        <p>
          Treating Purchasing and Inventory modules as higher-risk than GL in
          isolation, and cross-referencing that against actual data volume,
          produces a timeline range and a top-risks list that's specific
          enough to argue with — which is the point. A readiness assessment
          that can&apos;t be disagreed with on specifics isn&apos;t doing
          its job.
        </p>
      ),
    },
  ],
  relatedService: {
    href: "/solutions/ebs-to-s4hana",
    label: "Oracle EBS → S/4HANA migration assessment",
  },
  related: [
    { href: "/demos/migration-assessment", label: "Try the live assessment" },
    { href: "/solutions/oracle", label: "Governed AI for Oracle EBS" },
  ],
};

export default function MigrationComplexityArticle() {
  return <ArticlePage content={content} />;
}
