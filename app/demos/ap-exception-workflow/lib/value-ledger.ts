// Live value-ledger computation for the AP Exception Workflow demo.
//
// This is the "connect the static value-report concept to the live demo"
// piece — see ~/SecondBrain/TiogaAI/projects/client-value-ledger-methodology.md
// for the full methodology this follows. Key rules from that doc, applied
// here:
//   1. Baseline time and hourly rate are never invented industry figures —
//      they're editable inputs the visitor supplies (see ValueLedgerPanel),
//      pre-filled with the same illustrative starting values used in the
//      static sample (public/samples/weekly-value-report.html) so there's
//      something to react to, clearly labeled as a starting point to
//      replace, not a claim.
//   2. Hours saved = (baseline minutes − AI processing minutes) × volume ÷ 60,
//      computed only for actions that actually completed (auto-executed or
//      escalated-then-approved) — not a naive sum over every ledger entry.
//   3. Blocked and escalated actions are still counted in the totals
//      (as evidence the governance layer works), just not folded into the
//      hours/$ figure, since nothing was completed on those.
//   4. Every report shows its inputs alongside the output.

import type { LedgerEntry } from "./policy";

// ~2s, matching the sample report's "~2s" AI-time figure and the site's own
// measured invoice-extraction latency (~1.7s avg — see
// /engineering/invoice-processing) rather than an invented number.
export const AI_PROCESSING_MINUTES = 0.03;

// Same illustrative starting values as public/samples/weekly-value-report.html
// — a starting point to edit, never presented as a real client figure.
export const DEFAULT_BASELINE_MINUTES = 14;
export const DEFAULT_HOURLY_RATE_USD = 42;

export interface ValueLedgerInputs {
  baselineMinutesPerAction: number;
  hourlyRateUsd: number;
}

export interface ValueLedgerRow {
  label: string;
  volume: number;
  baselineMinutesPerAction: number;
  aiProcessingMinutes: number;
  hoursSaved: number;
}

export interface ValueLedgerTotals {
  actionsProcessed: number;
  escalatedToHuman: number;
  blocked: number;
  hoursSaved: number;
  dollarValue: number;
}

export interface ValueLedgerResult {
  rows: ValueLedgerRow[];
  totals: ValueLedgerTotals;
}

function isEscalatedRoute(e: LedgerEntry): boolean {
  return e.policyChecks.some((c) => c.name === "spend_cap" && c.route === "human_approval");
}

function mkRow(label: string, volume: number, inputs: ValueLedgerInputs): ValueLedgerRow {
  const perActionMinutes = Math.max(0, inputs.baselineMinutesPerAction - AI_PROCESSING_MINUTES);
  return {
    label,
    volume,
    baselineMinutesPerAction: inputs.baselineMinutesPerAction,
    aiProcessingMinutes: AI_PROCESSING_MINUTES,
    hoursSaved: (perActionMinutes * volume) / 60,
  };
}

// Computes the live value ledger from the demo's actual audit ledger — the
// same "log every decision, not just the wins" ledger the page already
// renders, not a separate tracking system.
export function computeValueLedger(ledger: LedgerEntry[], inputs: ValueLedgerInputs): ValueLedgerResult {
  // A rollback writes a *new* entry with `relatesTo` pointing at the action
  // it reverses — the original entry itself isn't mutated. Reversal
  // bookkeeping entries (successful rollback or a blocked rollback attempt)
  // aren't new exceptions, so they're excluded from the top-level tallies.
  const rolledBackIds = new Set(ledger.filter((e) => e.relatesTo).map((e) => e.relatesTo));
  const proposals = ledger.filter((e) => !e.relatesTo);

  const autoExecuted = proposals.filter(
    (e) => e.decision === "executed" && !isEscalatedRoute(e) && !rolledBackIds.has(e.actionId)
  );
  const escalatedExecuted = proposals.filter(
    (e) => e.decision === "executed" && isEscalatedRoute(e) && !rolledBackIds.has(e.actionId)
  );
  const escalatedToHuman = proposals.filter(isEscalatedRoute);
  const blocked = proposals.filter((e) => e.decision === "blocked");

  const rows = [
    mkRow("PO adjustment (auto-approved)", autoExecuted.length, inputs),
    mkRow("PO adjustment (escalated → approved)", escalatedExecuted.length, inputs),
  ].filter((r) => r.volume > 0);

  const hoursSaved = rows.reduce((s, r) => s + r.hoursSaved, 0);
  const dollarValue = hoursSaved * inputs.hourlyRateUsd;

  return {
    rows,
    totals: {
      actionsProcessed: proposals.length,
      escalatedToHuman: escalatedToHuman.length,
      blocked: blocked.length,
      hoursSaved,
      dollarValue,
    },
  };
}

