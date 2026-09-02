"use client";

import { useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  answerQuery,
  matchQuestion,
  PRESET_QUESTIONS,
  type QueryAnswer,
  type TraceStep,
} from "./lib/query-engine";
import { AS_OF_DATE, SEED_QUOTES, fmtDate, fmtUsd } from "./lib/erp-data";

// ── ERP reporting-copilot demo ───────────────────────────────────────────────
// A genuinely different capability axis from the capital-equipment-order and
// ap-exception-workflow demos: this one is read-side reporting/query, not a
// governed write path. There's no auto/escalate/block ladder here because a
// question never commits a transaction — see lib/query-engine.ts's header
// comment and the strategy note it's grounded in
// (~/SecondBrain/TiogaAI/strategy/2026-08-18-sap-fitgap-notes-case-study-analysis.md,
// "A separate opportunity: read-side reporting gaps"). Illustrative composite
// scenario — a semiconductor capital-equipment manufacturer, not a real
// client, not connected to a real SAP system.

const statusStyle: Record<string, { color: string; bg: string; label: string }> = {
  open: { color: "var(--accent)", bg: "#C8340615", label: "open" },
  converted: { color: "var(--success)", bg: "#4ADE8015", label: "converted" },
  expired: { color: "var(--text-muted)", bg: "#94a3b815", label: "expired" },
};

function StatusPill({ status }: { status: string }) {
  const s = statusStyle[status] ?? statusStyle.expired;
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
}

