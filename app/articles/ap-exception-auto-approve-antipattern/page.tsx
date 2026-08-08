import type { Metadata } from "next";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "Why 'Auto-Approve Everything Under $X' Is an AP Governance Anti-Pattern",
  description:
    "A single spend threshold isn't a policy — it's a policy with one rule. Real accounts-payable exception handling needs scope, spend tiers, and ERP-level validation as independent layers.",
  alternates: { canonical: "/articles/ap-exception-auto-approve-antipattern" },
  openGraph: {
    type: "article",
    publishedTime: "2026-08-03",
    title: "Auto-Approve Everything Under $X Is an Anti-Pattern — Tioga AI",
    description: "What real AP exception-handling policy looks like, with a bug we found building it.",
  },
};

const content: ArticleContent = {
  slug: "ap-exception-auto-approve-antipattern",
  query: "accounts payable exception handling automation policy",
  date: "2026-08-03",
  title: "Why \"auto-approve everything under $X\" is an AP governance anti-pattern",
  dek: "A single spend threshold is a policy with exactly one rule. Real accounts-payable exception handling needs independent layers — and the layer everyone skips is what happens after something executes.",
  evidenceLabel: "Evidence: the actual three-tier policy from our live Governed AP Exception Workflow demo, plus a rollback bug we caught and fixed while building it.",
  sections: [
    {
      heading: "One threshold isn't a policy",
      body: (
        <p>
          &ldquo;Auto-approve anything under $5,000&rdquo; sounds like
          governance but is really just one number. Our demo uses that
          number as one tier of three: under $5,000 executes autonomously,
          up to $25,000 escalates to a named human approver, and above that
          there is no execution path at all — not a higher approval tier, a
          hard stop. Collapsing that into a single cutoff either blocks
          routine variances that should auto-clear, or lets six-figure
          exceptions through unattended.
        </p>
      ),
    },
    {
      heading: "Scope has to be checked before spend",
      body: (
        <p>
          A spend threshold alone also can&apos;t catch an out-of-scope
          action — in our demo, an attempt to release a vendor&apos;s credit
          hold directly gets blocked on scope before the dollar amount is
          even evaluated, because that action type was never authorized for
          this agent regardless of size. A policy that only checks amount
          would let a $10 unauthorized action straight through.
        </p>
      ),
    },
    {
      heading: "The layer that catches what policy can't",
      body: (
        <p>
          Policy passing doesn&apos;t mean the underlying system should
          accept the change. In our demo, an invoice adjustment can clear
          every policy check and still get rejected because the vendor is on
          credit hold in the ERP itself — a fact the policy engine doesn&apos;t
          and shouldn&apos;t need to know about. Two independent layers catch
          different failure modes; collapsing them into one threshold loses
          both.
        </p>
      ),
    },
    {
      heading: "What we got wrong the first time",
      body: (
        <p>
          Building this demo, our first version of rollback let a single
          executed action be reversed more than once — click it twice and
          the underlying PO amount silently drifted further than it should.
          The fix was to make an executed action&apos;s reversal path
          disappear permanently once a rollback referencing it exists. Worth
          naming directly: even a system designed around governance from the
          start can miss an edge case like this — the fix is testing for it
          explicitly, not assuming a well-intentioned design gets it right by
          default.
        </p>
      ),
    },
  ],
  relatedService: {
    href: "/solutions/ap-automation",
    label: "AP Automation engagement",
  },
  related: [
    { href: "/demos/ap-exception-workflow", label: "Try the live demo" },
    { href: "/articles/governed-write-path-pattern", label: "The full governed write-path pattern" },
  ],
};

export default function ApExceptionAntiPatternArticle() {
  return <ArticlePage content={content} />;
}
