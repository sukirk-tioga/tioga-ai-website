import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Log",
  description:
    "What's actually shipped on tioga.ai, in order — a running build log in place of case studies we haven't had time to write yet.",
  openGraph: {
    title: "Build Log — Tioga AI",
    description: "What's actually shipped on tioga.ai, in order, since launch.",
  },
};

type Kind = "Feature" | "Fix" | "Infra" | "Content";

interface Entry {
  date: string;
  kind: Kind;
  title: string;
  body: string;
}

// Curated from git history — collapses the many small commits behind each
// shipped unit of work into one entry. Dates are the day the unit landed.
const ENTRIES: Entry[] = [
  {
    date: "2026-07-27",
    kind: "Content",
    title: "MCP vs. custom integration comparison page",
    body: "First entry in an ongoing buyer-education content track: what actually changes when a system is connected via an MCP tool server instead of a point-to-point integration — including where custom integration is still the simpler, correct choice.",
  },
  {
    date: "2026-07-27",
    kind: "Content",
    title: "Live gateway snapshot on the Governance Ledger",
    body: "Extended the ledger demo with real, freshly-checked numbers from the gateway's own status tool — budget cap, current spend, per-request ceiling, backend health — clearly dated separately from the historical Jul 17-25 ledger rows so the two snapshots aren't conflated.",
  },
  {
    date: "2026-07-27",
    kind: "Feature",
    title: "EU AI Act readiness calculator",
    body: "An interactive risk-tier check — deliberately built as deterministic, rules-based logic rather than a model call, since real regulatory classification isn't something to let an LLM improvise on a live compliance page.",
  },
  {
    date: "2026-07-27",
    kind: "Content",
    title: "NIST AI RMF ↔ ISO 42001 framework mapping",
    body: "A conceptual alignment between NIST's four functions and what ISO 42001 requires organizations to address — deliberately scoped to what could be verified against public sources, since Tioga AI is not yet ISO 42001 certified.",
  },
  {
    date: "2026-07-27",
    kind: "Content",
    title: "Engineering writeups for the live demos",
    body: "\"How we built it\" pages for the invoice processing, email triage, and migration assessment demos — model choices, input validation, and rate limiting, grounded in the actual route code, not a summary of it.",
  },
  {
    date: "2026-07-27",
    kind: "Content",
    title: "EU AI Act exposure page",
    body: "A dedicated penalty-structure explainer — Article 99's three tiers, what's already enforceable versus what phases in through August 2026 — linked from the Trust page.",
  },
  {
    date: "2026-07-27",
    kind: "Content",
    title: "Founder, Trust, and Build Log pages",
    body: "Closed the biggest content gap on the site: zero founder content existed anywhere. Added an About page, a consolidated NIST AI RMF / ISO 42001 / EU AI Act Trust page, and this build log itself.",
  },
  {
    date: "2026-07-27",
    kind: "Infra",
    title: "Two-tier automated QA suite",
    body: "Added a Playwright E2E suite: a structural pass (every page loads, correct title, no console errors, nav/footer links resolve) that runs free on every push, plus a functional pass that calls the live Claude-powered demos and runs on a daily cron.",
  },
  {
    date: "2026-07-27",
    kind: "Content",
    title: "Per-page SEO metadata, OG images, sitemap",
    body: "Every page now has its own title and description instead of sharing the homepage's. Added a generated OG/Twitter card image, robots.txt, and sitemap.xml.",
  },
  {
    date: "2026-07-27",
    kind: "Fix",
    title: "Chat widget markdown rendering",
    body: "The site's Claude-powered chat assistant was leaking raw **markdown** asterisks instead of rendering formatted text. Switched to react-markdown.",
  },
  {
    date: "2026-07-27",
    kind: "Fix",
    title: "Migration Assessment demo outage",
    body: "The live EBS → S/4HANA readiness demo was returning 502s after Anthropic retired the claude-sonnet-4-20250514 model ID it was pinned to. Repointed to claude-sonnet-5.",
  },
  {
    date: "2026-07-26",
    kind: "Feature",
    title: "Governance Ledger demo",
    body: "A live demo built from a real excerpt of the AI routing gateway this business runs its own infrastructure on — every model call logged, costed, budget-capped, and mapped to the four functions of the NIST AI RMF. Not a simulation.",
  },
  {
    date: "2026-06-10",
    kind: "Feature",
    title: "Migration Assessment demo",
    body: "Added a live EBS → S/4HANA migration readiness assessment agent to the demos page, and promoted it to the homepage's \"Try It Right Now\" strip.",
  },
  {
    date: "2026-05-17",
    kind: "Content",
    title: "Homepage and Services repositioning",
    body: "New hero (\"The systems you stand on / Will stand on AI\"), and the Services section rebuilt around three entry-point offer tiles with a dedicated /services page listing the full ten-offer portfolio.",
  },
  {
    date: "2026-03-01",
    kind: "Content",
    title: "Brand identity",
    body: "Custom logo, favicon, and nav/footer/chat-widget iconography replacing the placeholder assets from launch.",
  },
  {
    date: "2026-02-27",
    kind: "Feature",
    title: "MCP Showcase page",
    body: "An interactive page explaining the Model Context Protocol with an animated architecture diagram, a live demo against mock SAP/Salesforce data, and real connector code examples.",
  },
  {
    date: "2026-02-27",
    kind: "Feature",
    title: "Live AI Demos launched",
    body: "Invoice processing, email triage, and document classification — the first interactive, file-upload-capable demos on the site, plus a full homepage redesign around a demo-first approach.",
  },
  {
    date: "2026-02-25",
    kind: "Infra",
    title: "tioga.ai goes live",
    body: "Initial launch: Next.js + Tailwind site with a Claude-powered chat assistant and a smart contact form that classifies inbound inquiries.",
  },
];

