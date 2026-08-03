import type { Metadata } from "next";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "How a Governed AI Write-Path Actually Works",
  description:
    "Read, decide, approve, execute, audit, rollback — the seven-stage pattern that lets an AI agent write to a production ERP without a direct database write.",
  openGraph: {
    title: "How a Governed AI Write-Path Actually Works — Tioga AI",
    description: "The seven-stage pattern for letting an AI agent write to your ERP safely.",
  },
};

const content: ArticleContent = {
  slug: "governed-write-path-pattern",
  query: "governed AI write path ERP",
  title: "How a governed AI write-path actually works",
  dek: "Most \"AI for ERP\" pitches stop at read-only. Here's the seven-stage pattern — read, decide, approve, execute, audit, reject, rollback — implemented as actual running code, not a slide.",
  evidenceLabel: "Evidence: real policy code and a real bug caught during testing, both from our live Governed AP Exception Workflow demo.",
  sections: [
    {
      heading: "The pattern, concretely",
      body: (
        <>
          <p>
            Our live demo (linked below) proposes a fix to an invoice that failed
            three-way match, then runs it through a policy engine that&apos;s
            under 60 lines of code, on purpose — an internal-audit reviewer
            should be able to read it without an engineer in the room.
          </p>
          <p>
            The routing is a spend-tiered ladder: actions under $5,000 execute
            autonomously, up to $25,000 route to a named human approver, and
            anything above that is blocked outright with no override path at
            that layer. That&apos;s not a UI restriction — it&apos;s enforced in
            the same code path every request goes through, whether it came from
            an agent or a human clicking a button.
          </p>
        </>
      ),
    },
    {
      heading: "Two independent layers of defense",
      body: (
        <p>
          The policy engine is one layer. The ERP&apos;s own application logic
          is a second, independent one — our mock validates vendor status and
          PO ceiling on every write, the same way real Oracle EBS Forms/PL-SQL
          logic does. In our demo, a scenario can pass every policy check the
          gateway runs and still get blocked because the vendor is on credit
          hold — the governance layer isn&apos;t pretending to replace the
          system&apos;s own business rules, it sits alongside them.
        </p>
      ),
    },
    {
      heading: "The part most reference implementations skip: rollback",
      body: (
        <>
          <p>
            Approval and rejection are the two outcomes everyone builds.
            Reversing an action that already executed is the one that gets
            skipped — and it&apos;s where we found a real bug while building
            this demo: the first version let you roll back the same executed
            action twice, silently double-reversing the underlying PO amount.
          </p>
          <p>
            The fix wasn&apos;t a UI tweak — it&apos;s a governance invariant:
            once a rollback ledger entry exists referencing an action, that
            action&apos;s reversal path disappears permanently, enforced in the
            state logic itself, not just hidden in the UI. A compliance ledger
            that lets you reverse a reversal isn&apos;t a compliance ledger.
          </p>
        </>
      ),
    },
    {
      heading: "Why this maps to NIST AI RMF, not just \"best practice\"",
      body: (
        <p>
          Each policy check in the demo carries an explicit control tag —
          scope enforcement maps to GOVERN-1.5, spend-tier escalation to
          MANAGE-1.3, ERP validation to MEASURE-2.7, and the audit ledger
          itself to MANAGE-4.1. That&apos;s not decoration: it&apos;s what turns
          a ledger row into evidence a control owner can actually cite, not
          just a log line an engineer can point to.
        </p>
      ),
    },
  ],
  relatedService: {
    href: "/solutions/governed-write-path",
    label: "Agent-Ready ERP Diagnostic & Governed Write-Path",
  },
  related: [
    { href: "/demos/ap-exception-workflow", label: "Try the live demo" },
    { href: "/trust/framework-mapping", label: "See the full NIST AI RMF mapping" },
  ],
};

export default function GovernedWritePathArticle() {
  return <ArticlePage content={content} />;
}
