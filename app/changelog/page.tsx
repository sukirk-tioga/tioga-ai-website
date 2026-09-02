import type { Metadata } from "next";
import Link from "next/link";
import ChangelogBeat from "@/components/ChangelogBeat";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Build Log",
  description:
    "What's actually shipped on tioga.ai, in order — a running build log in place of case studies we haven't had time to write yet.",
  alternates: { canonical: "/changelog" },
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
    date: "2026-08-08",
    kind: "Feature",
    title: "A looping sample-run widget in the hero — the highest-ceiling item from the design review, scoped honestly",
    body: "Both models in the 2026-08-08 design review flagged the same gap: proof of the product lives several scrolls down, past three CTAs and a stats bar, when it should be the first thing a visitor sees. The direct fix — a live model call in the hero — would put real API cost and latency on every homepage visitor, not just the ones who came to try something, so this ships as a looping preview instead: a small terminal-style card that cycles through two real output shapes (an invoice getting parsed, an email getting triaged), built from the same field structures the live /demos tabs actually return, labeled plainly as a 'sample run' rather than dressed up as live. A CTA under it goes straight to the real, live version of whichever scenario is showing. Respects prefers-reduced-motion by rendering the settled output state statically instead of animating.",
  },
  {
    date: "2026-08-08",
    kind: "Fix",
    title: "Homepage redesign: shorter headline, fixed a real contrast bug, reworked pricing hierarchy",
    body: "An adversarial two-model design review (Opus 5 + Fable 5, working independently) flagged the homepage as a competent but generic dark-theme template — both independently compared its navy/cyan palette to Credo AI's, unprompted. Opus inspected the live compiled CSS rather than just a screenshot and found a real WCAG contrast failure: white button text on the cyan end of the primary gradient computed to 1.77:1 against a 4.5:1 requirement, repeated across 5 buttons sitewide (hero, nav, all 3 pricing CTAs). Fixed by switching those buttons to a solid accent-dark background. Also shipped: a shorter, non-defensive hero headline (\"AI agents for the ERP you already have\") replacing a 3-line, double-negative tagline; hero CTAs cut from 4 competing asks to 2; the price, governance-framework badges, and the site's most distinctive line (\"I don't have client logos yet\") pulled out of the dimmest, smallest text on the page; the 3 pricing cards differentiated with a recommended-tier flag and distinct CTA labels instead of 3 identical \"Start a conversation\" buttons, plus a Discovery Sprint banner reconciling the $5K sprint with the $10-50K ladder it wasn't previously mentioned alongside; nav trimmed from 8 items to 5 (MCP/Engineering were already duplicated in the footer); Inter migrated from an external Google Fonts request to self-hosted next/font. Deliberately not done: a full sitewide spacing/color-token normalization pass (scoped separately), and moving a live demo into the hero itself (both models flagged it as the single highest-ceiling change, and both flagged it as real design/build work, not a quick fix). Caught a stale Node process squatting on port 3000 from earlier in the session mid-verification — Playwright was silently testing against it instead of the rebuilt code until it was killed.",
  },
  {
    date: "2026-08-08",
    kind: "Feature",
    title: "AP demo's 7th scenario: a claimed-vs-actual gap, caught by reconciliation",
    body: "A new scenario and a new 'Run reconciliation pass' control on the AP Exception Workflow demo. The agent sends its own status update the moment it drafts a fix, before the gateway's routing decision is back — the update says 'resolved,' but the real decision is escalation to a human. Nothing looks wrong until reconciliation actually runs, which is deliberate: it models a directly-observed governance incident where independent verification against ground truth was the only control that held, and it only fired because the violating agent happened to self-report. The reconciliation pass compares every self-reported claim against the ledger's real decision on demand, re-evaluates from scratch each run (so approving a flagged action and re-running clears it), and is framed explicitly as something that runs on a fixed schedule in production, not only when something already looks suspicious.",
  },
  {
    date: "2026-08-08",
    kind: "Feature",
    title: "AP demo's 6th scenario: a change-control catch, not a spend catch",
    body: "A new scenario on the AP Exception Workflow demo — a supplier bank-detail change proposed from a routine-looking invoice summary. Every existing layer (authorized scope, ERP validation) passes it; there's no dollar amount to cap. It's caught by a new change-control check instead: master-data changes to supplier remittance details always require a documented, matching authorized-change record, independent of amount. Same deterministic policy-engine pattern as the other five scenarios, new control added to the audit ledger rather than a variation on the existing spend-cap logic.",
  },
  {
    date: "2026-08-07",
    kind: "Infra",
    title: "Client-side routing site-wide, plus an HSTS header",
    body: "Nav, footer, and every internal CTA/article/solutions link now use next/link instead of raw <a> tags, so internal navigation is a client-side transition instead of a full page reload and full JS re-download on every click. Also added Strict-Transport-Security to the security header set (CSP, X-Frame-Options, etc. were already in place) and closed a focus-trap gap where the mobile nav's links stayed keyboard-reachable while visually collapsed.",
  },
  {
    date: "2026-08-07",
    kind: "Fix",
    title: "Governance Ledger badge and stat-strip math corrected",
    body: "The badge still read \"Live Operational Data — Not a Simulation\" and a section heading said \"Live gateway snapshot,\" contradicting the honest \"refreshed periodically\" copy already sitting right below them. Also fixed two arithmetic errors in the stat strip: the spend-vs-cap figure didn't match what the ledger rows actually sum to, and the free-tier settlement rate was counting the wrong thing (pool assignment instead of which calls actually settled at $0).",
  },
  {
    date: "2026-08-07",
    kind: "Feature",
    title: "Live value ledger on the AP Exception Workflow demo",
    body: "The AP demo now shows a running dollar-value ledger as the agent works through invoices — caught duplicates, fraud holds, early-pay discounts captured — with an exportable HTML report, instead of leaving the business impact implicit.",
  },
  {
    date: "2026-08-07",
    kind: "Fix",
    title: "Site audit — chatbot accuracy, SEO canonicals, dead links, a real 404 page",
    body: "The chatbot's system prompt claimed client work and partnerships that don't exist yet and got the SOC 2 status wrong; rewrote it to match what /trust actually says, with the real 13 offers and all 6 demos. Fixed a canonical-tag bug forcing every page to declare the homepage as canonical instead of itself. Repointed the hero's \"See an AP agent run\" CTA at the actual agent-workflow demo instead of a plain invoice-extraction tab, and did the same for the matching link on the SAP solutions page. Added a styled 404 page (previously the framework default) and a handful of redirects for URLs that don't exist yet (/contact, /pricing, /blog).",
  },
  {
    date: "2026-07-27",
    kind: "Content",
    title: "Three new offers added — Agent-Ready ERP Diagnostic, AI Insurance Governance Evidence Package, AI Cost & Model Governance Assessment",
    body: "Expanded /services from ten offers to thirteen. The Agent-Ready ERP Diagnostic & Governed Write-Path unblocks agent pilots stalled at the internal-audit stage; the AI Governance Evidence Package packages NIST AI RMF work for an insurance renewal or underwriter questionnaire; the AI Cost & Model Governance Assessment is built directly on the routing infrastructure behind the live Governance Ledger demo. All three were referenced informally on the Governance Ledger page before this — now they're priced, scoped, and live.",
  },
  {
    date: "2026-07-27",
    kind: "Content",
    title: "MCP vs. RPA comparison page, and EU AI Act joins the framework mapping",
    body: "Added a second buyer-education comparison page (MCP vs. RPA), and extended the NIST ↔ ISO 42001 mapping into a three-way comparison against the EU AI Act's high-risk obligations — GOVERN/MAP/MEASURE/MANAGE, now read against a voluntary framework, a certifiable standard, and binding law side by side.",
  },
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
  Feature: { color: "var(--accent)", bg: "#EC6D3D15" },
  Fix: { color: "var(--warning)", bg: "#F59E0B15" },
  Infra: { color: "var(--violet)", bg: "#8B5CF615" },
  Content: { color: "var(--success)", bg: "#4ADE8015" },
};

export default function ChangelogPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#EC6D3D15", border: "1px solid #EC6D3D30", color: "var(--accent)" }}
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
          <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "var(--border)" }} />
          <div className="space-y-8">
            {ENTRIES.map((e, i) => (
              <div key={i} className="relative">
                <div
                  className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full"
                  style={{ background: "var(--bg-dark)", border: `2px solid ${KIND_STYLE[e.kind].color}` }}
                />
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs font-mono text-slate-400">{e.date}</span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: KIND_STYLE[e.kind].color, background: KIND_STYLE[e.kind].bg }}
                  >
                    {e.kind}
                  </span>
                </div>
                <ChangelogBeat className="text-white font-semibold mb-1.5">{e.title}</ChangelogBeat>
                <ScrollReveal>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xl">{e.body}</p>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-slate-400 mb-4">
            Curious how something was built?{" "}
            <Link href="/engineering" style={{ color: "var(--accent)" }} className="hover:text-white transition-colors">
              Read the engineering writeups →
            </Link>
            {" "}or see the{" "}
            <Link href="/trust" style={{ color: "var(--accent)" }} className="hover:text-white transition-colors">
              governance approach →
            </Link>
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Start a conversation
          </Link>
        </div>
      </section>
    </main>
  );
}
