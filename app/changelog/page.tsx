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
    date: "2026-08-30",
    kind: "Feature",
    title: "A real propose-and-approve record for the whole automation estate — /demos/automation-oversight",
    body: "The narrow v1 of a page proposed in the 2026-08-15 business-ops master plan (§8.4), built from data that already exists today rather than the full designed ops-ledger backend (hash-chained per-machine files, HMAC-signed decision records) — that stays a future upgrade path. Deliberately positioned against, not duplicative of, the two existing self-proof pages: Governance Ledger shows spend-level, per-call rows; Standing Watch walks one incident end-to-end; this page is the aggregate, ongoing record — what a daily automated review found, and what a human approved before anything changed. Shows event-level dispositions, never bare counts or raw logs. Content is real and dated: 11 findings from that day's review, 10 requiring and getting human approval before applying, 1 auto-implemented under a narrow pre-approved bounded-change rule — shown as its own disposition, not folded into a misleading \"0 applied without review.\" Includes one honest example of the review process catching its own mistake (a pre-deploy safety gate flagging its own working code as broken every morning until the review caught why), matching Standing Watch's own precedent of showing failures, not only clean days. Positioning cross-checked with Opus 5 (draft) and Fable 5 (adversarial review) before shipping. Reciprocal cross-links added to Governance Ledger and Standing Watch.",
  },
  {
    date: "2026-08-26",
    kind: "Content",
    title: "Landscape article: \"Who's really running your AI?\"",
    body: "A public, stripped-to-verified-primary-facts version of a nine-system LLM-vendor comparison (SAP/Sapphire, Oracle's OCI catalog, Salesforce/Claudeforce, ServiceNow's dual OpenAI + Anthropic deals, Snowflake's symmetric $200M partnerships, Databricks' host-everyone posture, Workday/Gemini, Microsoft's subprocessor status, Palantir's government-channel-only relationship). Only high-confidence, primary-sourced claims made the cut — a litigation reference and a sharper competitive framing were deliberately left out as brand-risk calls reserved for Sukir, not defaults to assume for public content.",
  },
  {
    date: "2026-08-26",
    kind: "Content",
    title: "Hero headline widened from ERP-only to \"systems you already have\"",
    body: "The homepage headline named only Oracle EBS and SAP — accurate as of the 2026-08-08 redesign, stale after a market-strategy correction that Salesforce and ServiceNow should be an additional Tioga service line, not left off the site. Single-word swap (\"ERP\" → \"systems\") keeping the same sentence shape and the SplitText character-reveal animation intact; the subhead gained an appended clause (\"now extending to Salesforce, ServiceNow and the data platforms they sit beside\") rather than losing its existing Oracle EBS/SAP anchor. The 2026-08-08 changelog entry describing the old headline was deliberately left unchanged — it's a record of what shipped that day, not live copy.",
  },
  {
    date: "2026-08-22",
    kind: "Feature",
    title: "/lp/standing-watch — a narrower campaign landing page for outbound traffic",
    body: "Separate from the full /solutions/standing-watch page (FAQ, all pricing tiers, related links): a scroll-driven one-pager for ad/outbound traffic specifically — problem → proof → mechanism → a single CTA (the Assessment) — reusing real copy and pricing already live on the solutions page plus the site's existing design tokens and scroll-reveal components. noindex'd so it doesn't compete with the full solutions page for search.",
  },
  {
    date: "2026-08-21",
    kind: "Feature",
    title: "Joule Capability Gate Map: a second real worked gate, sourced from SAP Concur's public FAQ",
    body: "Extended the existing demo with a Concur expense-management gate example (9 write-capable capabilities: create/edit/submit/recall expense report, attendees, itemizations, allocations), sourced from SAP Concur's own public Joule FAQ rather than S/4HANA's Transactional Capabilities pages, with independent adversarial review re-fetching primary sources from scratch. Leads with a population gate — \"Joule is only available for end users,\" no delegate/proxy access, despite expense delegation being standard mid-market practice — a different shape of gate than manufacturing's batch-cap pattern. Total tracked write-capable count updates 46 → 55.",
  },
  {
    date: "2026-08-21",
    kind: "Feature",
    title: "Marble World-Generation Audit demo",
    body: "Grounded in a real World Labs Marble API trial (2 generations, ~$2.40), not a simulated scenario: a byte-level provenance scan across 14 exported files (0 real markers, 1 false positive caught and resolved), a ToS/rights comparison, and a real physical measurement showing a +19.1% metric-scale error on a single-image reconstruction.",
  },
  {
    date: "2026-08-21",
    kind: "Infra",
    title: "CI fix: package-lock.json drift was blocking every merge",
    body: "package.json and package-lock.json had fallen out of sync — a peer dependency missing from the lock file entirely broke npm ci immediately on every CI run, independent of any specific feature PR. Fixed by resyncing the lock file; verified npm ci and tsc --noEmit both clean afterward.",
  },
  {
    date: "2026-08-20",
    kind: "Fix",
    title: "The contact-classifier's audit log wasn't actually surviving — given a durable home, then a real bug in that fix caught and closed same day",
    body: "Vercel Runtime Logs retain 1 hour (Hobby) / 1 day (Pro) — the classifier's audit trail, console.log-only until now, expired before any real dispute could use it, despite the whole point of the record being to show what the AI classifier did over time. Added a third channel: emails the same shape-only record (no raw name/email/description, matching the existing PII boundary) through the site's already-proven Gmail SMTP transport to a distinct thread — no new signup, no new credential. A live functional test the same day found the new email silently never arrived despite a 200 response: appendContactLog() was called fire-and-forget (void) in the API route, the exact pattern the neighboring sendInquiryEmail() call explicitly avoids two lines above with a comment explaining why — Vercel can freeze the serverless execution context the instant the handler returns, cutting off un-awaited async work mid-flight. The slow real SMTP send was reliably long enough to get cut off; the two faster channels before it never showed the bug. Fixed by awaiting the call, matching the established pattern next to it; verified live against production, not just a clean build — a test POST before the fix produced no email despite 200, confirmed arriving after.",
  },
  {
    date: "2026-08-20",
    kind: "Feature",
    title: "SAP Joule Capability Gate Map demo",
    body: "Interactive demo grounded in real, documented SAP source material: the actual write-capable Joule capability list by S/4HANA area (46 total, verbatim from SAP's own Transactional Capabilities table of contents) set against SAP's own marketed \"200+ agents\" figure, plus one real worked gate example (the Production Planning and Operations Agent's scope item, business catalog, batch cap, and human-confirmation requirements). Deliberately does not fabricate gate detail for any capability beyond that one verified example — an explicit honesty boundary in the demo's own data file, not a limitation discovered later.",
  },
  {
    date: "2026-08-18",
    kind: "Feature",
    title: "Five new governed-write-path demos in one push",
    body: "Composed Evidence (a real, vendor-acknowledged gap: neither a universal AI assistant nor an ERP vendor's own execution agent composes the other half of an audit trail — this demo does), ERP Reporting Copilot (a read-side natural-language query demo against composite SAP quote/order data — historical lookups and pricing-change history standard reporting doesn't cover), Agent Autonomy Tier Mapper (maps a use case to Gartner's Observe/Advise/Act-with-Approval/Act-Autonomously framework against Tioga's own Safe/Ask-first/Never tiers), Governed Field Service Billable Classification (a completed service call classified contract-covered vs. billable — an interpretation-risk gate, not a dollar threshold, with an independent ERP-layer check), and Governed Capital Equipment Order Booking.",
  },
  {
    date: "2026-08-18",
    kind: "Feature",
    title: "/showcase — an interactive 3D scene visualizing the Governance Ledger",
    body: "A new page rendering the site's real routing-gateway ledger data as a 3D scene rather than a table, following a Phase 0 spike a week earlier. Shipped alongside the effects, legend, and graceful-fallback components a scene like this needs.",
  },
  {
    date: "2026-08-18",
    kind: "Feature",
    title: "/showcase pushed further: real GPU particle simulation, glass refraction, a framework migration — ahead of the plan's own stated gate",
    body: "Sukir's explicit go-ahead to override the original plan's \"don't push further until Phase 1 has been seen by a prospect\" gate. Replaced the scene's box-tile column with a real GPGPU particle field (~40k desktop / ~8k mobile particles, GPUComputationRenderer) rasterized from the real 17-row ledger, scattering on pointer proximity and streaming during Replay; swapped the gate's flat glow for real refractive glass (drei's MeshTransmissionMaterial); migrated React 18→19, Next 14→15, and the underlying 3D libraries two major versions each, sized in advance as \"days not weeks\" against this repo's actual blast radius and confirmed live at zero code changes beyond the dependency bumps; added optional Web Audio sonification on Replay, default off and explicitly opt-in, built defensively even though the general gate was overridden, per the plan's own audio-specific hold recommendation. Verified at every stage: clean build, full Playwright suite passing (5 pre-existing API-key-gap failures confirmed identical before/after, not a regression), live in-browser checks for idle motion, refraction, and particle structure. Honestly scoped in the page's own visitor-facing copy: individual characters in the particle field aren't crisply legible at this particle budget — the documented fallback, not the higher-risk reach goal the plan had flagged.",
  },
  {
    date: "2026-08-18",
    kind: "Feature",
    title: "Contact form moved off the homepage to its own /contact page",
    body: "The inline homepage contact section was removed in favor of a dedicated page; the 404 page, engineering page, and other CTAs across the site were repointed accordingly.",
  },
  {
    date: "2026-08-18",
    kind: "Fix",
    title: "AI-disclosure line added, and the contact-form classifier hardened",
    body: "Verified structurally that the contact-form classifier has no path sending its output back to the submitter — it's only rendered client-side as labeled \"AI Classification\" data and emailed to the founder. Hardened the real gap: classifier JSON output was being parsed and trusted unchecked. Added an enum/range-constrained runtime validator that rejects malformed model output outright rather than passing it through. Hardened the classifier's audit log so it actually persists in production: added a console.log channel Vercel's serverless runtime actually captures into Runtime Logs, since the existing filesystem-based write is local-dev-only and silently no-ops on Vercel's ephemeral filesystem. Separately, added a disclosure line directly on the contact form, visible before the interaction starts, confirming AI classification with human review before follow-up — closing the gap between /trust's claim that disclosure happens \"at the start of every conversation\" and it not actually being true on the contact form specifically.",
  },
  {
    date: "2026-08-10/11",
    kind: "Feature",
    title: "Standing Watch launched — solution page, real-ledger demo, three-tier services split, downloadable one-pager",
    body: "A new cross-vendor AI governance offering shipped across several linked pieces: a solutions page and a real-ledger demo page, then a three-tier split on /services (previously one row), then a downloadable one-pager with an estate diagram, sample PDF, and a LinkedIn carousel.",
  },
  {
    date: "2026-08-09",
    kind: "Infra",
    title: "Vercel Speed Insights installed",
    body: "Added the Speed Insights package and script component so real page-load performance data starts collecting in the Vercel dashboard.",
  },
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
  Feature: { color: "var(--accent)", bg: "#C8340615" },
  Fix: { color: "var(--warning)", bg: "#F59E0B15" },
  Infra: { color: "var(--violet)", bg: "#8B5CF615" },
  Content: { color: "var(--success)", bg: "#4ADE8015" },
};

export default function ChangelogPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Build Log
        </div>
        <h1 className="text-4xl font-bold mb-5 leading-tight" style={{ color: "var(--text)" }}>
          What actually shipped
        </h1>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mb-16">
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
                  <span className="text-xs font-mono text-[var(--text-muted)]">{e.date}</span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: KIND_STYLE[e.kind].color, background: KIND_STYLE[e.kind].bg }}
                  >
                    {e.kind}
                  </span>
                </div>
                <ChangelogBeat className="text-[var(--text)] font-semibold mb-1.5">{e.title}</ChangelogBeat>
                <ScrollReveal>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xl">{e.body}</p>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Curious how something was built?{" "}
            <Link href="/engineering" style={{ color: "var(--accent)" }} className="hover:text-[var(--text)] transition-colors">
              Read the engineering writeups →
            </Link>
            {" "}or see the{" "}
            <Link href="/trust" style={{ color: "var(--accent)" }} className="hover:text-[var(--text)] transition-colors">
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