const KIND_STYLE: Record<Kind, { color: string; bg: string }> = {
  Feature: { color: "#00D4FF", bg: "#00D4FF15" },
  Fix: { color: "#F59E0B", bg: "#F59E0B15" },
  Infra: { color: "#8B5CF6", bg: "#8B5CF615" },
  Content: { color: "#4ADE80", bg: "#4ADE8015" },
};

export default function ChangelogPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "#0A0F1C" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "#00D4FF" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Build Log
        </div>
        <h1 className="text-4xl font-bold text-white mb-5 leading-tight">
          What actually shipped
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-16">
          Tioga AI is a solo practice, pre-launch — there are no client case
          studies yet. This is the substitute: a running log of what&apos;s
          actually built and live on this site, in order, sourced directly
          from the commit history. No slide decks, no roadmap items presented
          as done.
        </p>

        <div className="relative pl-8">
          <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "#1E2D4A" }} />
          <div className="space-y-8">
            {ENTRIES.map((e, i) => (
              <div key={i} className="relative">
                <div
                  className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full"
                  style={{ background: "#0A0F1C", border: `2px solid ${KIND_STYLE[e.kind].color}` }}
                />
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs font-mono text-slate-500">{e.date}</span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: KIND_STYLE[e.kind].color, background: KIND_STYLE[e.kind].bg }}
                  >
                    {e.kind}
                  </span>
                </div>
                <h2 className="text-white font-semibold mb-1.5">{e.title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">{e.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-slate-600 mb-4">
            Curious how something was built?{" "}
            <a href="/engineering" style={{ color: "#00D4FF" }} className="hover:text-white transition-colors">
              Read the engineering writeups →
            </a>
            {" "}or see the{" "}
            <a href="/trust" style={{ color: "#00D4FF" }} className="hover:text-white transition-colors">
              governance approach →
            </a>
          </p>
          <a
            href="/#contact"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            Start a conversation
          </a>
        </div>
      </section>
    </main>
  );
}
