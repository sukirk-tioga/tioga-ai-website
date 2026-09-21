// Shared agent-register data module — the "Reach Map" scene's single
// source of truth, mirroring how governance-ledger.ts backs both
// /demos/governance-ledger and /showcase (see that file's own header and
// docs/design/3d-design-standard.md §6.4: one data source, never a second
// driftable copy).
//
// This is a real excerpt from Tioga's own automation estate: the 29
// scheduled launchd jobs (com.sukir.*/com.tioga.*/com.jarvis.*) already
// listed in app/demos/automation-oversight/page.tsx's SCHEDULED_AUTOMATIONS
// array, plus each job's real read/write surface, real authorization tier,
// and real blast radius — sourced from
// ~/SecondBrain/TiogaAI/docs/home-directory-subsystems.md (the estate's own
// model/cost/blast-radius registry, last updated 2026-09-13) and cross-
// checked against automation-oversight's own RECENT dispositions array.
// Not synthetic, not a composite scenario — every field traces to that
// doc's own wording, cited inline in each row's `note`. This authoring pass
// is itself Deliverable 1 of the Agentic AI Governance Framework offer run
// on Tioga's own estate — see
// ~/SecondBrain/TiogaAI/research/2026-09-13-interactive-3d-offer-pilot-governance-framework.md
// §1.3 and §8 for why this dataset (not a composite scenario) was chosen.
//
// Three real authorization tiers, matching the proposal's own language
// (sales/proposals/09-agentic-ai-governance-framework.md §4 item 1):
//   - "human-owned"      — the agent may only advise; nothing it does
//                          mutates a system without a person acting on it
//                          (an emailed alert counts as advice, not a write).
//   - "human-supervised" — a write is proposed and a named approver must
//                          act before it lands.
//   - "agent-owned"      — the write lands with no approval gate before it
//                          happens; a human may review after the fact (or
//                          never), but nothing stopped it from landing.
// A single agent can carry more than one tier at once — check-automations
// is the clearest real example (a narrow, bounded auto-implement path is
// agent-owned; everything else stays human-supervised) — so tier lives per
// write edge, not per agent.

export type Tier = "human-owned" | "human-supervised" | "agent-owned";

export interface WriteEdge {
  system: SystemId;
  tier: Tier;
  approver?: string;
  note: string;
}

export type SystemId =
  | "VAULT_RESEARCH"
  | "WORKING_LIST"
  | "VAULT_GIT"
  | "PIPELINE_CODE"
  | "MEMORY_STORE"
  | "GATEWAY_STATE"
  | "SMTP_EMAIL"
  | "SYSTEM_POWER"
  | "LAUNCHD_QUEUE"
  | "MARKET_DATA"
  | "OWN_OUTPUT"
  | "AUDIT_REPORTS";

export interface SystemRow {
  id: SystemId;
  name: string;
  description: string;
}

export interface AgentRow {
  id: string; // matches automation-oversight's SCHEDULED_AUTOMATIONS entries
  name: string;
  schedule: string;
  purpose: string;
  reads: SystemId[];
  writes: WriteEdge[];
  blastRadius: string;
}

// --- Systems of record --------------------------------------------------

export const SYSTEMS: SystemRow[] = [
  { id: "PIPELINE_CODE", name: "Automation code", description: "Other automations' own script files — the one target in this estate a background process can write to unsupervised, in a bounded way." },
  { id: "WORKING_LIST", name: "working-list.md", description: "The founder's own action-item tracker (projects/working-list.md) — written directly by DailySynthesis." },
  { id: "VAULT_RESEARCH", name: "Vault research/", description: "research/inbox/, research/knowledge/, research/market-developments/ — Tioga AI business content." },
  { id: "VAULT_GIT", name: "Vault git history", description: "The vault's own git log — the recovery mechanism for every other unsupervised vault write in this register." },
  { id: "MEMORY_STORE", name: "Claude memory store", description: "Claude's local memory store — read-only in this register; no scheduled job writes here." },
  { id: "GATEWAY_STATE", name: "JARVIS gateway + budget state", description: "The MCP routing daemon and its shared $30/30-day budget state, read by every AI-calling pipeline in the estate." },
  { id: "SMTP_EMAIL", name: "Outbound email", description: "Outbound alert/report emails via a shared service credential." },
  { id: "SYSTEM_POWER", name: "System power settings", description: "pmset/Power Nap/standby state on the laptop." },
  { id: "LAUNCHD_QUEUE", name: "launchd / tj dispatch queue", description: "Job scheduling state and the cross-machine tj job-dispatch queue." },
  { id: "MARKET_DATA", name: "Market-data account (read-only)", description: "Market/quote data only — no trade-execution tool is granted to any job in this register." },
  { id: "OWN_OUTPUT", name: "Pipeline-local output dirs", description: "Non-vault-synced out/ directories (e.g. YouTubeAIDigest/out/) — contained by construction." },
  { id: "AUDIT_REPORTS", name: "Audit reports", description: "Weekly/monthly audit report files, written only by the audit jobs that generate them." },
];