function TraceRow({ step }: { step: TraceStep }) {
  const color = step.gap ? "var(--warning-light)" : "var(--accent)";
  return (
    <div
      className="flex flex-col gap-1 text-xs px-3 py-2.5 rounded-lg"
      style={{
        background: step.gap ? "color-mix(in srgb, var(--warning-light) 10%, transparent)" : "var(--bg-dark)",
        border: `1px solid ${step.gap ? "color-mix(in srgb, var(--warning-light) 35%, transparent)" : "var(--border)"}`,
      }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono uppercase tracking-wide text-[11px]" style={{ color }}>
          {step.gap ? "reporting gap" : step.label}
        </span>
        {step.sapRef && (
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {step.sapRef}
          </span>
        )}
      </div>
      <p className="text-[var(--text-muted)] leading-relaxed">{step.detail}</p>
    </div>
  );
}

export default function ErpReportingCopilotPage() {
  const [input, setInput] = useState("");
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);
  const [result, setResult] = useState<QueryAnswer | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const [busy, setBusy] = useState(false);

  async function runQuery(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setInput(text);
    await new Promise((r) => setTimeout(r, 450));
    const id = matchQuestion(text);
    const answer = id ? answerQuery(id) : null;
    setAskedQuestion(text);
    setResult(answer);
    setUnsupported(!answer);
    setBusy(false);
  }

  function reset() {
    setInput("");
    setAskedQuestion(null);
    setResult(null);
    setUnsupported(false);
    setBusy(false);
  }

  return (
    <DemoShell
      title="ERP Reporting Copilot"
      badge="Live Interactive Demo — Read-Side Reporting"
      description="Historical quotation lookup, quote-to-order conversion tracking, expiring-quotation notifications, pricing-change history — real fit-gap findings named things standard SAP reporting doesn't fully cover on its own, needing a custom query or enhancement. Ask a business question in plain English against a composite semiconductor capital-equipment manufacturer's quote and order data — watch the query get decomposed into SAP-style tables, including where standard reporting falls short, then get a real answer. Illustrative composite scenario, not a real client engagement."
    >
      {/* Governance note — lightweight, distinguishing read-side from the
          other two demos' write-path policy tier, per the source finding's
          own caveat: read-only isn't zero-governance. */}
      <div
        className="rounded-xl p-4 mb-6 text-xs leading-relaxed"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        <span className="font-semibold" style={{ color: "var(--accent)" }}>A governance note, even though this is read-only: </span>
        this demo never proposes or commits a transaction, so it doesn&apos;t need the auto-execute / escalate / block ladder the
        other two demos on this site do. That doesn&apos;t mean read access needs no governance thinking at all — who should be
        able to ask questions against customer pricing and quote data is its own authorization surface, and something like an
        expiring-quote notifier is a standing automated process, not a one-off lookup, and deserves its own lighter-weight
        scoping. This demo illustrates the query/reasoning capability, not that policy layer.
      </div>

      {/* Query box */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Ask a question</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Pick an example, or type your own — this illustrative demo supports the three questions below (and close variants of
          them).
        </p>
        <div className="flex flex-col gap-2 mb-5">
          {PRESET_QUESTIONS.map((p) => (
            <button
              key={p.id}
              disabled={busy}
              onClick={() => runQuery(p.question)}
              className="text-left px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{p.question}</p>
            </button>
          ))}
        </div>

        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs text-[var(--text-muted)] mb-3">Or type your own question:</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. which quotes expire soon and haven't converted?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runQuery(input)}
              className="px-3 py-2.5 rounded-lg text-sm flex-1"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <button
              disabled={busy || !input.trim()}
              onClick={() => runQuery(input)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
            >
              {busy ? "Reasoning…" : "Ask"}
            </button>
          </div>
        </div>
      </div>

      {/* Answer */}
      {askedQuestion && !busy && (
        <>
          <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold" style={{ color: "var(--text)" }}>How I&apos;m answering this</h2>
              <button
                onClick={reset}
                className="text-xs px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex-none"
                style={{ border: "1px solid var(--border)" }}
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              &ldquo;{askedQuestion}&rdquo;
            </p>

            {unsupported || !result ? (
              <p className="text-sm text-[var(--text-muted)]">
                This illustrative demo doesn&apos;t have a canned answer for that question — try one of the three example
                questions above, or a close variant of one of them.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {result.trace.map((step, i) => (
                  <TraceRow key={i} step={step} />
                ))}
              </div>
            )}
          </div>

          {result && (
            <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="px-5 pt-5 pb-3">
                <h2 className="font-semibold" style={{ color: "var(--text)" }}>Answer</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">{result.summary}</p>
              </div>
              {result.rows.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] px-5 pb-6">No matching records.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: 640 }}>
                    <thead>
                      <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                        {result.columns.map((h) => (
                          <th key={h} className="text-left text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-medium px-4 py-2.5 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: i === result.rows.length - 1 ? "none" : "1px solid var(--border)" }}>
                          {row.map((cell, ci) => (
                            <td
                              key={ci}
                              className={`px-4 py-2.5 whitespace-nowrap ${ci === 0 ? "font-mono text-xs" : "text-[var(--text-muted)]"}`}
                              style={ci === 0 ? { color: "var(--text)" } : undefined}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Underlying dataset reference */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Quote register (underlying data)</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          The full illustrative dataset every question above is run against — reference date {fmtDate(AS_OF_DATE)}.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Quote", "Customer", "Configuration", "Price", "Quote Date", "Valid Until", "Status", "Order"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-medium px-3 py-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEED_QUOTES.map((q) => (
                <tr key={q.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-3 py-2 font-mono text-xs whitespace-nowrap" style={{ color: "var(--text)" }}>{q.id}</td>
                  <td className="px-3 py-2 text-[var(--text-muted)] whitespace-nowrap">{q.customer}</td>
                  <td className="px-3 py-2 text-[var(--text-muted)] whitespace-nowrap">{q.configuration}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{fmtUsd(q.currentPrice)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{fmtDate(q.quoteDate)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{fmtDate(q.validUntil)}</td>
                  <td className="px-3 py-2 whitespace-nowrap"><StatusPill status={q.status} /></td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{q.orderId ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Everything on this page runs in your browser against a fixed, illustrative dataset — nothing is sent to a server, and
        there is no live SAP connection behind it. The reasoning trace above shows conceptually which SAP-style tables a real
        implementation would read (quotation headers/lines, pricing conditions, document flow) and, where relevant, that
        standard SAP reporting doesn&apos;t already ship the specific join being asked for — the same reporting-gap pattern the
        source SAP fit-gap notes name explicitly. Composite scenario grounded in a real SAP fit-gap finding — not a real client
        engagement, not real customer or pricing data.
      </p>
    </DemoShell>
  );
}
