import type { Metadata } from "next";
import Link from "next/link";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "Oracle's Own Sanctioned Path Into EBS Can't Tell You Which Agent Did What",
  description:
    "Oracle's own E-Business Suite Adapter documentation states HTTP Basic Auth is the only supported authentication for REST services — a static, shared service account, not per-user or per-agent identity.",
  alternates: { canonical: "/articles/oracle-ebs-agent-attribution-gap" },
  openGraph: {
    type: "article",
    publishedTime: "2026-09-07",
    title: "Oracle's Own Sanctioned Path Into EBS Can't Attribute a Write — Tioga AI",
    description:
      "A structural attribution gap in Oracle's own shipped integration path into E-Business Suite, verified against Oracle's own documentation.",
  },
};

const content: ArticleContent = {
  slug: "oracle-ebs-agent-attribution-gap",
  query: "oracle ebs ai agent identity attribution governance",
  date: "2026-09-07",
  title: "Oracle's own sanctioned path into EBS can't tell you which agent did what",
  dek: "Even if an AI agent acts inside Oracle E-Business Suite through Oracle's own integration path, Oracle's own documentation says the credential making every call is a single shared service account — not the human or agent who asked.",
  evidenceLabel:
    "Evidence: Oracle's own E-Business Suite Adapter Capabilities documentation and Oracle A-Team published proof-of-concept, both cited directly below.",
  sections: [
    {
      heading: "What Oracle's own documentation says",
      body: (
        <>
          <p>
            Oracle&apos;s{" "}
            <a
              href="https://docs.oracle.com/en/cloud/paas/application-integration/e-business-adapter/oracle-e-business-suite-adapter-capabilities.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--text)] transition-colors"
              style={{ color: "var(--accent)" }}
            >
              E-Business Suite Adapter Capabilities
            </a>{" "}
            documentation — the adapter Oracle Integration Cloud (OIC) uses
            to reach EBS, and the same adapter Oracle&apos;s own reference
            architecture for AI-agent access routes through — states,
            verbatim: &ldquo;HTTP Basic Authentication is the only supported
            authentication security for REST services in this release.&rdquo;
          </p>
          <p>
            The username and password are set once, on the adapter
            connection itself, and passed through at runtime for every
            call. That means the credential actually reaching EBS is a
            single, static, shared service account — identical for every
            request, whether it was triggered by one employee, a different
            employee, or an autonomous agent acting on either one&apos;s
            behalf.
          </p>
        </>
      ),
    },
    {
      heading: "Why that breaks attribution, not just \"logging\"",
      body: (
        <p>
          EBS&apos;s own audit columns — <code>CREATED_BY</code> and{" "}
          <code>LAST_UPDATED_BY</code>, the fields an auditor or control
          owner actually pulls to answer &ldquo;who did this&rdquo; — record
          whatever identity authenticated the call. On this path, that
          identity is always the integration account, never the human who
          asked or the agent that acted. An agent could execute a real
          write inside EBS through Oracle&apos;s own sanctioned interface,
          and EBS&apos;s own evidence trail would show the same generic
          service account it shows for every other integration call ever
          made through that connection — a present-tense limitation in
          shipped Oracle documentation, not a roadmap gap Oracle has
          promised to close.
        </p>
      ),
    },
    {
      heading: "Where this is actually further along, and where it isn't",
      body: (
        <>
          <p>
            Oracle&apos;s own A-Team — its solution-architecture group —
            published a{" "}
            <a
              href="https://www.ateam-oracle.com/fusion-ai-agents-and-e-business-suite-integration"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--text)] transition-colors"
              style={{ color: "var(--accent)" }}
            >
              proof of concept
            </a>{" "}
            routing a Fusion AI Agent through OIC&apos;s hosted MCP server
            and this same EBS Adapter — explicitly &ldquo;the proposed
            pattern,&rdquo; in Oracle&apos;s own words, not a shipped
            product. The only capability it actually demonstrates is a{" "}
            <strong style={{ color: "var(--text)" }}>read</strong>: a single
            identity lookup, in 6.24 seconds. Oracle&apos;s own adoption
            guidance describes usage expanding &ldquo;as tool contracts,
            approval rules, and observability mature&rdquo; — Oracle
            conceding, in its own materials, that those three aren&apos;t
            mature yet.
          </p>
          <p>
            Two honest caveats worth carrying alongside the finding above,
            so this doesn&apos;t overstate the case: identity propagation
            does appear to be possible on other OIC adapters, and EBS&apos;s
            own Integrated SOA Gateway reportedly supports token-based
            authentication in addition to Basic Auth. Neither was
            independently verified end-to-end for this piece. That cuts the
            other way from a marketing claim — it means the constraint
            described above is a property of the specific adapter and
            integration path Oracle&apos;s own reference architecture uses
            today, not an unfixable law of EBS itself. It&apos;s an argument
            for building a better path deliberately, not evidence the gap
            is already closed.
          </p>
          <p>
            On the write side specifically, this adapter reaches PL/SQL
            APIs, concurrent programs, Java/OAF services, and interface
            tables — but not Oracle Forms, <code>CUSTOM.pll</code>, or Forms
            personalizations, where a large share of a customized R12
            instance&apos;s real validation logic actually lives. Whether a
            given write is fully governed ends up depending on which
            interface an integration admin chose to expose, and whether its
            validation chain actually matches the one your Forms UI
            enforces — instance-specific configuration knowledge no Oracle
            product resolves for you.
          </p>
        </>
      ),
    },
    {
      heading: "What this means if you're evaluating \"AI for EBS\"",
      body: (
        <p>
          &ldquo;Governed by the vendor&rdquo; and &ldquo;attributable to a
          specific actor&rdquo; are two different claims, and it&apos;s
          worth asking any vendor — Oracle included — which one they&apos;re
          actually making for a given integration path. A written policy
          about who&apos;s allowed to do what is necessary but not
          sufficient if the system underneath it can&apos;t distinguish one
          caller from another. This is exactly the gap Tioga&apos;s{" "}
          <Link
            href="/solutions/oracle"
            className="underline hover:text-[var(--text)] transition-colors"
            style={{ color: "var(--accent)" }}
          >
            Oracle EBS engagement
          </Link>{" "}
          is built to close: a governed write-path that preserves per-actor
          identity through EBS&apos;s own application logic layer, instead
          of collapsing every call into one shared account.
        </p>
      ),
    },
  ],
  relatedService: {
    href: "/solutions/oracle",
    label: "AI Agents for Oracle EBS",
  },
  related: [
    { href: "/solutions/governed-write-path", label: "The governed write-path pattern" },
    { href: "/demos/ap-exception-workflow", label: "Try the governed AP exception demo" },
  ],
};

export default function OracleEbsAgentAttributionGapArticle() {
  return <ArticlePage content={content} />;
}