const APPROVER = "Sukir (founder review)";

// --- Agents ---------------------------------------------------------------
// One row per real com.sukir.*/com.tioga.*/com.jarvis.* scheduled job,
// index-aligned in spirit with SCHEDULED_AUTOMATIONS in
// app/demos/automation-oversight/page.tsx (kept as two arrays, not one
// import, because that page's array is a plain string list for a stat
// count and predates this register — see that file for the canonical job
// name spelling).

export const AGENTS: AgentRow[] = [
  {
    id: "automation-wake-guard",
    name: "Automation Wake Guard",
    schedule: "5:38 AM daily",
    purpose: "Keeps the laptop awake so the 5:45–10:00 AM digest chain can't be interrupted by sleep.",
    reads: ["SYSTEM_POWER"],
    writes: [
      { system: "SYSTEM_POWER", tier: "agent-owned", note: "Temporarily disables Power Nap/standby via a scoped NOPASSWD sudoers entry, restored on exit — no human review before applying, self-restoring." },
    ],
    blastRadius: "Infrastructure-level only; no content or vault-write risk.",
  },
  {
    id: "automation-watchdog",
    name: "Automation Watchdog",
    schedule: "8:00 AM daily",
    purpose: "Checks each digest pipeline's completion marker and triggers laptop-side catch-up if the mini's standby run didn't fire.",
    reads: ["LAUNCHD_QUEUE"],
    writes: [
      { system: "LAUNCHD_QUEUE", tier: "agent-owned", note: "Can trigger a catch-up re-run of any digest pipeline with no human approval — its own blast radius is bounded to detection, but the content blast radius of a triggered run inherits whichever pipeline it re-fires." },
    ],
    blastRadius: "Queue-level trigger only; downstream risk inherits the re-fired pipeline's own row.",
  },
  {
    id: "automation-watchdog-late",
    name: "Automation Watchdog (late)",
    schedule: "11:00 AM daily",
    purpose: "Second watchdog pass, same detection/catch-up logic as the 8:00 AM run.",
    reads: ["LAUNCHD_QUEUE"],
    writes: [
      { system: "LAUNCHD_QUEUE", tier: "agent-owned", note: "Same unsupervised catch-up trigger as automation-watchdog." },
    ],
    blastRadius: "Queue-level trigger only; downstream risk inherits the re-fired pipeline's own row.",
  },
  {
    id: "catchup-on-login",
    name: "Catch-up on Login",
    schedule: "LoginWindow-triggered, not calendar-scheduled",
    purpose: "Companion to the watchdog jobs for the case where the laptop was asleep/off through the whole morning window.",
    reads: ["LAUNCHD_QUEUE"],
    writes: [
      { system: "LAUNCHD_QUEUE", tier: "agent-owned", note: "Triggers a catch-up chain unsupervised, same pattern as the watchdog jobs." },
    ],
    blastRadius: "Queue-level trigger only; downstream risk inherits the re-fired pipeline's own row.",
  },
  {
    id: "check-automations",
    name: "Check Automations",
    schedule: "10:30 AM daily",
    purpose: "Reviews the estate's own logs and cost data, drafts findings, and may apply a narrow pre-approved class of change automatically.",
    reads: ["PIPELINE_CODE", "VAULT_RESEARCH", "GATEWAY_STATE"],
    writes: [
      { system: "PIPELINE_CODE", tier: "agent-owned", note: "Bounded auto-implement allowlist only (pure additions, syntax-checked afterward) — guarded by pre_deploy_gate.py, check_code_parity.py, py_compile+pyflakes revert gates, and verify-artifact-stop.sh, but still lands with no human review before applying." },
      { system: "PIPELINE_CODE", tier: "human-supervised", approver: APPROVER, note: "Everything outside the bounded allowlist is proposed and sits until reviewed — no path from a finding to a live change skips this." },
    ],
    blastRadius: "Highest blast radius in the estate — the only pipeline with standing write access to other pipelines' own code.",
  },
  {
    id: "check-launchd-status",
    name: "Check launchd Status",
    schedule: "11:15 AM daily",
    purpose: "Watches launchd's own Status column for every scheduled job.",
    reads: ["LAUNCHD_QUEUE"],
    writes: [
      { system: "SMTP_EMAIL", tier: "human-owned", note: "Emails Sukir only on a nonzero exit status; read-only otherwise, no data write." },
    ],
    blastRadius: "Read-only; alert-only.",
  },
  {
    id: "check-memory-integrity",
    name: "Check Memory Integrity",
    schedule: "Saturday 9:30 AM",
    purpose: "Read-only orphan/dead-link scan of the Claude memory store.",
    reads: ["MEMORY_STORE"],
    writes: [
      { system: "SMTP_EMAIL", tier: "human-owned", note: "Emails only when the scan finds drift; silent when clean." },
    ],
    blastRadius: "Read-only; emails only on drift.",
  },
  {
    id: "daily-synthesis",
    name: "Daily Synthesis",
    schedule: "10:00 AM daily",
    purpose: "Reads TiogaIntelDigest + YouTubeAIDigest + MarketBrief + session-digest output and extracts cross-pipeline actionable items.",
    reads: ["VAULT_RESEARCH", "OWN_OUTPUT"],
    writes: [
      { system: "WORKING_LIST", tier: "agent-owned", note: "Writes new items directly into the founder's own action-item tracker via working_list_update.py — no approval gate before the write lands; a human triages after the fact via triage labels, not before." },
    ],
    blastRadius: "A bad synthesis adds a wrong or fabricated item straight into working-list.md. Highest read fan-in of any pipeline in the estate (5 sources in one call).",
  },
  {
    id: "digest-compound",
    name: "Digest Compound",
    schedule: "7:35 AM daily",
    purpose: "Keeps research/knowledge/ compounded daily from prior digest output via a headless skill invocation.",
    reads: ["VAULT_RESEARCH"],
    writes: [
      { system: "VAULT_RESEARCH", tier: "agent-owned", note: "Writes to research/knowledge/ with no human review before landing; a 2026-08-09 incident showed it can silently report success having done nothing, which is why digest-compound-check exists as a same-day automated — not human — catch." },
    ],
    blastRadius: "Unsupervised vault content write.",
  },
  {
    id: "digest-compound-check",
    name: "Digest Compound Check",
    schedule: "8:00 AM daily",
    purpose: "Adversarial check on digest-compound's own output.",
    reads: ["VAULT_RESEARCH"],
    writes: [
      { system: "SMTP_EMAIL", tier: "human-owned", note: "Emails only on failure." },
    ],
    blastRadius: "Read-only adversarial check.",
  },
  {
    id: "digest-health-check",
    name: "Digest Health Check",
    schedule: "Monthly, 1st @ 9 AM",
    purpose: "Checks every TiogaIntel/YouTube source feed actually returns entries and resolves correctly.",
    reads: ["OWN_OUTPUT"],
    writes: [
      { system: "SMTP_EMAIL", tier: "human-owned", note: "Silent when healthy; emails only when something's actually wrong." },
    ],
    blastRadius: "Read-only feed/channel reachability check.",
  },
  {
    id: "digest-qa-check",
    name: "Digest QA Check",
    schedule: "7:25 AM daily",
    purpose: "QA pass on digest output quality.",
    reads: ["OWN_OUTPUT"],
    writes: [
      { system: "SMTP_EMAIL", tier: "human-owned", note: "Emails only when a check fails." },
    ],
    blastRadius: "Read-only QA pass.",
  },
  {
    id: "market-brief",
    name: "Market Brief",
    schedule: "5:45 AM daily",
    purpose: "Pre-market brief drafted from WSJ/Barron's/MarketWatch RSS; explicitly not wired to any brokerage.",
    reads: ["MARKET_DATA"],
    writes: [
      { system: "OWN_OUTPUT", tier: "agent-owned", note: "Writes its own brief unsupervised. Research digest only — worst case is a bad trading idea reaching Sukir's own read, not an autonomous action." },
    ],
    blastRadius: "Contained to its own output; no trade-execution surface.",
  },
  {
    id: "mission-control",
    name: "Mission Control",
    schedule: "Always-on local daemon",
    purpose: "Serves a read-only ops dashboard over the whole estate's status.",
    reads: ["LAUNCHD_QUEUE"],
    writes: [],
    blastRadius: "Read-only local dashboard, binds 127.0.0.1 only, no write path at all.",
  },
  {
    id: "os-audit",
    name: "OS Audit",
    schedule: "Sunday 9:00 AM",
    purpose: "Weekly structural audit of routing integrity, automation freshness, bloat, and context clash.",
    reads: ["PIPELINE_CODE", "VAULT_RESEARCH"],
    writes: [
      { system: "AUDIT_REPORTS", tier: "agent-owned", note: "Writes its own weekly report to its audit-reports folder unsupervised — contained, not a business-critical system." },
    ],
    blastRadius: "Read-only audit; writes only to its own report directory.",
  },
  {
    id: "pre-deploy-gate",
    name: "Pre-Deploy Gate",
    schedule: "5:00 AM daily",
    purpose: "Mechanizes as much of the pre-deployment checklist as automatable: syntax checks + mini-parity check across watched pipeline dirs.",
    reads: ["PIPELINE_CODE"],
    writes: [
      { system: "SMTP_EMAIL", tier: "human-owned", note: "Alert-only — does not itself block a deploy mechanically, per its own description." },
    ],
    blastRadius: "Read-only gate/alert, not an enforcement gate on the commit path.",
  },
  {
    id: "router-watch",
    name: "Router Watch",
    schedule: "Saturday 8:30 AM",
    purpose: "Weekly JARVIS model-currency check, propose-only.",
    reads: ["GATEWAY_STATE"],
    writes: [
      { system: "SMTP_EMAIL", tier: "human-owned", note: "Explicitly zero write blast radius by design — its own footer states no file was modified by this job." },
    ],
    blastRadius: "Read-only proposal report.",
  },
  {
    id: "second-brain-audit",
    name: "Second-Brain Audit",
    schedule: "Sunday 9:30 AM",
    purpose: "Weekly reconciliation of working-list.md's Blocked section against current reality.",
    reads: ["WORKING_LIST", "MEMORY_STORE"],
    writes: [
      { system: "SMTP_EMAIL", tier: "human-owned", note: "Always emails a report; no autonomous edits." },
    ],
    blastRadius: "Read-only weekly audit, scoped to working-list.md's Blocked section.",
  },
  {
    id: "security-watch",
    name: "Security Watch",
    schedule: "Saturday 10:30 AM",
    purpose: "Weekly deterministic config/port-style security audit.",
    reads: ["SYSTEM_POWER", "LAUNCHD_QUEUE"],
    writes: [
      { system: "SMTP_EMAIL", tier: "human-owned", note: "Read-only weekly audit; emails only." },
    ],
    blastRadius: "Read-only.",
  },
  {
    id: "session-digest",
    name: "Session Digest",
    schedule: "9:50 AM daily",
    purpose: "Scans the prior day's Claude Code session transcripts and extracts a per-project summary.",
    reads: ["MEMORY_STORE"],
    writes: [
      { system: "OWN_OUTPUT", tier: "agent-owned", note: "Writes its own summary file unsupervised, which daily-synthesis then reads as one of its five sources — one step upstream of daily-synthesis's own working-list.md blast radius." },
    ],
    blastRadius: "Contained until daily-synthesis reads it.",
  },
  {
    id: "tioga-intel-digest",
    name: "TiogaIntel Digest",
    schedule: "7:15 AM daily",
    purpose: "Daily governance/AI-industry intel brief drafted from RSS sources.",
    reads: [],
    writes: [
      { system: "VAULT_RESEARCH", tier: "agent-owned", note: "Writes directly into research/inbox/ and out/intel_classifications.jsonl with no human review before landing — daily-synthesis and check-automations both read downstream." },
    ],
    blastRadius: "A bad extraction can propagate into the working-list backlog and content-angle queue.",
  },
  {
    id: "tj-reaper",
    name: "TJ Reaper",
    schedule: "Every 900s",
    purpose: "Reaps the cross-machine tj job-dispatch queue.",
    reads: ["LAUNCHD_QUEUE"],
    writes: [
      { system: "LAUNCHD_QUEUE", tier: "agent-owned", note: "A misfire is queue-level (duplicate/lost dispatch), not content — inherits the blast radius of whatever job it dispatches." },
    ],
    blastRadius: "Queue-level only.",
  },
  {
    id: "tj-worker",
    name: "TJ Worker",
    schedule: "Long-running daemon",
    purpose: "Executes dispatched cross-machine jobs from the tj queue.",
    reads: ["LAUNCHD_QUEUE"],
    writes: [
      { system: "LAUNCHD_QUEUE", tier: "agent-owned", note: "Same queue-level unsupervised dispatch as tj-reaper." },
    ],
    blastRadius: "Queue-level only.",
  },
  {
    id: "validator-holdout",
    name: "Validator Holdout",
    schedule: "Sunday 9:30 AM",
    purpose: "LLM-as-judge eval pass against fixed test fixtures, to catch slow validator-prompt drift.",
    reads: ["PIPELINE_CODE"],
    writes: [
      { system: "SMTP_EMAIL", tier: "human-owned", note: "Read-only eval pass; makes real paid claude -p calls but touches no pipeline's live output." },
    ],
    blastRadius: "No vault/production writes.",
  },
  {
    id: "vault-autocommit",
    name: "Vault Autocommit",
    schedule: "Every 2 hours, 7 AM–11 PM",
    purpose: "git commit of any vault change, so bad/partial writes are recoverable.",
    reads: ["VAULT_RESEARCH", "WORKING_LIST"],
    writes: [
      { system: "VAULT_GIT", tier: "agent-owned", note: "Commits unsupervised — but this mitigates risk rather than causing it: it's what makes every other unsupervised vault write in this register recoverable via git log/checkout." },
    ],
    blastRadius: "Local git only, no network/email side effects.",
  },
  {
    id: "youtube-ai-digest",
    name: "YouTube AI Digest",
    schedule: "7:00 AM daily",
    purpose: "Daily YouTube AI content digest.",
    reads: [],
    writes: [
      { system: "OWN_OUTPUT", tier: "agent-owned", note: "Writes only to its own out/ directory, not vault-synced — contained; a bad run doesn't touch business-facing files directly." },
    ],
    blastRadius: "Contained.",
  },
  {
    id: "youtube-lens-review",
    name: "YouTube Lens Review",
    schedule: "~7:31 AM daily",
    purpose: "Second-opinion adversarial re-review across four lenses (business dev, launch, personal expertise, AI OS).",
    reads: ["OWN_OUTPUT"],
    writes: [
      { system: "OWN_OUTPUT", tier: "agent-owned", note: "Writes only to the same non-vault-synced out/ directory." },
      { system: "SMTP_EMAIL", tier: "human-owned", note: "Emails a report; silent if nothing to add." },
    ],
    blastRadius: "Contained; read-only re-review.",
  },
  {
    id: "claude-budget-sync",
    name: "Claude Budget Sync",
    schedule: "8:00 AM daily",
    purpose: "Aggregates cost_log.jsonl entries across pipelines and syncs shared budget state.",
    reads: ["GATEWAY_STATE"],
    writes: [
      { system: "GATEWAY_STATE", tier: "agent-owned", note: "Writes shared budget-sync state read by both machines and restarts the jarvis-gateway daemon, unsupervised — a misfire could misstate the shared budget state other pipelines gate on." },
    ],
    blastRadius: "Doesn't fabricate content itself, but can misstate shared state other pipelines depend on.",
  },
  {
    id: "jarvis-gateway",
    name: "JARVIS Gateway",
    schedule: "Always-on daemon",
    purpose: "MCP routing bridge — the central dependency every AI-calling pipeline in the estate routes through.",
    reads: ["GATEWAY_STATE"],
    writes: [
      { system: "GATEWAY_STATE", tier: "agent-owned", note: "A misconfiguration can misroute calls to the wrong model/tier or fail silently — central routing dependency for every pipeline in this register." },
    ],
    blastRadius: "Central routing dependency for every pipeline above.",
  },
];

