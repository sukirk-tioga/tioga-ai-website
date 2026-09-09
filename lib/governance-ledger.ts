// Shared governance-ledger data module.
//
// This is the single source of truth for the real excerpt from Tioga's own
// AI routing gateway ledger (JARVIS), captured Sep 8-9 2026 (refreshed from
// the original Jul 17-25 2026 capture — see the "Window refresh, 2026-09-09"
// note below for why and what changed). It backs both
// `/demos/governance-ledger` (the table view) and `/showcase` (the 3D
// scene) — extracted here specifically so the two views can never drift:
// change a row here, both pages change with it.
//
// Not synthetic. Every field traces to a real model call our own
// infrastructure made: what was requested, what actually served it, token
// counts, cost, which pool (free vs. paid) it settled against, and which
// NIST AI RMF functions it evidences. Rows from the gateway's separate
// `claude_max` billing pool (personal Claude subscription usage, not the
// $30/30-day OpenRouter pool this page documents) are deliberately excluded
// from this excerpt — that pool's spend stays private, by design, not an
// oversight.
//
// Window refresh, 2026-09-09: the original Jul 17-25 capture had gone
// stale (audit finding G-10) and needed either a longer window or a
// relabel — the call was to refresh with a genuinely current window
// instead. The real numbers moved a lot since July: back then the free
// tier absorbed most calls (15/17 free, 12/17 at exactly $0); by Sep 8-9,
// real usage volume has grown past what the free tier can cover, so this
// window is 15/16 paid. The mechanism hasn't changed — every call is still
// logged, costed, and capped automatically — what changed is that there's
// simply more real traffic now than the free backends alone can absorb.
// Total spend is still a rounding error against the $30 cap.

export interface LedgerRow {
  ts: string;
  requested: string;
  served: string;
  in: number;
  out: number;
  cost: string;
  pool: "free" | "paid";
  quality?: string;
  tags: Array<"MAP" | "MEASURE" | "MANAGE">;
}

