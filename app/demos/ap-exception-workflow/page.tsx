"use client";

import { Fragment, useState } from "react";
import DemoShell from "../_lib/demo-shell";
import ValueLedgerPanel from "./ValueLedgerPanel";
import {
  cloneSeed,
  evaluateScope,
  evaluateSpend,
  validateErpChange,
  erpCheck,
  rollbackChange,
  rollbackCheck,
  estimateModelCost,
  AUTO_APPROVE_CEILING,
  HUMAN_APPROVAL_CEILING,
  type LedgerEntry,
  type PolicyCheck,
  type PurchaseOrder,
  type Vendor,
} from "./lib/policy";

// ── Canned scenarios — an AP three-way-match exception queue ────────────────

const SCENARIOS: { id: string; label: string; poId: string; amount: number; actionType: string; note: string }[] = [
  {
    id: "auto",
    label: "1 — Auto-approved",
    poId: "PO-4488",
    amount: 1200,
    actionType: "po_adjustment",
    note: "Invoice INV-2201 (Cascade Logistics) is $1,200 over PO-4488's committed total — a routine three-way-match variance.",
  },
  {
    id: "escalate",
    label: "2 — Escalated → approved",
    poId: "PO-4471",
    amount: 8000,
    actionType: "po_adjustment",
    note: "Invoice INV-2214 (Meridian Steel Supply) is $8,000 over PO-4471 — exceeds the autonomous ceiling, routed to a human.",
  },
  {
    id: "blocked-spend",
    label: "3 — Blocked (spend cap)",
    poId: "PO-4502",
    amount: 40000,
    actionType: "po_adjustment",
    note: "Invoice INV-2229 requests a $40,000 adjustment on PO-4502 — over the single-approver ceiling entirely.",
  },
  {
    id: "blocked-scope",
    label: "4 — Blocked (scope)",
    poId: "PO-4471",
    amount: 2000,
    actionType: "vendor_hold_release",
    note: "Someone tries to have the agent release a vendor's credit hold directly — not an action type this agent is authorized to take.",
  },
  {
    id: "blocked-erp",
    label: "5 — Blocked (vendor on hold)",
    poId: "PO-4502",
    amount: 1500,
    actionType: "po_adjustment",
    note: "Invoice INV-2233 for PO-4502 — policy would allow it, but its vendor (Northline Fabrication) is on credit hold and the ERP's own validation catches it.",
  },
];

// ── Presentation helpers ─────────────────────────────────────────────────────

const decisionStyle: Record<LedgerEntry["decision"], { color: string; label: string }> = {
  pending: { color: "var(--text-muted)", label: "pending" },
  pending_approval: { color: "var(--warning-light)", label: "escalated" },
  executed: { color: "var(--success)", label: "executed" },
  blocked: { color: "var(--error-light)", label: "blocked" },
  rolled_back: { color: "var(--violet)", label: "rolled back" },
};

const checkResultStyle: Record<PolicyCheck["result"], string> = {
  pass: "var(--success)",
  fail: "var(--error-light)",
  escalate: "var(--warning-light)",
  pending: "var(--text-muted)",
};

