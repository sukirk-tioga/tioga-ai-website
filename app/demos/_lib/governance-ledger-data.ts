// Real excerpt from Tioga's own AI routing gateway ledger (JARVIS), captured
// 2026-07-26. Not synthetic — this is what the governed-write-path and
// insurance-readiness offers are built on: every model call logged, costed,
// budget-capped, and attributed as a byproduct of routing, not bolted on.
//
// Shared between the full /demos/governance-ledger page and the homepage
// preview card so the two never drift out of sync with different data.

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
