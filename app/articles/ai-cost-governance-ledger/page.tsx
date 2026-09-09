import type { Metadata } from "next";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";
import { TOTAL_CALLS, PAID_COUNT, FREE_COUNT, FREE_ZERO_COST_COUNT, FREE_ZERO_COST_PCT, TOTAL_SPEND } from "@/lib/governance-ledger";

export const metadata: Metadata = {
  title: "What a Real AI Cost-Governance Ledger Looks Like",
  description:
    `A live AI routing gateway logs, costs, and caps every model call automatically — real numbers, not a projected savings estimate, even as real usage growth shifts the free/paid mix window to window.`,
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
  dek: "Cost governance for AI usually gets pitched as a future dashboard. Here's a live one, running on my own infrastructure, with the actual numbers.",
  evidenceLabel: "Evidence: a real, unsampled excerpt from my own AI routing gateway's ledger — not a projection.",
  sections: [
    {
      heading: "The number that matters isn't the total spend",
      body: (
        <p>
          My own routing gateway has logged {TOTAL_CALLS} model calls in its
          current window, spending ${TOTAL_SPEND.toFixed(6)} against a $30
          cap — still a rounding error. The interesting number isn&apos;t the
          total, though; it&apos;s what happens to the free/paid split as
          real usage grows. {PAID_COUNT} of those {TOTAL_CALLS} calls
          resolved to a paid OpenRouter backend this window, versus{" "}
          {FREE_COUNT} that stayed on a local or Google free tier — a very
          different ratio from an earlier capture of this same ledger, when
          the free tier absorbed most of the volume. The routing policy
          hasn&apos;t changed: free and cheap backends are still tried
          first, by policy, not by luck. What changed is that real call
          volume has grown past what those backends alone can cover, so more
          calls now resolve to paid credit before the $30 cap is ever at
          risk. {FREE_ZERO_COST_COUNT} of {TOTAL_CALLS} calls in this window
          settled at exactly $0 ({FREE_ZERO_COST_PCT}%) — worth naming
          honestly rather than only ever citing whichever window&apos;s
          numbers look best.
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