function Badge({ decision }: { decision: LedgerEntry["decision"] }) {
  const s = decisionStyle[decision];
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap"
      style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 15%, transparent)`, border: `1px solid color-mix(in srgb, ${s.color} 40%, transparent)` }}
    >
      {s.label}
    </span>
  );
}

function fmtUsd(n: number) {
  return `$${n.toLocaleString()}`;
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function ApExceptionWorkflowPage() {
  const seed = () => cloneSeed();
  const [{ vendors, pos }, setState] = useState(seed());
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [spentUsd, setSpentUsd] = useState(0);
  const [approverName, setApproverName] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [freeformPoId, setFreeformPoId] = useState("PO-4488");
  const [freeformAmount, setFreeformAmount] = useState("");

  const pendingApprovals = ledger.filter((e) => e.decision === "pending_approval");
  // An executed action can only be reversed once — once a rollback entry
  // referencing it exists, the "Roll back" action disappears for good,
  // the same way a compliance ledger wouldn't let you reverse a reversal.
  const rolledBackIds = new Set(ledger.filter((e) => e.relatesTo).map((e) => e.relatesTo));

  function newActionId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function baseEntry(poId: string, actionType: string, amount: number, actor: string): LedgerEntry {
    return {
      actionId: newActionId(),
      timestamp: new Date().toISOString(),
      poId,
      actionType,
      amount,
      actor,
      modelCostUsd: estimateModelCost(actionType, amount),
      policyChecks: [],
      decision: "pending",
    };
  }

  function executeAgainstErp(entry: LedgerEntry, posSnapshot: Record<string, PurchaseOrder>, vendorsSnapshot: Record<string, Vendor>): LedgerEntry {
    const po = posSnapshot[entry.poId];
    const vendor = po ? vendorsSnapshot[po.vendorId] : undefined;
    const result = validateErpChange(po, vendor, entry.amount);
    const latency = 180 + Math.round(Math.random() * 220);
    const check = erpCheck(result, latency);
    const updated: LedgerEntry = {
      ...entry,
      policyChecks: [...entry.policyChecks, check],
      erpResult: result,
      decision: result.accepted ? "executed" : "blocked",
      blockedReason: result.accepted ? undefined : "erp_validation_failed",
    };
    if (result.accepted && result.newCommitted !== undefined) {
      setState((prev) => ({
        vendors: prev.vendors,
        pos: { ...prev.pos, [entry.poId]: { ...prev.pos[entry.poId], committed: result.newCommitted! } },
      }));
    }
    return updated;
  }

  async function propose(poId: string, actionType: string, amount: number, actor = "agent") {
    setBusy(`propose-${poId}-${amount}`);
    let entry = baseEntry(poId, actionType, amount, actor);

    const scopeCheck = evaluateScope(actionType);
    entry = { ...entry, policyChecks: [...entry.policyChecks, scopeCheck] };
    setSpentUsd((s) => s + entry.modelCostUsd);

    if (scopeCheck.result === "fail") {
      entry = { ...entry, decision: "blocked", blockedReason: "scope_violation" };
      await settle(entry);
      return;
    }

    const spendCheck = evaluateSpend(entry.amount);
    entry = { ...entry, policyChecks: [...entry.policyChecks, spendCheck] };

    if (spendCheck.route === "blocked") {
      entry = { ...entry, decision: "blocked", blockedReason: "spend_ceiling_exceeded" };
      await settle(entry);
      return;
    }

    if (spendCheck.route === "human_approval") {
      entry = { ...entry, decision: "pending_approval" };
      await settle(entry);
      return;
    }

    // route === "auto"
    await new Promise((r) => setTimeout(r, 350));
    entry = executeAgainstErp(entry, pos, vendors);
    await settle(entry);
  }

  async function settle(entry: LedgerEntry) {
    await new Promise((r) => setTimeout(r, 250));
    setLedger((prev) => [entry, ...prev]);
    setBusy(null);
    setExpanded(entry.actionId);
  }

  async function approve(actionId: string) {
    const entry = ledger.find((e) => e.actionId === actionId);
    if (!entry) return;
    setBusy(`approve-${actionId}`);
    const approver = approverName.trim() || "Compliance Reviewer";
    await new Promise((r) => setTimeout(r, 300));
    let updated: LedgerEntry = {
      ...entry,
      policyChecks: [
        ...entry.policyChecks,
        { name: "human_approval", result: "pass" as const, detail: `approved by ${approver}`, controlTag: "NIST AI RMF MANAGE-1.3 — risk response & escalation", layer: "human" as const, t: new Date().toISOString() },
      ],
      actor: `${entry.actor} + ${approver}`,
    };
    updated = executeAgainstErp(updated, pos, vendors);
    setLedger((prev) => prev.map((e) => (e.actionId === actionId ? updated : e)));
    setBusy(null);
    setExpanded(actionId);
  }

  async function deny(actionId: string) {
    const entry = ledger.find((e) => e.actionId === actionId);
    if (!entry) return;
    setBusy(`deny-${actionId}`);
    const approver = approverName.trim() || "Compliance Reviewer";
    await new Promise((r) => setTimeout(r, 250));
    const updated: LedgerEntry = {
      ...entry,
      policyChecks: [
        ...entry.policyChecks,
        { name: "human_approval", result: "fail" as const, detail: `denied by ${approver}`, controlTag: "NIST AI RMF MANAGE-1.3 — risk response & escalation", layer: "human" as const, t: new Date().toISOString() },
      ],
      decision: "blocked",
      blockedReason: "human_denied",
    };
    setLedger((prev) => prev.map((e) => (e.actionId === actionId ? updated : e)));
    setBusy(null);
    setExpanded(actionId);
  }

  async function rollback(actionId: string) {
    const entry = ledger.find((e) => e.actionId === actionId);
    if (!entry || entry.decision !== "executed") return;
    if (ledger.some((e) => e.relatesTo === actionId)) return; // already reversed once
    setBusy(`rollback-${actionId}`);
    await new Promise((r) => setTimeout(r, 300));
    const po = pos[entry.poId];
    const result = rollbackChange(po, entry.amount);
    const latency = 150 + Math.round(Math.random() * 150);
    const check = rollbackCheck(result, latency);
    if (result.accepted && result.newCommitted !== undefined) {
      setState((prev) => ({
        vendors: prev.vendors,
        pos: { ...prev.pos, [entry.poId]: { ...prev.pos[entry.poId], committed: result.newCommitted! } },
      }));
    }
    const rollbackEntry: LedgerEntry = {
      actionId: newActionId(),
      timestamp: new Date().toISOString(),
      poId: entry.poId,
      actionType: entry.actionType,
      amount: entry.amount,
      actor: "compliance",
      modelCostUsd: estimateModelCost(entry.actionType, entry.amount),
      policyChecks: [check],
      decision: result.accepted ? "rolled_back" : "blocked",
      relatesTo: entry.actionId,
    };
    setSpentUsd((s) => s + rollbackEntry.modelCostUsd);
    setLedger((prev) => [rollbackEntry, ...prev]);
    setBusy(null);
    setExpanded(rollbackEntry.actionId);
  }

  function reset() {
    setState(seed());
    setLedger([]);
    setSpentUsd(0);
    setExpanded(null);
    setBusy(null);
  }

  const budgetCap = 50;

  return (
    <DemoShell
      title="Governed AP Exception Workflow"
      badge="Live Interactive Demo — Governed Write-Path"
      description="Every invoice here fails its three-way match against a purchase order. Watch an agent propose a fix, a deterministic policy decide whether it executes alone, escalates to a human, or gets blocked outright — and every decision, including reversals, land in an audit-grade ledger. No chatbot in the decision loop; the policy is under 60 lines and reads like a checklist."
    >
      {/* Budget gauge */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1.5">Model spend</p>
          <p className="text-xl font-bold text-white font-mono">{fmtUsd(Number(spentUsd.toFixed(4)))}</p>
          <p className="text-xs text-slate-400 mt-1">of ${budgetCap} cap</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1.5">Ledger entries</p>
          <p className="text-xl font-bold text-white font-mono">{ledger.length}</p>
          <p className="text-xs text-slate-400 mt-1">every decision, not just successes</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1.5">Pending approvals</p>
          <p className="text-xl font-bold text-white font-mono">{pendingApprovals.length}</p>
          <p className="text-xs text-slate-400 mt-1">escalated, awaiting a human</p>
        </div>
      </div>

      {/* Value ledger — live hours/$ rollup of this session's actions */}
      <ValueLedgerPanel ledger={ledger} />

      {/* Propose panel */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-white mb-1">Propose an exception resolution</h2>
        <p className="text-xs text-slate-400 mb-4">Click a scenario, or fill in the form and pick your own number.</p>
        <div className="flex flex-col gap-2 mb-5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              disabled={busy !== null}
              onClick={() => propose(s.poId, s.actionType, s.amount)}
              className="text-left px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-medium text-white">{s.label} <span className="text-slate-400 font-normal">— {s.poId}, {fmtUsd(s.amount)}</span></p>
              <p className="text-xs text-slate-400 mt-0.5">{s.note}</p>
            </button>
          ))}
        </div>

        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs text-slate-400 mb-3">Or propose your own — pick a PO and an amount:</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={freeformPoId}
              onChange={(e) => setFreeformPoId(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm text-white"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
            >
              {Object.values(pos).map((po) => (
                <option key={po.id} value={po.id}>
                  {po.id} — {vendors[po.vendorId].name} ({fmtUsd(po.committed)} / {fmtUsd(po.ceiling)})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount, e.g. 6000"
              value={freeformAmount}
              onChange={(e) => setFreeformAmount(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm text-white flex-1"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
            />
            <button
              disabled={busy !== null || !freeformAmount || Number(freeformAmount) <= 0}
              onClick={() => propose(freeformPoId, "po_adjustment", Number(freeformAmount))}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
            >
              Propose
            </button>
          </div>
        </div>
      </div>

      {/* Pending approvals panel */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--warning-light)" }}>
          <h2 className="font-semibold text-white mb-1">Pending human approvals</h2>
          <p className="text-xs text-slate-400 mb-4">
            Approver name (optional — defaults to "Compliance Reviewer"):
          </p>
          <input
            type="text"
            placeholder="Your name"
            value={approverName}
            onChange={(e) => setApproverName(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm text-white mb-4 w-full sm:w-64"
            style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
          />
          <div className="flex flex-col gap-3">
            {pendingApprovals.map((e) => (
              <div key={e.actionId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
                <div>
                  <p className="text-sm text-white font-medium">{e.poId} — {fmtUsd(e.amount)}</p>
                  <p className="text-xs text-slate-400">{e.policyChecks[e.policyChecks.length - 1]?.detail}</p>
                </div>
                <div className="flex gap-2 flex-none">
                  <button
                    disabled={busy !== null}
                    onClick={() => approve(e.actionId)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--success-dark)" }}
                  >
                    Approve
                  </button>
                  <button
                    disabled={busy !== null}
                    onClick={() => deny(e.actionId)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--error)" }}
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ledger */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Audit ledger</h2>
            <p className="text-xs text-slate-400 mt-1">Blocked and escalated actions are logged with the same fidelity as executed ones.</p>
          </div>
          <button
            onClick={reset}
            className="text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors flex-none"
            style={{ border: "1px solid var(--border)" }}
          >
            Reset demo
          </button>
        </div>

        {ledger.length === 0 ? (
          <p className="text-sm text-slate-400 px-5 pb-6">No actions proposed yet — try a scenario above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 640 }}>
              <thead>
                <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  {["Time", "PO", "Amount", "Decision", ""].map((h) => (
                    <th key={h} className="text-left text-[11px] text-slate-400 uppercase tracking-wide font-medium px-4 py-2.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ledger.map((e, i) => (
                  <Fragment key={e.actionId}>
                    <tr style={{ borderBottom: expanded === e.actionId ? "none" : i === ledger.length - 1 ? "none" : "1px solid var(--border)" }}>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-400 whitespace-nowrap">{new Date(e.timestamp).toLocaleTimeString()}</td>
                      <td className="px-4 py-2.5 text-white whitespace-nowrap">{e.poId}{e.relatesTo && <span className="text-slate-400 text-xs"> (reversal)</span>}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-300 whitespace-nowrap">{fmtUsd(e.amount)}</td>
                      <td className="px-4 py-2.5"><Badge decision={e.decision} /></td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => setExpanded(expanded === e.actionId ? null : e.actionId)}
                          className="text-xs mr-3"
                          style={{ color: "var(--accent)" }}
                        >
                          {expanded === e.actionId ? "Hide trail" : "Decision trail"}
                        </button>
                        {e.decision === "executed" && !rolledBackIds.has(e.actionId) && (
                          <button
                            disabled={busy !== null}
                            onClick={() => rollback(e.actionId)}
                            className="text-xs disabled:opacity-50"
                            style={{ color: "var(--violet)" }}
                          >
                            Roll back
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded === e.actionId && (
                      <tr style={{ borderBottom: i === ledger.length - 1 ? "none" : "1px solid var(--border)" }}>
                        <td colSpan={5} className="px-4 pb-4">
                          <div className="rounded-lg p-3 flex flex-col gap-2" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
                            {e.policyChecks.map((c, ci) => (
                              <div key={ci} className="flex items-start gap-3 text-xs">
                                <span className="font-mono flex-none w-24" style={{ color: checkResultStyle[c.result] }}>{c.name}</span>
                                <span className="flex-1 text-slate-400">{c.detail}</span>
                                <span className="flex-none text-slate-500 hidden sm:inline">{c.controlTag}</span>
                              </div>
                            ))}
                            {e.actor && <p className="text-[11px] text-slate-500 mt-1">actor: {e.actor}</p>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Policy: actions under {fmtUsd(AUTO_APPROVE_CEILING)} execute autonomously; up to {fmtUsd(HUMAN_APPROVAL_CEILING)} require human approval; above that, blocked entirely — no override exists at this layer, on purpose. Everything on this page runs in your browser; nothing is sent to a server.
      </p>
    </DemoShell>
  );
}
