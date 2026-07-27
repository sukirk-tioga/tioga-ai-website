# Tioga AI website — next steps

Working notes for the next session. Last updated 2026-07-27.

## 0. Done this session (2026-07-27, fresh session)

- Merged `demos-migration-assessment` into `main` (clean fast-forward, 10
  commits, no conflicts) and pushed. `main` was already GitHub's default
  branch, so §3 below is resolved — no branch-setting change needed, just
  catching main up.
- Built and shipped (uncommitted — see below) the top 3 augmentation ideas
  from §2: `/about` (founder page), `/changelog` (build log, sourced from
  real commit history), `/trust` (consolidated NIST AI RMF / ISO 42001 / EU
  AI Act page). Added nav link (About) and footer links (About, Trust, Build
  Log), sitemap entries, and structural-test coverage for all three. `tsc`,
  `next build`, and the full Playwright structural suite all pass; visually
  verified via screenshot.
- Deep research (§1) was kicked off in this same fresh session at the
  default (non-Opus) model tier — check `/workflows` or wait for the
  completion notification; not yet reviewed as of this writing.
- **Not yet committed** — these changes are sitting in the working tree
  pending a go-ahead to commit + push (pushing to `main` deploys to
  production on tioga.ai).

## 1. Deep research — run this first, in a fresh session

The deep-research workflow's WebSearch budget (200 calls/session, does not
reset mid-session) was exhausted twice on 2026-07-27 trying to run this.
Both attempts failed with `search-budget-exhausted`, 0 usable sources. A
genuinely new Claude Code session has its own budget — run it there.

Invoke with:

```
Workflow({
  name: "deep-research",
  args: {
    question: "What website patterns, features, and content strategies do the most effective B2B AI/automation implementation agencies and AI dev-tool companies use in 2026 to build credibility and convert enterprise buyers? Tioga AI is a solo-founder enterprise AI implementation agency (positioning: MCP-native AI agents connected to real enterprise systems like SAP/Salesforce/ServiceNow, with NIST AI RMF / ISO 42001 / EU AI Act governance built in, not bolted on). Its site (tioga.ai) already has: a dark navy/cyan design, a homepage with a hero + \"try it now\" live interactive demos (invoice processing, email triage, EBS-to-S/4HANA migration assessment), a governance ledger demo showing real AI-routing-gateway operational data mapped to NIST AI RMF, an MCP integration demo, 10 productized service offers ($10K-160K range), and a live Claude-powered chatbot. There is currently ZERO founder/about content anywhere on the site. Research: (1) what specific site features/content types (beyond generic \"case studies\" and \"testimonials,\" which a pre-launch solo founder can't yet produce) actually move enterprise buyers for agencies at this stage — e.g. live status/uptime pages, technical changelogs, \"how we built X\" writeups, interactive ROI calculators, security/compliance trust pages, structured comparison content; (2) what similar AI implementation/automation agencies and AI-native dev tool companies (e.g. companies doing MCP/agent implementation, AI governance tooling, enterprise AI consulting) are doing on their marketing sites right now that's working, with specific named examples where possible; (3) SEO/content strategy specific to ranking for enterprise AI implementation and MCP integration search terms in 2026. Synthesize into a prioritized, concrete list of augmentation ideas Tioga AI could add to its site, each tagged with expected effort (hours/days) and why it would matter for a founder about to launch on LinkedIn with no case studies yet.",
    models: { scope: "opus", search: "opus", fetch: "opus", verify: "opus" }
  }
})
```

(The `models` override forces Opus 5 throughout — no built-in tier reaches
Opus by default. Omit it to use the cheaper default tier if budget/cost is a
concern instead.)

## 2. Augmentation ideas already identified (no research needed to start)

Ranked by priority, from manual analysis done 2026-07-27:

1. **Founder / About page** — highest priority. Zero founder content exists
   anywhere on the site (confirmed via grep). Enterprise buyers vetting a
   solo-founder agency want to know who they're trusting.
2. **Public build-log / changelog page** — shows the product is actively
   maintained; substitutes for case studies pre-launch.
3. **Consolidated Trust / Governance page** — pull the NIST AI RMF / ISO
   42001 / EU AI Act positioning that's currently only inside the
   governance-ledger demo into its own top-level page.
4. **"How we built the Governance Ledger" technical writeup** — proof of
   technical depth, doubles as SEO content.
5. **SEO content pages tied to existing demos** — e.g. a page specifically
   targeting "SAP EBS to S/4HANA migration assessment" search terms, linking
   into the live demo.
6. **Interactive ROI calculator** — concrete, testable claim generator for
   sales conversations.
7. **Reference architecture diagrams per offer** — visual proof for the
   MCP-native / enterprise-systems-integration positioning.

## 3. Unresolved infra issue — GitHub default branch

`prod-health-check.yml`'s daily cron (`0 13 * * *`) will **not fire** until
`demos-migration-assessment` becomes the repo's default branch on GitHub —
scheduled workflows only run from the default branch, and `main` is still
stale (last updated May). Options:
- Change the default branch in GitHub repo settings to
  `demos-migration-assessment`, or
- Merge `demos-migration-assessment` into `main` and point future work at
  `main`.

Not yet decided or actioned as of 2026-07-27.

## 4. Recently shipped (context, not action items)

- Fixed the migration-assessment demo 502 (retired model ID
  `claude-sonnet-4-20250514` → `claude-sonnet-5`, explicit
  `thinking: {type: "disabled"}`).
- Added per-page metadata, OG image, robots.txt, sitemap.xml.
- Fixed chat widget rendering raw `**markdown**` instead of formatted text
  (added `react-markdown`).
- Built a two-tier Playwright E2E suite: structural (`pages.spec.ts`, runs
  on every push, free) + functional (`demos.spec.ts`, calls live Claude
  endpoints, runs on the daily prod-health-check cron once §3 above is
  resolved).
- Fixed CI failure from missing `webkit` Playwright browser install in both
  workflow files.
