import type { Metadata } from "next";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";
import { TOTAL_CALLS, PAID_COUNT, FREE_COUNT, FREE_ZERO_COST_COUNT, FREE_ZERO_COST_PCT } from "@/lib/governance-ledger";

export const metadata: Metadata = {
  title: "What a Real AI Cost-Governance Ledger Looks Like",
  description:
    `${FREE_ZERO_COST_PCT}% of our own model calls settle at exactly $0 before touching billed credit — real numbers from a live routing gateway, not a projected savings estimate.`,
  alternates: { canonical: "/articles/ai-cost-governance-ledger" },
  openGraph: {
    type: "article",
    publishedTime: "2026-08-03",
    title: "What a Real AI Cost-Governance Ledger Looks Like — Tioga AI",
    description: "Real numbers from a live AI routing gateway, not a projection.",
  },
};

const content: ArticleContent = {
  slug: "ai-cost-governance-ledger",
  query: "AI cost governance model routing enterprise",
  date: "2026-08-03",
  title: "What a real AI cost-governance ledger looks like",
  dek: "Cost governance for AI usually gets pitched as a future dashboard. Here's a live one, running on our own infrastructure, with the actual numbers.",
  evidenceLabel: "Evidence: a real, unsampled excerpt from our own AI routing gateway's ledger — not a projection.",
  sections: [
    {
      heading: "The number that matters isn't the total spend",
      body: (
        <p>
          Our own routing gateway has logged {TOTAL_CALLS} model calls in its
          current window, spending $0.000958 against a $30 cap. The
          interesting number isn&apos;t the total — it&apos;s that only{" "}
          {PAID_COUNT} of those {TOTAL_CALLS} calls ever touched a paid
          backend ({FREE_COUNT} routed to a local or free tier instead, by
          policy, not by luck). Of those {FREE_COUNT} free-pool calls,{" "}
          {FREE_ZERO_COST_COUNT} settled at exactly $0 — the remaining few
          resolved to a Gemini backend that still carries a
          fraction-of-a-cent cost, so &quot;free-tier&quot; and &quot;$0&quot;
          aren&apos;t quite the same claim: {FREE_ZERO_COST_PCT}% of all{" "}
          {TOTAL_CALLS} calls settled at exactly $0.
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
