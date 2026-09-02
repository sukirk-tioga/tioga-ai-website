"use client";

import { useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  TRIAL_META,
  TOS_CHECKLIST,
  PROVENANCE_RESULT,
  METRIC_SCALE_RESULT,
  AUDIT_QUESTION,
  METHODOLOGY_NOTE,
  type AuditCheckItem,
} from "./lib/scenario";

// ── Marble (World Labs) world-generation audit. Unlike the other demos in
// this folder, this one is grounded in a REAL trial run against the live
// World API (not a simulated/composite scenario) — see lib/scenario.ts's
// header comment for the source data. The reveal sequencing below is UI
// pacing only; every number shown is a real, already-measured result, not
// something generated live in the browser.

type PanelKey = "tos" | "provenance" | "scale";

function ChecklistRow({ item }: { item: AuditCheckItem }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span
        className="flex-none mt-0.5 font-bold"
        style={{ color: item.verified ? "var(--success)" : "var(--error-light)" }}
      >
        {item.verified ? "✓" : "✗"}
      </span>
      <div>
        <p className="text-slate-200 font-medium">{item.claim}</p>
        <p className="text-slate-400 mt-0.5">{item.detail}</p>
      </div>
    </div>
  );
}

export default function MarbleWorldAuditPage() {
  const [revealed, setRevealed] = useState<Set<PanelKey>>(new Set());
  const [busy, setBusy] = useState(false);

  async function play() {
    setBusy(true);
    setRevealed(new Set());
    await new Promise((r) => setTimeout(r, 250));
    setRevealed(new Set<PanelKey>(["tos"]));
    await new Promise((r) => setTimeout(r, 550));
    setRevealed(new Set<PanelKey>(["tos", "provenance"]));
    await new Promise((r) => setTimeout(r, 550));
    setRevealed(new Set<PanelKey>(["tos", "provenance", "scale"]));
    setBusy(false);
  }

  function reset() {
    setRevealed(new Set());
    setBusy(false);
  }

  const allRevealed = revealed.size === 3;
  const verifiedCount = TOS_CHECKLIST.filter((i) => i.verified).length;

  return (
    <DemoShell
      title="Marble World-Generation Audit: What We Actually Measured"
      badge="Real Trial Data — Not a Simulated Scenario"
      description="World Labs' Marble turns a single photo into an explorable 3D world. Vendors make claims about commercial usability and dimensional accuracy — we ran the actual trial: two real generations, a byte-level provenance scan, and a real physical measurement. Here's what held up and what didn't."
    >
      {/* The audit question */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--warning-light)" }}>
        <p className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: "var(--warning-light)" }}>
          The question this demo answers
        </p>
        <p className="text-sm text-white font-medium">&ldquo;{AUDIT_QUESTION}&rdquo;</p>
        <button
          onClick={play}
          disabled={busy}
          className="mt-4 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
        >
          {busy ? "Running audit…" : allRevealed ? "Replay the audit" : "Run the audit"}
        </button>
      </div>

      {/* Trial metadata strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden mb-6" style={{ background: "var(--border)" }}>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-sm font-bold mb-1 font-mono" style={{ color: "var(--accent)" }}>{TRIAL_META.model}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Model</div>
        </div>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-sm font-bold mb-1 font-mono" style={{ color: "var(--accent)" }}>{TRIAL_META.inputType}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Input</div>
        </div>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-sm font-bold mb-1 font-mono" style={{ color: "var(--accent)" }}>{TRIAL_META.cost}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Cost</div>
        </div>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-sm font-bold mb-1 font-mono" style={{ color: "var(--accent)" }}>{TRIAL_META.date}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Run date</div>
        </div>
      </div>

      {/* Panel 1 — ToS / commercial rights */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <span
            className="text-[11px] font-mono px-2 py-0.5 rounded-full"
            style={{ color: "var(--accent)", background: "#EC6D3D15", border: "1px solid #EC6D3D40" }}
          >
            Panel 1
          </span>
          <h3 className="font-semibold text-white">Commercial rights &amp; ToS</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">Checked against the actual terms, not a summary of them.</p>
        {!revealed.has("tos") ? (
          <p className="text-xs text-slate-500 italic">Run the audit to reveal.</p>
        ) : (
          <div className="rounded-lg p-3 flex flex-col gap-2.5" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
            {TOS_CHECKLIST.map((item, i) => (
              <ChecklistRow key={i} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Panel 2 — Provenance scan */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <span
            className="text-[11px] font-mono px-2 py-0.5 rounded-full"
            style={{ color: "var(--violet)", background: "#8B5CF615", border: "1px solid #8B5CF640" }}
          >
            Panel 2
          </span>
          <h3 className="font-semibold text-white">Provenance scan</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">Byte-level scan of every exported file for C2PA/XMP/EXIF/glTF-extras/PLY-comment markers.</p>
        {!revealed.has("provenance") ? (
          <p className="text-xs text-slate-500 italic">Run the audit to reveal.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-px rounded-lg overflow-hidden" style={{ background: "var(--border)" }}>
              <div className="px-4 py-3 text-center" style={{ background: "var(--bg-dark)" }}>
                <div className="text-xl font-bold" style={{ color: "var(--accent)" }}>{PROVENANCE_RESULT.filesScanned}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">Files scanned</div>
              </div>
              <div className="px-4 py-3 text-center" style={{ background: "var(--bg-dark)" }}>
                <div className="text-xl font-bold" style={{ color: "var(--accent)" }}>{PROVENANCE_RESULT.runsScanned}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">Generations</div>
              </div>
              <div className="px-4 py-3 text-center" style={{ background: "var(--bg-dark)" }}>
                <div className="text-xl font-bold" style={{ color: "var(--success)" }}>{PROVENANCE_RESULT.realMarkersFound}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">Real markers found</div>
              </div>
            </div>
            <div className="rounded-lg p-3 text-xs" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
              <p className="text-slate-200 font-medium mb-1">
                One false positive caught and resolved — {PROVENANCE_RESULT.falsePositiveCaught.file} matched <code className="font-mono">{PROVENANCE_RESULT.falsePositiveCaught.matched}</code>
              </p>
              <p className="text-slate-400">{PROVENANCE_RESULT.falsePositiveCaught.resolution}</p>
            </div>
          </div>
        )}
      </div>

      {/* Panel 3 — Metric scale accuracy */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--warning-light)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <span
            className="text-[11px] font-mono px-2 py-0.5 rounded-full"
            style={{ color: "var(--warning-light)", background: "#F59E0B15", border: "1px solid #F59E0B40" }}
          >
            Panel 3
          </span>
          <h3 className="font-semibold text-white">Metric-scale accuracy</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">A real physical measurement, compared to the reconstruction — not a spec-sheet number.</p>
        {!revealed.has("scale") ? (
          <p className="text-xs text-slate-500 italic">Run the audit to reveal.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-px rounded-lg overflow-hidden" style={{ background: "var(--border)" }}>
              <div className="px-4 py-3 text-center" style={{ background: "var(--bg-dark)" }}>
                <div className="text-xl font-bold text-white">{METRIC_SCALE_RESULT.referenceValueFt} ft</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">Real measurement</div>
              </div>
              <div className="px-4 py-3 text-center" style={{ background: "var(--bg-dark)" }}>
                <div className="text-xl font-bold text-white">{METRIC_SCALE_RESULT.reconstructedValueFt} ft</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">Reconstructed</div>
              </div>
              <div className="px-4 py-3 text-center" style={{ background: "var(--bg-dark)" }}>
                <div className="text-xl font-bold" style={{ color: "var(--error-light)" }}>+{METRIC_SCALE_RESULT.errorPct}%</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">Error ({METRIC_SCALE_RESULT.errorDirection})</div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              <span className="text-slate-200 font-medium">Reference: </span>
              {METRIC_SCALE_RESULT.referenceLabel}. {METRIC_SCALE_RESULT.referenceMethod}
            </p>
            <p className="text-xs text-slate-400">
              <span className="text-slate-200 font-medium">Method: </span>
              {METRIC_SCALE_RESULT.reconstructedMethod}
            </p>
            <div className="rounded-lg p-3 text-xs" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
              <p className="text-slate-300">{METRIC_SCALE_RESULT.caveat}</p>
            </div>
          </div>
        )}
      </div>

      {/* Scorecard */}
      {allRevealed && (
        <div className="rounded-2xl p-5 mb-6 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>
            {verifiedCount} / {TOS_CHECKLIST.length} claims held up unmodified
          </p>
          <p className="text-xs text-slate-400">Commercial rights: real, with limits. Provenance: clean. Dimensional accuracy: real, and off by 19%.</p>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={reset}
          className="text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          style={{ border: "1px solid var(--border)" }}
        >
          Reset demo
        </button>
      </div>

      <p className="text-xs text-slate-500">{METHODOLOGY_NOTE}</p>
    </DemoShell>
  );
}