export const LEDGER: LedgerRow[] = [
  { ts: "Sep 08 05:43:55", requested: "gpt-terra", served: "openai/gpt-5.6-terra", in: 1253, out: 3800, cost: "$0.048106", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 08 06:02:32", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 1483, out: 7431, cost: "$0.022873", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 08 06:17:52", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 5017, out: 8192, cost: "$0.029717", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 08 14:04:03", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 6131, out: 3309, cost: "$0.015969", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 08 14:05:58", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 7072, out: 2376, cost: "$0.014045", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 08 14:06:00", requested: "gemini-flash", served: "gemini-3.8-flash", in: 847, out: 36, cost: "$0.000770", pool: "free", tags: ["MAP"] },
  { ts: "Sep 08 14:07:35", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 15839, out: 1635, cost: "$0.020264", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 08 14:08:52", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 2240, out: 2837, cost: "$0.010777", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 09 14:04:09", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 10138, out: 3642, cost: "$0.020850", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 09 14:06:22", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 2461, out: 2197, cost: "$0.009047", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 09 14:08:52", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 9852, out: 3686, cost: "$0.020708", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 09 14:10:50", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 4212, out: 2302, cost: "$0.011058", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 09 14:11:49", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 2343, out: 1330, cost: "$0.006301", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 09 19:09:27", requested: "gpt-terra", served: "openai/gpt-5.6-terra", in: 1001, out: 1837, cost: "$0.024046", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 09 19:10:51", requested: "gpt-terra", served: "openai/gpt-5.6-terra", in: 992, out: 4078, cost: "$0.050920", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Sep 09 19:22:11", requested: "gpt-terra", served: "openai/gpt-5.6-terra", in: 1078, out: 4083, cost: "$0.051152", pool: "paid", tags: ["MAP", "MANAGE"] },
];

// --- Derived figures --------------------------------------------------
//
// These are computed from LEDGER itself (not hand-typed) so they can never
// drift from the rows above — this is what STATS below, the 3D scene's
// budget aperture, free-pool bypass, and provenance strip all read from.
// If a row ever changes (or the window is refreshed again), these change
// with it instead of needing a matching hand-edit somewhere else — the
// exact class of drift audit finding G-11 caught elsewhere on this site.

function parseCost(cost: string): number {
  return parseFloat(cost.replace("$", ""));
}

export const TOTAL_CALLS = LEDGER.length; // 16
export const FREE_COUNT = LEDGER.filter((r) => r.pool === "free").length; // 1
export const PAID_COUNT = LEDGER.filter((r) => r.pool === "paid").length; // 15

export const FREE_ZERO_COST_COUNT = LEDGER.filter(
  (r) => r.pool === "free" && parseCost(r.cost) === 0
).length; // 0 in this window — the one free-pool call still carried a small Gemini cost
export const FREE_ZERO_COST_PCT = Math.round((FREE_ZERO_COST_COUNT / TOTAL_CALLS) * 100); // 0

export const TOTAL_SPEND = LEDGER.reduce((sum, r) => sum + parseCost(r.cost), 0);
export const BUDGET_CAP = 30.0;
export const PER_REQUEST_CAP = 1.0;
export const BACKEND_COUNT = 3;

// Distinct requested->served backend routes present in the data, in the
// order they first appear — feeds the execution-plane node labels. No
// hand-placed labels: if the ledger ever routes to a fourth backend, this
// list grows with it.
export const BACKEND_ROUTES = Array.from(new Set(LEDGER.map((r) => r.served)));

export const STATS = [
  { label: "Spend vs. cap", value: `$${TOTAL_SPEND.toFixed(6)}`, sub: `of $${BUDGET_CAP.toFixed(2)} · 30-day rolling window` },
  { label: "Calls logged", value: `${TOTAL_CALLS}`, sub: "unsampled — every call, not a spot check" },
  { label: "Backends in rotation", value: `${BACKEND_COUNT}`, sub: "local free-tier → Google → OpenRouter, by policy" },
  { label: "Paid vs. free-tier", value: `${PAID_COUNT} / ${TOTAL_CALLS}`, sub: "call volume has grown past what the free tier absorbs — spend is still nowhere near the $30 cap" },
];

// Pulled live from the gateway's own status tool on Sep 9, 2026 — a
// separate check from the ledger rows above (captured Sep 8-9). Refreshed
// manually when this page is updated, not a real-time ticker. Excludes the
// gateway's separate claude_max billing pool (personal Claude subscription
// spend), same as the ledger rows above — that stays private.
export const LIVE_STATS = [
  { label: "Monthly budget cap", value: "$30.00", sub: "hard ceiling, shared across every machine running this infrastructure" },
  { label: "Spent this window", value: "$2.98", sub: "9.9% of cap — window opened Aug 18, 2026" },
  { label: "Per-request ceiling", value: "$1.00", sub: "reserved and checked before any single call goes out" },
  { label: "Backend health", value: "2 / 3", sub: "Google and OpenRouter reachable at last check; local free-tier backend (LM Studio) was down" },
];

export const FUNCTIONS = [
  {
    name: "GOVERN",
    body: "A spend policy — $30 per 30-day window, shared across every machine running this infrastructure — set once and enforced automatically on every call.",
    field: "policy: budget.json",
  },
  {
    name: "MAP",
    body: "Every call records what was requested and what actually served it. No AI action happens without a named model and a named route.",
    field: "field: model → served_model",
  },
  {
    name: "MEASURE",
    body: "Token volume and cost are recorded on every call; response quality is scored and attached where evaluated.",
    field: "field: in / out / cost / quality",
  },
  {
    name: "MANAGE",
    body: "Spend against paid credit is checked and reserved before the call goes out — the system can't overspend the cap, because it never sends a request that would.",
    field: "function: budget reserve-and-charge",
  },
];

// --- Replay timeline -------------------------------------------------
//
// A compressed-but-order-preserving playback schedule for the /showcase 3D
// scene, derived from the real gaps between LEDGER timestamps — not an
// evenly-spaced index loop. Calls that really happened seconds apart stay
// visually close together; the real multi-hour gaps (Sep 8 morning -> Sep 8
// afternoon -> Sep 9 afternoon -> Sep 9 evening) compress to a bounded but
// still-visible pause via a fractional-power curve, so a replay shows the
// real clustering rhythm in the data instead of pretending every call
// arrived at an even cadence.
//
// Date.UTC with numeric arguments, not Date-string parsing, so this is
// identical across every JS engine this site runs on (Node build, Vercel,
// every browser) — no locale/engine string-parsing ambiguity.

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function tsToEpochSeconds(ts: string): number {
  const m = ts.match(/^(\w{3}) (\d{1,2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return 0;
  const [, mon, day, hh, mm, ss] = m;
  return Date.UTC(2026, MONTHS[mon] ?? 0, Number(day), Number(hh), Number(mm), Number(ss)) / 1000;
}

const REPLAY_WINDOW_SECONDS = 8;
export const REPLAY_TRAVEL_DURATION = 1.1;
const GAP_COMPRESSION_EXPONENT = 0.32;

const rawGapSeconds = LEDGER.map((row, i) =>
  i === 0 ? 0 : Math.max(tsToEpochSeconds(row.ts) - tsToEpochSeconds(LEDGER[i - 1].ts), 0)
);
const compressedGaps = rawGapSeconds.map((s) => Math.pow(s, GAP_COMPRESSION_EXPONENT));
const compressedGapSum = compressedGaps.reduce((a, b) => a + b, 0) || 1;
const gapScale = Math.max(REPLAY_WINDOW_SECONDS - REPLAY_TRAVEL_DURATION, 1) / compressedGapSum;

let replayCursor = 0;
// REPLAY_START_OFFSETS[i] = seconds into the replay when row i departs the
// request plane. Index-aligned with LEDGER.
export const REPLAY_START_OFFSETS: number[] = compressedGaps.map((g) => {
  replayCursor += g * gapScale;
  return replayCursor;
});
export const REPLAY_TOTAL_DURATION =
  (REPLAY_START_OFFSETS[REPLAY_START_OFFSETS.length - 1] ?? 0) + REPLAY_TRAVEL_DURATION;
