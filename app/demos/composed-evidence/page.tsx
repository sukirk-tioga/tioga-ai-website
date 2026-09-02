"use client";

import { useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  buildAssistantLog,
  buildErpLog,
  buildComposedRecord,
  auditFromAssistantLog,
  auditFromErpLog,
  auditFromComposedRecord,
  AUDIT_QUESTION,
  SCENARIO,
  CONTROL_TAGS,
  type AssistantLogEntry,
  type ErpLogEntry,
  type ComposedRecord,
  type AuditCheckItem,
} from "./lib/scenario";

// ── Cross-vendor evidence composition demo. Structurally different from
// the other two write-path demos: there's no scope/spend policy deciding
// auto/escalate/block here. The whole point is that the SAME real audit
// question is unanswerable from either vendor's own log alone, and only
// answerable once Tioga's governance layer composes both halves. See
// lib/scenario.ts for the grounding and honesty notes. Illustrative
// composite scenario, not a real client engagement — see
// ~/SecondBrain/TiogaAI/sales/case-study-semiconductor-capital-equipment-sap-oracle-governance.md.

type PanelKey = "assistant" | "erp" | "composed";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-white font-mono break-words">{value}</p>
    </div>
  );
}

function AuditChecklist({ items }: { items: AuditCheckItem[] }) {
  return (
    <div className="rounded-lg p-3 mt-3 flex flex-col gap-2.5" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <span className="flex-none mt-0.5 font-bold" style={{ color: it.answerable ? "var(--success)" : "var(--error-light)" }}>
            {it.answerable ? "✓" : "✗"}
          </span>
          <div>
            <p className="text-slate-200 font-medium">{it.question}</p>
            <p className="text-slate-400 mt-0.5">{it.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function scoreOf(items: AuditCheckItem[] | null) {
  if (!items) return null;
  return items.filter((i) => i.answerable).length;
}

export default function ComposedEvidencePage() {
  const [assistantLog, setAssistantLog] = useState<AssistantLogEntry | null>(null);
  const [erpLog, setErpLog] = useState<ErpLogEntry | null>(null);
  const [composed, setComposed] = useState<ComposedRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState<Set<PanelKey>>(new Set());

  const assistantAudit = assistantLog ? auditFromAssistantLog(assistantLog) : null;
  const erpAudit = erpLog ? auditFromErpLog(erpLog) : null;
  const composedAudit = composed ? auditFromComposedRecord(composed) : null;

  async function play() {
    setBusy(true);
    setChecked(new Set());
    await new Promise((r) => setTimeout(r, 300));
    const a = buildAssistantLog();
    setAssistantLog(a);
    await new Promise((r) => setTimeout(r, 650));
    const e = buildErpLog();
    setErpLog(e);
    await new Promise((r) => setTimeout(r, 650));
    setComposed(buildComposedRecord(a, e));
    setBusy(false);
  }

  function reset() {
    setAssistantLog(null);
    setErpLog(null);
    setComposed(null);
    setChecked(new Set());
    setBusy(false);
  }

  function toggleCheck(panel: PanelKey) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(panel)) next.delete(panel);
      else next.add(panel);
      return next;
    });
  }

  const allRevealed = Boolean(assistantLog && erpLog && composed);

  return (
    <DemoShell
      title="Composed Evidence: Closing the Assistant/ERP Audit Gap"
      badge="Live Interactive Demo — Cross-Vendor Evidence Composition"
      description="A business action can span two systems: a universal AI assistant that takes the request, and an ERP vendor's own execution agent that carries it out. Each one logs only its own half. Send the request below, watch each vendor's log populate on its own, then try to answer a real audit question from each — and see what only a composed record can actually prove. Illustrative composite scenario, not a real client engagement."
    >
      {/* Scenario intro / chat bubble */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-white mb-1">The request</h2>
        <p className="text-xs text-slate-400 mb-4">
          {SCENARIO.humanIdentity.name}, a {SCENARIO.humanIdentity.role.toLowerCase()}, sends this to a universal AI assistant in an ordinary chat session.
        </p>
        <div
          className="rounded-xl px-4 py-3 mb-5 max-w-lg"
          style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
        >
          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Priya R. — chat-88231</p>
          <p className="text-sm text-slate-200">&ldquo;{SCENARIO.requestText}&rdquo;</p>
        </div>
        <button
          onClick={play}
          disabled={busy}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
        >
          {busy ? "Running…" : allRevealed ? "Replay the scenario" : "Send the request"}
        </button>
      </div>

      {/* Audit question banner */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--warning-light)" }}>
        <p className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: "var(--warning-light)" }}>
          The real audit question
        </p>
        <p className="text-sm text-white font-medium">&ldquo;{AUDIT_QUESTION}&rdquo;</p>
        <p className="text-xs text-slate-400 mt-2">
          Send the request above, then use each panel&apos;s &ldquo;Try answering from here alone&rdquo; button below to test it against that vendor&apos;s log — before looking at the composed record.
        </p>
      </div>

      {/* Three panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Panel 1 — assistant vendor's own log */}
        <div className="rounded-2xl p-5 flex flex-col" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="mb-3">
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded-full"
              style={{ color: "var(--accent)", background: "#EC6D3D15", border: "1px solid #EC6D3D40" }}
            >
              Panel 1
            </span>
          </div>
          <h3 className="font-semibold text-white mb-1">Assistant vendor&apos;s own log</h3>
          <p className="text-xs text-slate-400 mb-4">Conversation and intent only — no transaction detail, no proof it actually happened correctly in SAP.</p>

          {!assistantLog ? (
            <p className="text-xs text-slate-500 italic flex-1">Send the request to populate this panel.</p>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              <Field label="Session" value={assistantLog.sessionId} />
              <Field label="User (display name)" value={assistantLog.userDisplayName} />
              <Field label="Timestamp" value={new Date(assistantLog.timestamp).toLocaleTimeString()} />
              <Field label="Message" value={assistantLog.userMessage} />
              <Field label="Assistant's own summary" value={assistantLog.assistantSummary} />
            </div>
          )}

          {assistantLog && assistantAudit && (
            <>
              <button
                onClick={() => toggleCheck("assistant")}
                className="mt-4 text-xs font-semibold self-start"
                style={{ color: "var(--accent)" }}
              >
                {checked.has("assistant") ? "Hide" : "Try answering from here alone"}
              </button>
              {checked.has("assistant") && <AuditChecklist items={assistantAudit} />}
            </>
          )}
        </div>

        {/* Panel 2 — ERP's own log */}
        <div className="rounded-2xl p-5 flex flex-col" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="mb-3">
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded-full"
              style={{ color: "var(--violet)", background: "#8B5CF615", border: "1px solid #8B5CF640" }}
            >
              Panel 2
            </span>
          </div>
          <h3 className="font-semibold text-white mb-1">ERP&apos;s own log</h3>
          <p className="text-xs text-slate-400 mb-4">Transaction record only — no proof of who asked or why, no natural-language context.</p>

          {!erpLog ? (
            <p className="text-xs text-slate-500 italic flex-1">Populates once the ERP executes the write.</p>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              <Field label="Transaction" value={erpLog.transactionId} />
              <Field label="Document type" value={erpLog.documentType} />
              <Field label="Executed by" value={erpLog.executedBy} />
              <Field label="Timestamp" value={new Date(erpLog.timestamp).toLocaleTimeString()} />
              <Field label="Order" value={erpLog.orderId} />
              <Field label="Field changed" value={erpLog.field} />
              <Field label="Old value" value={erpLog.oldValue} />
              <Field label="New value" value={erpLog.newValue} />
            </div>
          )}

          {erpLog && erpAudit && (
            <>
              <button
                onClick={() => toggleCheck("erp")}
                className="mt-4 text-xs font-semibold self-start"
                style={{ color: "var(--violet)" }}
              >
                {checked.has("erp") ? "Hide" : "Try answering from here alone"}
              </button>
              {checked.has("erp") && <AuditChecklist items={erpAudit} />}
            </>
          )}
        </div>

        {/* Panel 3 — Tioga's composed record */}
        <div className="rounded-2xl p-5 flex flex-col" style={{ background: "var(--bg-card)", border: "1px solid var(--success)" }}>
          <div className="mb-3">
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded-full"
              style={{ color: "var(--success)", background: "#4ADE8015", border: "1px solid #4ADE8040" }}
            >
              Panel 3
            </span>
          </div>
          <h3 className="font-semibold text-white mb-1">Tioga&apos;s composed record</h3>
          <p className="text-xs text-slate-400 mb-4">Both halves stitched into one attributable, queryable record — who asked, what was asked, what policy tier, what the ERP actually did.</p>

          {!composed ? (
            <p className="text-xs text-slate-500 italic flex-1">Composes once both vendor logs exist.</p>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              <Field label="Action ID" value={composed.actionId} />
              <Field label="Authorized by" value={`${composed.humanIdentity.name} — ${composed.humanIdentity.role}`} />
              <Field label="Request" value={composed.requestText} />
              <Field label="Policy tier" value={composed.policy.tier} />
              <Field label="ERP transaction" value={`${composed.erp.transactionId} (${composed.erp.field}: ${composed.erp.oldValue} → ${composed.erp.newValue})`} />
              <Field label="Composed" value={new Date(composed.composedTimestamp).toLocaleTimeString()} />
              <p className="text-[10px] text-slate-500 mt-1">{CONTROL_TAGS.composedRecord}</p>
            </div>
          )}

          {composed && composedAudit && (
            <>
              <button
                onClick={() => toggleCheck("composed")}
                className="mt-4 text-xs font-semibold self-start"
                style={{ color: "var(--success)" }}
              >
                {checked.has("composed") ? "Hide" : "Try answering from the composed record"}
              </button>
              {checked.has("composed") && <AuditChecklist items={composedAudit} />}
            </>
          )}
        </div>
      </div>

      {/* Scorecard — only populates as each panel is checked */}
      {(checked.has("assistant") || checked.has("erp") || checked.has("composed")) && (
        <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden mb-6" style={{ background: "var(--border)" }}>
          <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
            <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>
              {checked.has("assistant") ? `${scoreOf(assistantAudit)} / 5` : "—"}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Panel 1 alone answerable</div>
          </div>
          <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
            <div className="text-2xl font-bold mb-1" style={{ color: "var(--violet)" }}>
              {checked.has("erp") ? `${scoreOf(erpAudit)} / 5` : "—"}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Panel 2 alone answerable</div>
          </div>
          <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
            <div className="text-2xl font-bold mb-1" style={{ color: "var(--success)" }}>
              {checked.has("composed") ? `${scoreOf(composedAudit)} / 5` : "—"}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Composed record answerable</div>
          </div>
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

      <p className="text-xs text-slate-500">
        Grounded in a real, vendor-acknowledged gap: SAP&apos;s own June 2026 reference architecture for third-party
        agent access states that enterprise identity and audit requirements for that access are &ldquo;not yet fully
        addressed,&rdquo; and assigns the mitigations to the customer. This demo dramatizes that gap with a single
        composite scenario: a universal AI assistant (Claude/ChatGPT-class) that logs conversation and intent, and an
        ERP vendor&apos;s own execution agent that logs the transaction under a shared integration account — neither
        composes the other's half into one attributable record on its own. Everything on this page runs in your
        browser; nothing is sent to a server. Illustrative composite scenario grounded in a real, documented gap —
        not a real client engagement.
      </p>
    </DemoShell>
  );
}
