import type { Metadata } from "next";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "What a Real AI Cost-Governance Ledger Looks Like",
  description:
    "88% of our own model calls settle at $0 before touching billed credit — real numbers from a live routing gateway, not a projected savings estimate.",
  openGraph: {
    title: "What a Real AI Cost-Governance Ledger Looks Like — Tioga AI",
    description: "Real numbers from a live AI routing gateway, not a projection.",
  },
};

const content: ArticleContent = {
  slug: "ai-cost-governance-ledger",
  query: "AI cost governance model routing enterprise",
  title: "What a real AI cost-governance ledger looks like",
  dek: "Cost governance for AI usually gets pitched as a future dashboard. Here's a live one, running on our own infrastructure, with the actual numbers.",
  evidenceLabel: "Evidence: a real, unsampled excerpt from our own AI routing gateway's ledger — not a projection.",
  sections: [
    {
      heading: "The number that matters isn't the total spend",
      body: (
        <p>
          Our own routing gateway has logged 17 model calls in its current
          window, spending $0.000958 against a $30 cap. The interesting
          number isn&apos;t the total — it&apos;s that only 2 of those 17
          calls ever touched a paid backend. 88% settled at $0 on a local or
          free tier before any billed credit was at risk, by policy, not by
          luck.
        </p>
      ),
    },
    {
      heading: "Why this requires routing, not just tracking",
      body: (
        <p>
          Cost governance tools that only measure spend after the fact tell
          you what happened. A router that decides, per call, whether a free
          local model, Google&apos;s free tier, or a paid OpenRouter backend
          actually serves the request changes what happens — the $30 monthly
          cap is a policy enforced before the call, with a per-request
          ceiling checked independently, not a number a dashboard reports
          after the bill arrives.
        </p>
      ),
    },
    {
      heading: "What gets logged, and why it's unsampled",
      body: (
        <p>
          Every call records what model was requested versus what actually
          served it, tokens in and out, and cost — every call, not a
          statistical sample. That distinction matters for the same reason
          it matters in the governance frameworks this maps to (NIST AI RMF
          MANAGE-1.3, MAP, and MEASURE functions, see the framework mapping
          below): a sampled log can miss the one call that mattered. An
          unsampled one can&apos;t.
        </p>
      ),
    },
  ],
  relatedService: {
    href: "/services",
    label: "AI Cost & Model Governance Assessment",
  },
  related: [
    { href: "/demos/governance-ledger", label: "See the live ledger" },
    { href: "/articles/framework-mapping-not-three-checklists", label: "How this maps to NIST AI RMF" },
  ],
};

export default function CostGovernanceArticle() {
  return <ArticlePage content={content} />;
}