// --- Derived figures --------------------------------------------------
//
// Computed from AGENTS/SYSTEMS themselves (not hand-typed), same discipline
// as governance-ledger.ts's STATS block — see that file's own header.

export const TOTAL_AGENTS = AGENTS.length; // 29

export const UNSUPERVISED_WRITE_EDGES = AGENTS.flatMap((a) =>
  a.writes.filter((w) => w.tier === "agent-owned").map((w) => ({ agent: a.id, ...w }))
);
export const UNSUPERVISED_WRITE_COUNT = UNSUPERVISED_WRITE_EDGES.length;

export const SUPERVISED_WRITE_EDGES = AGENTS.flatMap((a) =>
  a.writes.filter((w) => w.tier === "human-supervised").map((w) => ({ agent: a.id, ...w }))
);

export const ADVISORY_ONLY_AGENTS = AGENTS.filter(
  (a) => a.writes.length === 0 || a.writes.every((w) => w.tier === "human-owned")
).length;

// Distinct systems that receive at least one unsupervised (agent-owned)
// write — the set the Reach Map's "unsupervised writes only" toggle
// isolates.
export const UNSUPERVISED_WRITE_TARGETS: SystemId[] = Array.from(
  new Set(UNSUPERVISED_WRITE_EDGES.map((w) => w.system))
);

