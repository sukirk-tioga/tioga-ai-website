import type { Metadata } from "next";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "NIST AI RMF vs. ISO 42001 vs. EU AI Act: One Mapping, Not Three Checklists",
  description:
    "How the same underlying control — an audit-grade decision log — satisfies NIST AI RMF, ISO 42001, and EU AI Act evidence requirements at once, instead of three separate compliance projects.",
  alternates: { canonical: "/articles/framework-mapping-not-three-checklists" },
  openGraph: {
    type: "article",
    publishedTime: "2026-08-03",
    title: "One Control Mapping, Not Three Checklists — Tioga AI",
    description: "Why NIST AI RMF, ISO 42001, and the EU AI Act converge on the same evidence.",
  },
};

const content: ArticleContent = {
  slug: "framework-mapping-not-three-checklists",
  query: "NIST AI RMF ISO 42001 EU AI Act mapping",
  date: "2026-08-03",
  title: "NIST AI RMF, ISO 42001, EU AI Act: one mapping, not three checklists",
  dek: "Governance teams often treat these as three separate compliance projects. In practice, the same underlying evidence — a decision log with control tags — satisfies all three, if it's built that way from the start.",
  evidenceLabel: "Evidence: the actual control-tag structure from our live Governance Ledger and AP Exception Workflow demos.",
  sections: [
    {
      heading: "Same evidence, three vocabularies",
      body: (
        <>
          <p>
            NIST AI RMF organizes controls under four functions — GOVERN, MAP,
            MEASURE, MANAGE. ISO 42001 and the EU AI Act use different labels
            for largely the same underlying obligations: documented authority
            and scope, risk identification, ongoing monitoring, and incident
            response. Teams that treat these as three separate audits end up
            building three separate evidence trails for the same operational
            fact.
          </p>
          <p>
            Our own live demos tag every policy decision against the NIST
            function it maps to — GOVERN-1.5 for documented scope
            enforcement, MEASURE-2.7 for system behavior monitored against
            expectations, MANAGE-1.3 for risk escalation, MANAGE-4.1 for
            post-deployment monitoring. That tag is attached once, at the
            point the check runs — not retrofitted later by a compliance team
            trying to reconstruct what happened from application logs never
            designed to answer that question.
          </p>
        </>
      ),
    },
    {
      heading: "Why this has to be architectural, not a spreadsheet",
      body: (
        <p>
          A control mapping built after the fact — a spreadsheet matching
          NIST subcategories to ISO clauses to EU AI Act articles — only
          proves the mapping exists on paper. It doesn&apos;t prove the
          control actually ran on a specific decision at a specific time. The
          difference matters the moment an auditor asks for evidence on one
          real transaction, not the policy document describing the intended
          process.
        </p>
      ),
    },
    {
      heading: "What this looks like in a real system",
      body: (
        <p>
          In our Governance Ledger demo, every model call our own routing
          infrastructure makes is logged automatically — not sampled, not
          added later — as a byproduct of how the router already works. That
          same principle extends to any agent action: the control tag is
          data on the decision record itself, which is what makes it possible
          to hand a reviewer one ledger and have it answer NIST, ISO, and EU
          AI Act questions without three different exports.
        </p>
      ),
    },
  ],
  relatedService: {
    href: "/solutions/ai-governance",
    label: "AI Governance engagement",
  },
  related: [
    { href: "/trust/framework-mapping", label: "See the full framework mapping" },
    { href: "/demos/governance-ledger", label: "See the live Governance Ledger" },
  ],
};

export default function FrameworkMappingArticle() {
  return <ArticlePage content={content} />;
}
