"use client";

import { useMemo, useState } from "react";
import type { LedgerEntry } from "./lib/policy";
import {
  computeValueLedger,
  buildValueReportHtml,
  DEFAULT_BASELINE_MINUTES,
  DEFAULT_HOURLY_RATE_USD,
} from "./lib/value-ledger";

function fmtHours(n: number) {
  return `${n.toFixed(1)} hrs`;
}

function fmtUsd(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// Live rollup of the demo's own audit ledger into a value report — the same
// methodology as the static sample at /samples/weekly-value-report.html,
// computed from the visitor's actual actions instead of illustrative data.
// See ~/SecondBrain/TiogaAI/projects/client-value-ledger-methodology.md.
export default function ValueLedgerPanel({ ledger }: { ledger: LedgerEntry[] }) {
  const [baselineMinutes, setBaselineMinutes] = useState(DEFAULT_BASELINE_MINUTES);
  const [hourlyRate, setHourlyRate] = useState(DEFAULT_HOURLY_RATE_USD);

  const result = useMemo(
    () =>
      computeValueLedger(ledger, {
        baselineMinutesPerAction: Number.isFinite(baselineMinutes) ? baselineMinutes : 0,
        hourlyRateUsd: Number.isFinite(hourlyRate) ? hourlyRate : 0,
      }),
    [ledger, baselineMinutes, hourlyRate]
  );

  const { totals } = result;

  function exportReport() {
    const html = buildValueReportHtml(result, {
      baselineMinutesPerAction: Number.isFinite(baselineMinutes) ? baselineMinutes : 0,
      hourlyRateUsd: Number.isFinite(hourlyRate) ? hourlyRate : 0,
    });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tioga-live-session-value-report.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div
      data-testid="value-ledger-panel"
      className="rounded-2xl p-5 mb-6"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Value ledger — this session</h2>
          <p className="text-xs text-[var(--text-muted)] max-w-md">
            Computed live from the actions above. Baseline time and hourly rate are starting points — edit them
            to match your own team's numbers, per Tioga's{" "}
            <a href="/samples/weekly-value-report.html" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--accent)" }}>
              value-report methodology
            </a>
            : never an invented industry figure.
          </p>
        </div>
        <button
          onClick={exportReport}
          className="text-xs px-3 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90 flex-none"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
        >
          Export session report
        </button>
      </div>

      {/* Editable assumptions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <label className="flex-1 flex flex-col gap-1">
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Baseline minutes per exception</span>
          <input
            type="number"
            min={0}
            step={1}
            value={baselineMinutes}
            onChange={(e) => setBaselineMinutes(e.target.valueAsNumber)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <span className="text-[11px] text-slate-500">Your team's own estimate — not an industry average.</span>
        </label>
        <label className="flex-1 flex flex-col gap-1">
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Loaded hourly rate (USD)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.valueAsNumber)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <span className="text-[11px] text-slate-500">Your own fully-loaded labor cost for this role.</span>
        </label>
      </div>

      {/* Live totals */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <div className="p-3 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
          <p className="text-lg font-bold font-mono" style={{ color: "var(--text)" }}>{totals.actionsProcessed}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Actions processed</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
          <p className="text-lg font-bold font-mono" style={{ color: "var(--text)" }}>{totals.escalatedToHuman}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Escalated to human</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
          <p className="text-lg font-bold font-mono" style={{ color: "var(--text)" }}>{totals.blocked}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Blocked by policy</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--accent)" }}>
          <p className="text-lg font-bold font-mono" style={{ color: "var(--accent)" }}>
            {fmtHours(totals.hoursSaved)}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Hours saved</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--accent)" }}>
          <p className="text-lg font-bold font-mono" style={{ color: "var(--accent)" }}>
            {fmtUsd(totals.dollarValue)}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Value this session</p>
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        Only completed actions (auto-approved or escalated-then-approved) count toward hours/value — escalated and
        blocked actions are tallied above as evidence the governance layer works, not folded into the total. A
        rolled-back action's hours are removed once reversed.
      </p>
    </div>
  );
}
