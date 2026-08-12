// Shared governance-ledger data module.
//
// This is the single source of truth for the real excerpt from Tioga's own
// AI routing gateway ledger (JARVIS), captured Jul 17-25 2026. It backs both
// `/demos/governance-ledger` (the table view) and `/showcase` (the 3D
// scene) — extracted here specifically so the two views can never drift:
// change a row here, both pages change with it.
//
// Not synthetic. Every field traces to a real model call our own
// infrastructure made: what was requested, what actually served it, token
// counts, cost, which pool (free vs. paid) it settled against, and which
// NIST AI RMF functions it evidences.

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
  { ts: "Jul 17 16:54:27", requested: "gemini-flash", served: "gemini-3-flash-preview", in: 29, out: 6, cost: "$0.000002", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 16:54:37", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 43, out: 150, cost: "$0.000490", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Jul 17 17:20:09", requested: "glm-flash", served: "qwen/qwen3-8b", in: 14, out: 30, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:20:46", requested: "glm-flash", served: "qwen/qwen3-8b", in: 14, out: 400, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:20:49", requested: "gemini-flash", served: "gemini-3-flash-preview", in: 8, out: 20, cost: "$0.000003", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:21:18", requested: "glm-flash", served: "qwen/qwen3-8b", in: 14, out: 400, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:21:20", requested: "gemini-flash", served: "gemini-3-flash-preview", in: 8, out: 20, cost: "$0.000003", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:21:45", requested: "glm-flash", served: "qwen/qwen3-8b", in: 18, out: 13, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:21:48", requested: "gemini-flash", served: "gemini-3-flash-preview", in: 8, out: 1, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:21:52", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 19, out: 79, cost: "$0.000255", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Jul 17 17:54:32", requested: "glm-flash", served: "qwen/qwen3-8b", in: 17, out: 12, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 22 22:39:58", requested: "glm-flash", served: "qwen/qwen3-8b", in: 19, out: 6, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 24 12:57:27", requested: "glm-flash", served: "qwen/qwen3-8b", in: 21, out: 7, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 25 11:15:59", requested: "glm-flash", served: "qwen/qwen3-8b", in: 17, out: 12, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 25 14:07:30", requested: "glm-flash", served: "qwen/qwen3-8b", in: 18, out: 7, cost: "$0.000000", pool: "free", quality: "0.90", tags: ["MAP", "MEASURE"] },
  { ts: "Jul 25 15:14:39", requested: "glm-flash", served: "qwen/qwen3-8b", in: 19, out: 8, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 25 15:34:07", requested: "glm-flash", served: "qwen/qwen3-8b", in: 19, out: 6, cost: "$0.000000", pool: "free", tags: ["MAP"] },
];

export const STATS = [
  { label: "Spend vs. cap", value: "$0.000753", sub: "of $30.00 · 30-day rolling window" },
  { label: "Calls logged", value: "17", sub: "unsampled — every call, not a spot check" },
  { label: "Backends in rotation", value: "3", sub: "local free-tier → Google → OpenRouter, by policy" },
  { label: "Paid vs. free-tier", value: "2 / 17", sub: "71% of calls settled at exactly $0 before touching billed credit" },
];

// Pulled live from the gateway's own status tool on Jul 27, 2026 — a
// separate check from the ledger rows above (captured Jul 17-25). Refreshed
// manually when this page is updated, not a real-time ticker.
export const LIVE_STATS = [
  { label: "Monthly budget cap", value: "$30.00", sub: "hard ceiling, shared across every machine running this infrastructure" },
  { label: "Spent this window", value: "$0.0007", sub: "0.002% of cap — window opened Jul 17, 2026" },
  { label: "Per-request ceiling", value: "$1.00", sub: "reserved and checked before any single call goes out" },
  { label: "Backend health", value: "3 / 3", sub: "local T0, Google, and OpenRouter all reachable at last check" },
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

// --- Derived figures --------------------------------------------------
//
// These are computed from LEDGER itself (not hand-typed) so they can never
// drift from the rows above — this is what the 3D scene's budget aperture,
// free-pool bypass, and provenance strip read from. If a row ever changes,
// these change with it.

function parseCost(cost: string): number {
  return parseFloat(cost.replace("$", ""));
}

export const TOTAL_CALLS = LEDGER.length; // 17
export const FREE_COUNT = LEDGER.filter((r) => r.pool === "free").length; // 15
export const PAID_COUNT = LEDGER.filter((r) => r.pool === "paid").length; // 2

// The corrected figure (Fable's review caught the draft plan's wrong "15 of
// 17"): of the 15 free-pool calls, 3 carry small non-zero Gemini costs
// ($0.000002-$0.000003) — only 12 of 17 calls settle at exactly $0.
export const FREE_ZERO_COST_COUNT = LEDGER.filter(
  (r) => r.pool === "free" && parseCost(r.cost) === 0
).length; // 12
export const FREE_ZERO_COST_PCT = Math.round((FREE_ZERO_COST_COUNT / TOTAL_CALLS) * 100); // 71

export const TOTAL_SPEND = LEDGER.reduce((sum, r) => sum + parseCost(r.cost), 0);
export const BUDGET_CAP = 30.0;
export const PER_REQUEST_CAP = 1.0;
export const BACKEND_COUNT = 3;

// Distinct requested->served backend routes present in the data, in the
// order they first appear — feeds the execution-plane node labels. No
// hand-placed labels: if the ledger ever routes to a fourth backend, this
// list grows with it.
export const BACKEND_ROUTES = Array.from(new Set(LEDGER.map((r) => r.served)));