// Per-system agent counts (read + write edges both count as "touches") —
// a system touched by 2+ agents is a convergence point, the shared-channel
// nodes the Reach Map renders mid-corridor.
export const SYSTEM_TOUCH_COUNTS: Record<SystemId, number> = Object.fromEntries(
  SYSTEMS.map((s) => {
    const touching = new Set(
      AGENTS.filter(
        (a) => a.reads.includes(s.id) || a.writes.some((w) => w.system === s.id)
      ).map((a) => a.id)
    );
    return [s.id, touching.size];
  })
) as Record<SystemId, number>;

export const CONVERGENCE_SYSTEMS: SystemId[] = SYSTEMS.filter(
  (s) => SYSTEM_TOUCH_COUNTS[s.id] >= 2
).map((s) => s.id);

// The single highest-blast-radius system — the Reach Map's one hero object
// (research §2.1: "the highest-blast-radius system as the single hero
// object"). PIPELINE_CODE is the documented choice: the home-directory-
// subsystems.md registry names it in exactly these words for
// check-automations — "Highest blast radius in the estate."
export const HERO_SYSTEM: SystemId = "PIPELINE_CODE";

export const STATS = [
  { label: "Scheduled agents", value: `${TOTAL_AGENTS}`, sub: "every scheduled job, not a sample" },
  { label: "Unsupervised write edges", value: `${UNSUPERVISED_WRITE_COUNT}`, sub: "land with no approval gate before they happen" },
  { label: "Advisory-only agents", value: `${ADVISORY_ONLY_AGENTS}`, sub: "may alert a human, never mutate a system directly" },
  { label: "Systems touched", value: `${SYSTEMS.length}`, sub: `${CONVERGENCE_SYSTEMS.length} are shared convergence points (2+ agents)` },
];

