"use client";

import { useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  cloneSeed,
  buildFieldLog,
  buildAnswer,
  summarizeOvertime,
  PLANT,
  MONTH_LABEL,
  QUESTION,
  MONTH_WEEKDAYS,
  type FieldLogEntry,
} from "./lib/policy";

// ── Presentation helpers ─────────────────────────────────────────────────────

function fmtHours(n: number) {
  return `${n}h`;
}

function FieldRow({ entry }: { entry: FieldLogEntry }) {
  return (
    <div
      className="flex items-start justify-between gap-3 px-3 py-2 rounded-lg"
      style={{
        background: entry.sensitive ? "#EF444415" : "var(--bg-dark)",
        border: `1px solid ${entry.sensitive ? "#EF444440" : "var(--border)"}`,
      }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono" style={{ color: "var(--text)" }}>{entry.field}</span>
          {entry.sensitive ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide" style={{ color: "var(--error-light)", border: "1px solid #EF444460" }}>
              sensitive
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide" style={{ color: "var(--success)", border: "1px solid #4ADE8060" }}>
              allowed
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{entry.note}</p>
      </div>
      <span className="flex-none text-xs font-mono text-[var(--text-muted)] whitespace-nowrap">×{entry.occurrences}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function ContextWindowDataMinimizationPage() {
  const [{ employees, shifts }] = useState(() => cloneSeed());
  const [busy, setBusy] = useState(false);
  const [ranOnce, setRanOnce] = useState(false);

  const naiveLog = buildFieldLog("naive", employees, shifts);
  const governedLog = buildFieldLog("governed", employees, shifts);
  const naiveAnswer = buildAnswer("naive", employees, shifts);
  const governedAnswer = buildAnswer("governed", employees, shifts);
  const overtimeSummary = summarizeOvertime(employees, shifts);

  const naiveSensitiveCount = naiveLog.filter((f) => f.sensitive).length;
  const governedSensitiveCount = governedLog.filter((f) => f.sensitive).length;
  const naiveOccurrences = naiveLog.reduce((a, f) => a + f.occurrences, 0);
  const governedOccurrences = governedLog.reduce((a, f) => a + f.occurrences, 0);

  async function ask() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    setBusy(false);
    setRanOnce(true);
  }

  function reset() {
    setRanOnce(false);
    setBusy(false);
  }

  return (
    <DemoShell
      title="Context-Window Data Minimization"
      badge="Live Interactive Demo — Field-Level Allowlist"
      evidenceTier="browser-simulation"
      description="A control class with no ERP write-path equivalent: what data actually enters an agent's context window. Ask the same real HR question two ways — once with no allowlist, once with a field-level allowlist enforced at the boundary — and see exactly which fields entered each agent's prompt, side by side. 100% synthetic data: a small invented Plant 3 roster and a month of invented shift records, not connected to any real UKG tenant."
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Naive fields</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--error-light)" }}>{naiveLog.length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{naiveSensitiveCount} sensitive, {naiveOccurrences} total occurrences</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Governed fields</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--success)" }}>{governedLog.length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{governedSensitiveCount} sensitive, {governedOccurrences} total occurrences</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Fields blocked</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--text)" }}>{naiveLog.length - governedLog.length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">never assembled into the governed prompt</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Employees in scope</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--text)" }}>{Object.keys(employees).length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{PLANT}, {MONTH_LABEL}</p>
        </div>
      </div>

      {/* Ask panel */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>The question</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text)" }}>&ldquo;{QUESTION}&rdquo;</p>
        <div className="flex gap-3">
          <button
            disabled={busy}
            onClick={ask}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            {busy ? "Assembling context…" : "Ask both agents"}
          </button>
          {ranOnce && (
            <button
              onClick={reset}
              className="text-xs px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              style={{ border: "1px solid var(--border)" }}
            >
              Reset demo
            </button>
          )}
        </div>
      </div>

      {ranOnce && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Naive agent */}
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid #EF444440" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--error-light)" }} />
              <h2 className="font-semibold" style={{ color: "var(--text)" }}>Naive agent</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">Fetches the entire employee record for every employee with a shift that month — no field-level boundary.</p>
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-2">Fields that entered its prompt</p>
            <div className="flex flex-col gap-2 mb-4">
              {naiveLog.map((f) => (
                <FieldRow key={f.field} entry={f} />
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-2">Answer</p>
            <p className="text-sm leading-relaxed p-3 rounded-lg" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              {naiveAnswer}
            </p>
          </div>

          {/* Governed agent */}
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid #4ADE8040" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
              <h2 className="font-semibold" style={{ color: "var(--text)" }}>Governed agent</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">A field-level allowlist enforced at the boundary — only the fields an overtime question needs ever get assembled into the prompt.</p>
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-2">Fields that entered its prompt</p>
            <div className="flex flex-col gap-2 mb-4">
              {governedLog.map((f) => (
                <FieldRow key={f.field} entry={f} />
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-2">Answer</p>
            <p className="text-sm leading-relaxed p-3 rounded-lg" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              {governedAnswer}
            </p>
          </div>
        </div>
      )}

      {/* Underlying synthetic data */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Underlying synthetic data</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Invented roster and shift data for {PLANT} — {MONTH_WEEKDAYS.length} shift-days × {Object.keys(employees).length}{" "}
          employees for {MONTH_LABEL}. Every name, SSN, pay rate, and shift below is synthetic and does not represent any
          real person or any real UKG tenant.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Employee", "Department", "Overtime hours (month)", "Overtime shifts"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-medium px-3 py-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(employees).map((e) => {
                const s = overtimeSummary.find((o) => o.employeeId === e.employeeId);
                return (
                  <tr key={e.employeeId} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--text)" }}>{e.name} <span className="text-[var(--text-muted)] font-mono text-xs">({e.employeeId})</span></td>
                    <td className="px-3 py-2 text-[var(--text-muted)] whitespace-nowrap">{e.department}</td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{fmtHours(s?.totalOvertimeHours ?? 0)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{s?.overtimeShiftCount ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        The governed agent&apos;s field-level allowlist is enforced before assembly, not by asking the model to ignore
        fields it already received — sensitive fields like SSN, pay rate, leave reason, medical-accommodation flag,
        union status, and full timecard history never leave the boundary for this question class at all. Both agents
        reach a materially similar answer from the same underlying data; the point of this demo isn&apos;t answer
        quality, it&apos;s that the governed path proves you don&apos;t need the sensitive fields to answer correctly.
        Everything on this page runs in your browser; nothing is sent to a server. 100% synthetic data — invented for
        this demo, not sourced from or connected to any real UKG tenant, sandbox, or export.
      </p>
    </DemoShell>
  );
}
