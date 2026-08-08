import type { Metadata } from "next";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "MCP Integration Still Needs Approval Gates",
  description:
    "Model Context Protocol makes the interface standard, but it doesn't grant scope enforcement, rate limiting, or an audit trail for free — those still have to be built in.",
  alternates: { canonical: "/articles/mcp-scoped-permissions" },
  openGraph: {
    type: "article",
    publishedTime: "2026-08-03",
    title: "MCP Integration Still Needs Approval Gates — Tioga AI",
    description: "What MCP standardizes, and what it doesn't — with real code.",
  },
};

const content: ArticleContent = {
  slug: "mcp-scoped-permissions",
  query: "MCP security scoped permissions enterprise",
  date: "2026-08-03",
  title: "An MCP integration still needs the same approval gates a custom API integration needs",
  dek: "\"We're using MCP\" answers what interface an agent talks to. It doesn't answer what the agent is allowed to do, how fast, or what gets logged — those are still separate design decisions.",
  evidenceLabel: "Evidence: real rate-limiting and tool-attribution code from our live MCP integration demo.",
  sections: [
    {
      heading: "What MCP actually standardizes",
      body: (
        <p>
          Model Context Protocol solves a real, narrow problem: it gives an
          AI agent one consistent way to call into Workday, Salesforce, SAP,
          or any other system, instead of a bespoke integration per system per
          agent. That&apos;s a genuine engineering win — it&apos;s not a
          governance win by itself, and pitches that imply MCP alone
          &ldquo;replaces integrations&rdquo; or removes the need for
          controls are overstating what the protocol does.
        </p>
      ),
    },
    {
      heading: "What still has to be built underneath it",
      body: (
        <>
          <p>
            Our own MCP demo enforces a hard per-IP rate limit (20 requests)
            on the endpoint before a single call reaches the model — a basic
            control an MCP connection doesn&apos;t give you automatically.
            The system prompt also requires the model to return which
            specific tool it called and with what data, in a structured
            format the application parses back out — so &ldquo;the agent
            answered a question&rdquo; is always paired with &ldquo;here is
            exactly which system record it touched to answer it.&rdquo;
          </p>
          <p>
            Neither of those is an MCP feature. They&apos;re governance
            decisions that have to be made explicitly, the same way they
            would for a hand-rolled REST integration — MCP standardizes the
            wire format, not the authorization model on top of it.
          </p>
        </>
      ),
    },
    {
      heading: "The question to actually ask a vendor",
      body: (
        <p>
          Not &ldquo;do you support MCP&rdquo; — almost everyone will soon.
          Ask what happens when the agent asks for something out of its
          granted scope, what the rate and spend ceilings are, and what
          evidence exists after the fact showing which tool call produced
          which answer. If the answer is &ldquo;MCP handles that,&rdquo; it
          doesn&apos;t — the protocol carries the request, not the policy.
        </p>
      ),
    },
  ],
  relatedService: {
    href: "/solutions/mcp-security",
    label: "MCP Security engagement",
  },
  related: [
    { href: "/mcp", label: "Try the live MCP demo" },
    { href: "/mcp/vs-rpa", label: "MCP vs. RPA" },
    { href: "/mcp/vs-custom-integration", label: "MCP vs. custom integration" },
  ],
};

export default function McpScopedPermissionsArticle() {
  return <ArticlePage content={content} />;
}