// --- Real disposition events (for Concept B / escalation replay) --------
//
// Same 7 real, dated findings already live on
// app/demos/automation-oversight/page.tsx's RECENT array — re-exported
// here, not re-typed, so the two pages can never drift (3D standard §6.4).
// automation-oversight/page.tsx should import DISPOSITIONS from here rather
// than keeping its own literal array — see that file for the migration.

export interface DispositionEvent {
  date: string;
  finding: string;
  category: string;
  disposition: "approved" | "auto-implemented";
}

export const DISPOSITIONS: DispositionEvent[] = [
  {
    date: "2026-08-30",
    finding: "A verified market-development note was created — a pure addition, syntax-checked, matching the narrow rule that's allowed to apply itself without waiting on review.",
    category: "Tioga AI Business",
    disposition: "auto-implemented",
  },
  {
    date: "2026-08-30",
    finding: "The one script in the estate that writes files had no per-run spend cap — every sibling script had one.",
    category: "AI OS Hardening",
    disposition: "approved",
  },
  {
    date: "2026-08-30",
    finding: "A source feed with a genuinely quiet publishing cadence was being reported as \"unreachable\" every time it had nothing new — a false alarm on a feed working exactly as designed.",
    category: "AI OS Hardening",
    disposition: "approved",
  },
  {
    date: "2026-08-30",
    finding: "A deterministic pre-flight check existed but was never wired into the daily pipeline it was built for.",
    category: "AI OS Hardening",
    disposition: "approved",
  },
  {
    date: "2026-08-30",
    finding: "A model-routing environment variable was left as an unpinned alias in the one script that edits production files, risking a silent model swap with no diff or approval.",
    category: "Model routing",
    disposition: "approved",
  },
  {
    date: "2026-08-30",
    finding: "A background cost-tracking pass had grown noticeably more expensive over several days for no clear reason — flagged for measurement, not yet root-caused.",
    category: "Token/cost optimization",
    disposition: "approved",
  },
  {
    date: "2026-08-29",
    finding: "A pre-deploy safety gate was flagging a real, working script as a syntax error every single morning — a false positive traced to the gate checking the wrong shell dialect.",
    category: "AI OS Hardening",
    disposition: "approved",
  },
];
