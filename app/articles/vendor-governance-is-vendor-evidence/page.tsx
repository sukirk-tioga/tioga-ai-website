import type { Metadata } from "next";
import Link from "next/link";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "A Vendor's Governance Module Is the Vendor's Evidence About Itself",
  description:
    "ERP vendors are expected to ship their own agent-governance modules. Useful — but the record such a module produces is the platform's account of its own behavior. Here is what to ask, with SAP's and Oracle's own documentation as the examples.",
  alternates: { canonical: "/articles/vendor-governance-is-vendor-evidence" },
  openGraph: {
    type: "article",
    publishedTime: "2026-09-19",
    title: "A Vendor's Governance Module Is the Vendor's Evidence About Itself — Tioga AI",
    description:
      "What an ERP vendor's own governance module can and can't evidence about agent writes, and five questions to ask before relying on it.",
  },
};

const linkClass = "underline hover:text-[var(--text)] transition-colors";
const linkStyle = { color: "var(--accent)" } as const;

const content: ArticleContent = {
  slug: "vendor-governance-is-vendor-evidence",
  query: "ERP vendor AI agent governance module audit evidence independent",
  date: "2026-09-19",
  title: "A vendor's governance module is the vendor's evidence about itself",
  dek: "ERP vendors are expected to ship their own agent-governance modules, and that is good news for buyers. It is not the end of the question: the record such a module produces is still the platform's account of its own behavior.",
  evidenceLabel:
    "Evidence: SAP Architecture Center, \"Third-Party MCP Access to SAP Solutions\" (last updated Jun 8, 2026); Oracle's E-Business Suite Adapter Capabilities documentation (via our earlier article); Forrester's Predictions 2026, which is a prediction, not a shipped-product fact.",
  sections: [
    {
      heading: "The prediction, taken seriously",
      body: (
        <p>
          Forrester&apos;s{" "}
          <a
            href="https://www.forrester.com/blogs/predictions-2026-ai-agents-changing-business-models-and-workplace-culture-impact-enterprise-software/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            style={linkStyle}
          >
            Predictions 2026
          </a>{" "}
          says half of enterprise ERP vendors will launch autonomous governance modules — combining explainable AI,
          automated audit trails, and real-time compliance monitoring. It is a prediction, dated November 2025, not a
          description of what ships today, and it is worth planning around rather than arguing with. If your ERP vendor
          governs the agents that run inside its platform, use it.
        </p>
      ),
    },
    {
      heading: "What such a module can and can't say",
      body: (
        <>
          <p>
            A vendor module governs the agent activity it hosts, inside its own estate. That is real value, and no one
            else is better placed to do it. But its audit trail is produced by the same platform whose behavior it
            describes. For a control owner or an auditor, that is the platform&apos;s account of itself — useful, and
            one input rather than the whole record.
          </p>
          <p>
            Two further limits follow from where the boundary sits. A write that reaches the system through a path the
            vendor did not host — a third-party MCP server, an RPA script, a call from another vendor&apos;s platform —
            is outside the module&apos;s field of view. And a write that crosses systems has an approval trail that ends
            at the edge of whichever platform started it.
          </p>
        </>
      ),
    },
    {
      heading: "What the vendors' own documentation says about the customer's half",
      body: (
        <>
          <p>
            SAP&apos;s Architecture Center page on{" "}
            <a
              href="https://architecture.learning.sap.com/docs/ref-arch/137800"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={linkStyle}
            >
              third-party MCP access to SAP solutions
            </a>{" "}
            (last updated June 8, 2026) says that the protocol specification is still maturing, with security,
            identity and governance requirements for enterprise deployments &ldquo;not yet fully addressed.&rdquo; SAP
            describes its own MCP Gateway as its answer for its own path. For customers and partners who build custom
            or third-party MCP servers, the same page assigns the controls to them — token exchange, input validation,
            rate limiting, circuit breakers, secrets management, and &ldquo;log every tool invocation including caller
            identity&rdquo; — and states that operational responsibility rests &ldquo;entirely with the customer or
            partner deploying it.&rdquo;
          </p>
          <p>
            That is a candid and reasonable statement of where a vendor&apos;s responsibility ends. It is also a
            description of the layer a buyer has to build or buy separately. On the Oracle side,{" "}
            <Link href="/articles/oracle-ebs-agent-attribution-gap" className={linkClass} style={linkStyle}>
              Oracle&apos;s own E-Business Suite adapter documentation states that HTTP Basic authentication is the only
              supported option for REST services in that release
            </Link>
            , so on that path every agent write reaches EBS under one shared service account. The limit belongs to that
            adapter, not to EBS or to Oracle&apos;s roadmap, and it is a good example of a vendor&apos;s sanctioned path
            leaving the attribution question open.
          </p>
        </>
      ),
    },
    {
      heading: "Five questions to ask any vendor governance module",
      body: (
        <ol className="list-decimal pl-5 space-y-2">
          <li>Whose identity does the target system&apos;s own audit log record for an agent write — the agent&apos;s, the requester&apos;s, or a shared integration account?</li>
          <li>Can the evidence be exported in a form a control owner or auditor can read without logging into the vendor&apos;s console?</li>
          <li>Does it cover writes that arrive through paths the vendor did not host, such as third-party MCP servers, RPA, or another platform&apos;s agent?</li>
          <li>What happens when an approval is denied or times out — and has anyone tested it?</li>
          <li>Who checks that the module&apos;s controls behave as described, and does that person work for the vendor?</li>
        </ol>
      ),
    },
    {
      heading: "Where this leaves a buyer",
      body: (
        <>
          <p>
            Use the vendor&apos;s module for what it governs. Keep whatever AI gateway or agent-security control plane you
            already run. Then close the part neither can vouch for on its own: that the write reached the system through
            its own application logic, that the system&apos;s native log attributes it, and that one record shows what was
            proposed, what policy ran, who approved, and what happened.
          </p>
          <p>
            Tioga does not replace a vendor module or a control plane. It scopes and builds that last layer — see the{" "}
            <Link href="/trust/evidence-map" className={linkClass} style={linkStyle}>
              agent action evidence map
            </Link>{" "}
            for what such a record should contain, and the free{" "}
            <Link href="/demos/agent-write-path-exposure-check" className={linkClass} style={linkStyle}>
              write-path exposure check
            </Link>{" "}
            for a five-minute read on your own write path.
          </p>
        </>
      ),
    },
  ],
  relatedService: {
    href: "/solutions/governed-write-path",
    label: "Agent-Ready ERP Diagnostic & Governed Write-Path",
  },
  related: [
    { href: "/trust/evidence-map", label: "Agent action evidence map" },
    { href: "/articles/oracle-ebs-agent-attribution-gap", label: "Oracle's own path into EBS can't attribute a write" },
    { href: "/demos/agent-write-path-exposure-check", label: "Free write-path exposure check" },
  ],
};

export default function VendorGovernanceIsVendorEvidencePage() {
  return <ArticlePage content={content} />;
}
