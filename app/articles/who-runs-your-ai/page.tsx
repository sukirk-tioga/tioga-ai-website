import type { Metadata } from "next";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "Who's Really Running Your AI?",
  description:
    "In the last 12 months, seven of the nine enterprise systems we track each independently signed their own LLM-vendor deals. Here's who anchored to which lab, and what nobody's console shows you.",
  alternates: { canonical: "/articles/who-runs-your-ai" },
  openGraph: {
    type: "article",
    publishedTime: "2026-08-26",
    title: "Who's Really Running Your AI? — Tioga AI",
    description: "The LLM deals your platform vendors signed for you, system by system.",
  },
};

const content: ArticleContent = {
  slug: "who-runs-your-ai",
  query: "which LLM powers my ERP CRM enterprise AI agents",
  date: "2026-08-26",
  title: "Who's really running your AI?",
  dek: "In the last 12 months, seven of the nine enterprise systems we track each independently signed their own deal with an AI lab. Most companies running two or three of these platforms have never added up what that means.",
  evidenceLabel: "Evidence: primary vendor announcements and documentation, dated per row — not analyst summaries.",
  sections: [
    {
      heading: "Your vendors picked your model for you",
      body: (
        <>
          <p>
            If your company runs SAP, Salesforce, ServiceNow, Snowflake, or
            Workday, an AI lab is already running inside at least one of them
            — and you didn&apos;t sign that contract. Each of these vendors
            independently decided which large language model to build its
            agent features on, over roughly the same twelve months, largely
            without coordinating with each other or announcing it as a single
            industry moment.
          </p>
          <p>
            That&apos;s not a criticism of any one vendor&apos;s choice. It&apos;s
            a fact about your risk surface that&apos;s easy to miss when each
            announcement lands separately, months apart, from a different
            vendor&apos;s press office.
          </p>
        </>
      ),
    },
    {
      heading: "The landscape, system by system",
      body: (
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="text-left py-3 pr-4 font-semibold text-white whitespace-nowrap">System</th>
                <th className="text-left py-3 pr-4 font-semibold text-white">LLM posture</th>
                <th className="text-left py-3 font-semibold text-white">What changed</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {[
                ["SAP", "Anthropic named", "Claude named “a primary reasoning and agentic capability” across the Autonomous Enterprise (Sapphire, May 2026) — alongside separate deals with Mistral, Cohere, and OpenAI via SAP’s EU AI Cloud."],
                ["Oracle", "No lab partnership", "Verified directly against Oracle’s own OCI model catalog: no Anthropic model appears anywhere. Oracle added Google Gemini to Agent Studio in July 2026; its own AI stays model-agnostic by vendor choice."],
                ["Salesforce", "Anthropic named", "“Claudeforce,” announced Aug 2026: Claude set as the default model across six Salesforce surfaces, including a new plugin that acts on live CRM records."],
                ["ServiceNow", "Anthropic + OpenAI, both named", "Signed multi-year deals with OpenAI and Anthropic one week apart (Jan 2026), then retired its own in-house model as the platform default in favor of both."],
                ["Snowflake", "Anthropic + OpenAI, both named", "Symmetric $200M partnerships with Anthropic and OpenAI; Claude specifically powers Snowflake’s own Intelligence/CoWork features."],
                ["Databricks", "No single lab — hosts all of them", "Signed deals with Anthropic, OpenAI, and others, but the product itself is built to host and switch between any model — including open-weight ones — rather than anchor to one."],
                ["Workday", "Google named", "Expanded Google partnership (May 2026): Gemini is now the default model for Workday’s Sana agent front door."],
                ["Microsoft", "Anthropic + OpenAI, both deeply embedded", "~27% owner of OpenAI and a multi-billion-dollar investor in Anthropic at the same time; Claude is set as the default AI processor across most Microsoft 365 commercial tenants."],
                ["Palantir", "No lab partnership (by design)", "Stays strictly multi-model on its own platform. Its Anthropic relationship is a government-cloud distribution deal, not a product anchor."],
              ].map(([system, posture, change]) => (
                <tr key={system} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-3 pr-4 font-medium text-white whitespace-nowrap">{system}</td>
                  <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">{posture}</td>
                  <td className="py-3 text-slate-400 leading-relaxed">{change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      heading: "The question none of these vendors can answer about the others",
      body: (
        <>
          <p>
            Run SAP and Salesforce together, and you&apos;re touching
            Anthropic through two separate contracts you never signed with
            Anthropic. Add Snowflake, and it&apos;s a third. None of these
            platforms&apos; own governance consoles see past their own walls
            — SAP&apos;s agent-governance tooling can&apos;t see what&apos;s
            running inside Salesforce, and Salesforce&apos;s audit trail
            can&apos;t see SAP.
          </p>
          <p>
            Microsoft&apos;s Agent 365 is the one product that markets a
            cross-platform view, and it&apos;s a genuinely useful inventory
            of which agents exist and how they&apos;re configured across
            several of these systems. What it doesn&apos;t answer is which
            model lab sits under which vendor contract, on what data terms,
            or what your combined exposure looks like if one of those labs
            changes its terms — a different question, and one Microsoft has
            its own stake in either lab&apos;s answer to.
          </p>
          <p>
            None of this means any of these AI-vendor choices are wrong. It
            means the aggregate view — what you&apos;re actually running,
            across every vendor, under whose contract — isn&apos;t something
            any single platform is positioned to hand you.
          </p>
        </>
      ),
    },
  ],
  relatedService: {
    href: "/solutions/standing-watch",
    label: "Standing Watch Assessment",
  },
  related: [
    { href: "/solutions/standing-watch", label: "How Standing Watch governs across the seams" },
    { href: "/engineering/standing-watch", label: "Read the full engineering writeup" },
  ],
};

export default function WhoRunsYourAiArticle() {
  return <ArticlePage content={content} />;
}