function fmtHours(n: number): string {
  return `${n.toFixed(1)} hrs`;
}

function fmtUsd(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// Builds a standalone HTML report in the same structure/styling as
// public/samples/weekly-value-report.html, populated with this session's
// real ledger data instead of the sample's illustrative figures. Runs
// entirely client-side — no server round trip, no persistence.
export function buildValueReportHtml(result: ValueLedgerResult, inputs: ValueLedgerInputs): string {
  const { rows, totals } = result;
  const generatedAt = new Date();
  const escalatedPct = totals.actionsProcessed > 0 ? Math.round((totals.escalatedToHuman / totals.actionsProcessed) * 100) : 0;

  const rowsHtml = rows.length
    ? rows
        .map(
          (r) => `    <tr><td>${r.label}</td><td>${r.volume}</td><td>${r.baselineMinutesPerAction} min</td><td>~2s</td><td>${fmtHours(r.hoursSaved)}</td></tr>`
        )
        .join("\n")
    : `    <tr><td colspan="5">No completed actions yet this session.</td></tr>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Live Session Value Report — Tioga AI</title>
<style>
  :root{
    --bg-dark:#F5F3EF; --bg-card:#FCFCF9; --border:#CDCAC2; --accent:#C83406;
    --accent-dark:#A50000; --text:#221F19; --text-muted:#625D54; --success:#4B7A45; --warning:#A8681E;
  }
  *{box-sizing:border-box;}
  body{margin:0;background:var(--bg-dark);color:var(--text);font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
  .wrap{max-width:760px;margin:0 auto;padding:56px 28px 80px;}
  .eyebrow{font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:10px;}
  h1{font-size:28px;margin:0 0 6px;color:var(--text);}
  .sub{color:var(--text-muted);margin:0 0 28px;max-width:56ch;}
  .disclaimer{background:rgba(168,104,30,0.08);border:1px solid rgba(168,104,30,0.35);border-radius:8px;padding:12px 16px;font-size:13px;color:#7A4A15;margin-bottom:36px;}
  h2{font-size:17px;color:var(--text);margin:34px 0 10px;padding-left:12px;border-left:3px solid var(--accent);}
  table{width:100%;border-collapse:collapse;margin:14px 0;font-size:14px;}
  th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--border);vertical-align:top;}
  th{font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--text-muted);background:var(--bg-card);}
  ul{margin:8px 0;padding-left:20px;color:var(--text-muted);}
  li{margin-bottom:6px;}
  .card{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:18px 20px;margin:14px 0;}
  .stat-row{display:flex;gap:12px;flex-wrap:wrap;margin:14px 0;}
  .stat{flex:1;min-width:140px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px 16px;}
  .stat .n{font-family:ui-monospace,monospace;font-size:22px;color:var(--text);font-weight:600;}
  .stat .l{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--text-muted);margin-top:2px;}
  .assump{font-size:13px;color:var(--text-muted);}
  .foot{margin-top:52px;padding-top:20px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);}
  @media print{
    body{background:#fff;color:#111;}
    .disclaimer{background:#fff8e6;color:#92610a;}
    .card,.stat{background:#fafafa;border-color:#ddd;}
    th{background:#f3f3f3;color:#555;}
    td,th{border-color:#ddd;}
    .stat .n{color:#111;}
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="eyebrow">tioga.ai — live demo session export</div>
  <h1>Live Session Value Report</h1>
  <p class="sub">Generated from the actions you actually took in the Governed AP Exception Workflow demo — same structure as Tioga's weekly value report template, run against your own live session instead of a sample.</p>
  <div class="disclaimer">This is a live product demo, not a real client engagement. The action counts below (executed / escalated / blocked) are real, from this session's audit ledger. The baseline time and hourly rate are the values you entered in the demo panel — not Tioga-collected client data or an industry average. Tioga is pre-launch with no live client engagements yet; this is the same calculation template the first real engagement's weekly reports will use, applied to your own numbers.</div>

  <h2>01 — Session &amp; assumptions</h2>
  <table>
    <tr><th>Session</th><td>Live demo — Governed AP Exception Workflow (tioga.ai/demos/ap-exception-workflow)</td></tr>
    <tr><th>Generated</th><td>${generatedAt.toLocaleString()}</td></tr>
    <tr><th>Baseline time per exception</th><td>${inputs.baselineMinutesPerAction} min — <span class="assump">entered by you in this demo, not an industry average</span></td></tr>
    <tr><th>Loaded labor rate</th><td>${fmtUsd(inputs.hourlyRateUsd)}/hr — <span class="assump">entered by you in this demo, not a Tioga-picked figure</span></td></tr>
  </table>

  <h2>02 — This session's actions</h2>
  <table>
    <tr><th>Action type</th><th>Volume</th><th>Baseline</th><th>AI time</th><th>Hours saved</th></tr>
${rowsHtml}
  </table>

  <h2>03 — Totals</h2>
  <div class="stat-row">
    <div class="stat"><div class="n">${totals.actionsProcessed}</div><div class="l">Actions processed</div></div>
    <div class="stat"><div class="n">${totals.escalatedToHuman} (${escalatedPct}%)</div><div class="l">Escalated to human</div></div>
    <div class="stat"><div class="n">${totals.blocked}</div><div class="l">Blocked by policy</div></div>
    <div class="stat"><div class="n">${fmtHours(totals.hoursSaved)}</div><div class="l">Hours saved</div></div>
    <div class="stat"><div class="n">${fmtUsd(totals.dollarValue)}</div><div class="l">Value this session</div></div>
  </div>
  <p class="assump">Escalated and blocked actions are counted here deliberately — the same "every decision is evidence, not just the successes" principle behind this demo's audit ledger. A report that only shows the wins isn't one a governance-minded buyer should trust.</p>

  <h2>04 — How this is calculated (so you can check it)</h2>
  <div class="card">
    <ul>
      <li><strong>Baseline time is whatever you entered above, not an industry average.</strong> In a real engagement this is captured from the client's own historical handle time during the discovery sprint.</li>
      <li><strong>Hourly rate is whatever you entered above.</strong> In a real engagement this is the client's own fully-loaded labor cost for the role being augmented — never a number Tioga picks.</li>
      <li><strong>Volume is a real count from this session's governance ledger</strong> — the same log used for the audit trail on this demo page — not a separate estimate.</li>
      <li><strong>Hours saved = (baseline minutes − AI processing minutes) × volume ÷ 60.</strong> AI processing time is near-zero (~2s) at the latencies Tioga's own demo benchmarks show.</li>
      <li><strong>Blocked and rolled-back actions are excluded from the hours/value figure</strong> — nothing was completed on them, so no time was saved.</li>
    </ul>
  </div>

  <div class="foot">
    Tioga AI — governed AI automation for enterprise systems. Generated client-side from your own demo session; nothing about this session was sent to a server. See the live ledger pattern this report extends at
    tioga.ai/demos/ap-exception-workflow.
  </div>
</div>
</body>
</html>
`;
}
