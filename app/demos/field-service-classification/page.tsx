"use client";

import { Fragment, useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  cloneSeed,
  evaluateScope,
  evaluateWarrantyLock,
  evaluateClassification,
  validateErpCoverage,
  validateErpSplit,
  erpCheck,
  estimateModelCost,
  BOUNDARY_WINDOW_DAYS,
  type LedgerEntry,
  type PolicyCheck,
  type ServiceCall,
} from "./lib/policy";

// ── Canned scenarios — a field-service billable-classification queue ───────
// Each targets a dedicated seed call so scenarios stay independent of click
// order — see policy.ts's seed comment. Illustrative composite scenario,
// not a real client engagement — see
// ~/SecondBrain/TiogaAI/sales/case-study-semiconductor-capital-equipment-sap-oracle-governance.md
// (pattern 5).

interface Scenario {
  id: string;
  label: string;
  note: string;
  run: () => void;
}

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

const callStatusStyle: Record<ServiceCall["status"], { color: string; background: string }> = {
  open: { color: "var(--accent)", background: "#EC6D3D15" },
  classified_no_charge: { color: "var(--success)", background: "#4ADE8015" },
  classified_billable: { color: "var(--warning-light)", background: "#F59E0B15" },
  split: { color: "var(--violet)", background: "#8B5CF615" },
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

function estValue(call: ServiceCall) {
  return call.partsCost + call.laborHours * call.laborRate;
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function FieldServiceClassificationPage() {
  const seed = () => cloneSeed();
  const [{ calls, contracts }, setState] = useState(seed());
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [spentUsd, setSpentUsd] = useState(0);
  const [approverName, setApproverName] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [freeformCallId, setFreeformCallId] = useState("SVC-3301");
  const [freeformAction, setFreeformAction] = useState<"classify_no_charge" | "classify_billable">("classify_no_charge");

  const pendingApprovals = ledger.filter((e) => e.decision === "pending_approval");

  function newActionId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function baseEntry(callId: string, actionType: string, detail: string, actor: string): LedgerEntry {
    return {
      actionId: newActionId(),
      timestamp: new Date().toISOString(),
      callId,
      actionType,
      detail,
      actor,
      modelCostUsd: estimateModelCost(actionType),
      policyChecks: [],
      decision: "pending",
    };
  }

  async function settle(entry: LedgerEntry) {
    await new Promise((r) => setTimeout(r, 250));
    setLedger((prev) => [entry, ...prev]);
    setBusy(null);
    setExpanded(entry.actionId);
  }

  // Executes a classification that already cleared scope, warranty-lock,
  // and either passed the classification check as auto or was just human-
  // approved — re-validated through the ERP's own coverage record
  // independent of the policy layer's decision, same shape as the other
  // two demos' independent ERP-layer check.
  async function executeClassification(entry: LedgerEntry, call: ServiceCall, actionType: string) {
    await new Promise((r) => setTimeout(r, 350));
    const result =
      actionType === "split_classification"
        ? validateErpSplit()
        : validateErpCoverage(call, actionType === "classify_no_charge" ? "no_charge" : "billable");
    const latency = 180 + Math.round(Math.random() * 220);
    const check = erpCheck(result, latency);
    const newStatus: ServiceCall["status"] =
      actionType === "classify_no_charge" ? "classified_no_charge" : actionType === "classify_billable" ? "classified_billable" : "split";
    const updated: LedgerEntry = {
      ...entry,
      policyChecks: [...entry.policyChecks, check],
      erpResult: result,
      decision: result.accepted ? "executed" : "blocked",
      blockedReason: result.accepted ? undefined : "erp_validation_failed",
    };
    if (result.accepted) {
      setState((prev) => ({ ...prev, calls: { ...prev.calls, [call.id]: { ...prev.calls[call.id], status: newStatus } } }));
    }
    setLedger((prev) => [updated, ...prev]);
    setBusy(null);
    setExpanded(updated.actionId);
  }

  // classify_no_charge / classify_billable / split_classification —
  // the authorized classification actions. waive_billable_charge is
  // deliberately NOT among them; proposing it always fails scope below.
  async function proposeClassification(callId: string, actionType: string, actor = "agent") {
    const call = calls[callId];
    if (!call) return;
    setBusy(`classify-${callId}`);
    let entry = baseEntry(
      callId,
      actionType,
      `Propose '${actionType}' for ${callId} (${call.serviceTypeLabel})`,
      actor
    );

    const scopeCheck = evaluateScope(actionType);
    entry = { ...entry, policyChecks: [...entry.policyChecks, scopeCheck] };
    setSpentUsd((s) => s + entry.modelCostUsd);

    if (scopeCheck.result === "fail") {
      entry = { ...entry, decision: "blocked", blockedReason: "scope_violation" };
      await settle(entry);
      return;
    }

    const warrantyCheck = evaluateWarrantyLock(call, actionType);
    entry = { ...entry, policyChecks: [...entry.policyChecks, warrantyCheck] };

    if (warrantyCheck.result === "fail") {
      entry = { ...entry, decision: "blocked", blockedReason: "warranty_claim_lock" };
      await settle(entry);
      return;
    }

    const contract = contracts[call.contractId];
    const classCheck = evaluateClassification(call, contract, actionType);
    entry = { ...entry, policyChecks: [...entry.policyChecks, classCheck] };

    if (classCheck.route === "human_approval") {
      entry = { ...entry, decision: "pending_approval" };
      await settle(entry);
      return;
    }

    await executeClassification(entry, call, actionType);
  }

  async function approve(actionId: string) {
    const entry = ledger.find((e) => e.actionId === actionId);
    if (!entry) return;
    setBusy(`approve-${actionId}`);
    const approver = approverName.trim() || "Service Contract Manager";
    await new Promise((r) => setTimeout(r, 300));
    const approvedCheck: PolicyCheck = {
      name: "human_approval",
      result: "pass",
      detail: `approved by ${approver}`,
      controlTag: "NIST AI RMF MANAGE-1.3 — risk response & escalation",
      layer: "human",
      t: new Date().toISOString(),
    };
    const updatedBase: LedgerEntry = { ...entry, policyChecks: [...entry.policyChecks, approvedCheck], actor: `${entry.actor} + ${approver}` };
    const call = calls[entry.callId];
    setLedger((prev) => prev.filter((e) => e.actionId !== actionId));
    if (call) {
      await executeClassification(updatedBase, call, entry.actionType);
    }
  }

  async function deny(actionId: string) {
    const entry = ledger.find((e) => e.actionId === actionId);
    if (!entry) return;
    setBusy(`deny-${actionId}`);
    const approver = approverName.trim() || "Service Contract Manager";
    await new Promise((r) => setTimeout(r, 250));
    const updated: LedgerEntry = {
      ...entry,
      policyChecks: [
        ...entry.policyChecks,
        { name: "human_approval", result: "fail", detail: `denied by ${approver}`, controlTag: "NIST AI RMF MANAGE-1.3 — risk response & escalation", layer: "human", t: new Date().toISOString() },
      ],
      decision: "blocked",
      blockedReason: "human_denied",
    };
    setLedger((prev) => prev.map((e) => (e.actionId === actionId ? updated : e)));
    setBusy(null);
    setExpanded(actionId);
  }

  function reset() {
    setState(seed());
    setLedger([]);
    setSpentUsd(0);
    setExpanded(null);
    setBusy(null);
  }

  const SCENARIOS: Scenario[] = [
    {
      id: "no-charge-auto",
      label: "1 — Classify no-charge (auto)",
      note: "SVC-3301's scheduled PM tune-up is explicitly covered by an active Full Coverage contract — a clear-cut, recurring pattern, auto-executes.",
      run: () => proposeClassification("SVC-3301", "classify_no_charge"),
    },
    {
      id: "billable-auto",
      label: "2 — Classify billable (auto)",
      note: "SVC-3302's contamination cleanup is customer-caused and explicitly outside the contract's covered scope — unambiguous, auto-executes as billable T&M.",
      run: () => proposeClassification("SVC-3302", "classify_billable"),
    },
    {
      id: "ambiguous-escalate",
      label: "3 — Escalated → approved (ambiguous contract language)",
      note: "SVC-3303's chamber-liner failure at month 14 of a 36-month agreement — the contract doesn't clearly say whether this is 'normal wear' or a 'covered failure', routed to a named service manager.",
      run: () => proposeClassification("SVC-3303", "classify_no_charge"),
    },
    {
      id: "timing-escalate",
      label: "4 — Escalated → approved (contract timing edge case)",
      note: `SVC-3304's repair happened within ${BOUNDARY_WINDOW_DAYS} days of the contract's renewal — which term actually governs the call is a timing edge case, not a mechanical read.`,
      run: () => proposeClassification("SVC-3304", "classify_billable"),
    },
    {
      id: "split-escalate",
      label: "5 — Escalated → approved (mixed visit needs a split)",
      note: "SVC-3305's visit touched a covered vacuum-pump replacement and a separate, uncovered throughput upgrade — needs an apportioned split, never a single classification.",
      run: () => proposeClassification("SVC-3305", "split_classification"),
    },
    {
      id: "warranty-blocked",
      label: "6 — Blocked (never: active warranty claim)",
      note: "SVC-3306 already has an open manufacturer warranty claim logged — billing it directly bypasses warranty-claim resolution entirely, a hard block regardless of the amount.",
      run: () => proposeClassification("SVC-3306", "classify_billable"),
    },
    {
      id: "waive-blocked",
      label: "7 — Blocked (never: scope — unauthorized waiver)",
      note: "Someone asks the agent to waive SVC-3307's billable charge as a goodwill gesture — 'waive_billable_charge' isn't an action type this agent is authorized to take at all.",
      run: () => proposeClassification("SVC-3307", "waive_billable_charge"),
    },
    {
      id: "erp-blocked",
      label: "8 — Blocked (ERP: contradicts real SAP coverage record)",
      note: "SVC-3308's service type is generically covered per CT-508's category list — policy approves it — but SAP's authoritative record shows the contract is on a billing hold the category list doesn't reflect.",
      run: () => proposeClassification("SVC-3308", "classify_no_charge"),
    },
  ];

  const budgetCap = 50;

  return (
    <DemoShell
      title="Governed Field Service Billable Classification"
      badge="Live Interactive Demo — Governed Write-Path"
      description="A real SAP Plant Maintenance/Customer Service pattern: when a field-service call closes, is it settled at no charge against an existing service contract, or converted to a billable time-and-materials invoice? A genuinely different governance shape from a dollar threshold — the risk here is interpretation, not amount. Watch a deterministic policy decide whether a classification executes alone, escalates to a named service manager, or gets blocked outright — with an ERP-layer check that catches what the policy alone can't. Illustrative composite scenario grounded in real SAP field-service mechanics, not a real client engagement."
    >
      {/* Stats */}
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

      {/* Service call queue snapshot */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-white mb-1">Service call queue</h2>
        <p className="text-xs text-slate-400 mb-4">The seed calls each canned scenario targets — watch this update as scenarios execute.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Call", "Customer", "Service type", "Contract", "Status", "Est. value"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-slate-400 uppercase tracking-wide font-medium px-3 py-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(calls)
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((c) => {
                  const s = callStatusStyle[c.status];
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-3 py-2 text-white whitespace-nowrap">{c.id}</td>
                      <td className="px-3 py-2 text-slate-300 whitespace-nowrap">{c.customer}</td>
                      <td className="px-3 py-2 text-slate-300 whitespace-nowrap">{c.serviceTypeLabel}</td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-400 whitespace-nowrap">{c.contractId}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ color: s.color, background: s.background }}>
                          {c.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-300 whitespace-nowrap">{fmtUsd(estValue(c))}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Propose panel */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-white mb-1">Propose a classification</h2>
        <p className="text-xs text-slate-400 mb-4">Click a scenario, or classify any open call yourself.</p>
        <div className="flex flex-col gap-2 mb-5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              disabled={busy !== null}
              onClick={s.run}
              className="text-left px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-medium text-white">{s.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.note}</p>
            </button>
          ))}
        </div>

        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs text-slate-400 mb-3">Or classify an open call yourself — pick one and a classification:</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={freeformCallId}
              onChange={(e) => setFreeformCallId(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm text-white"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
            >
              {Object.values(calls)
                .filter((c) => c.status === "open")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.customer} ({c.serviceTypeLabel})
                  </option>
                ))}
            </select>
            <select
              value={freeformAction}
              onChange={(e) => setFreeformAction(e.target.value as "classify_no_charge" | "classify_billable")}
              className="px-3 py-2.5 rounded-lg text-sm text-white"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
            >
              <option value="classify_no_charge">No-charge (contract-covered)</option>
              <option value="classify_billable">Billable (T&amp;M)</option>
            </select>
            <button
              disabled={busy !== null || !calls[freeformCallId] || calls[freeformCallId]?.status !== "open"}
              onClick={() => proposeClassification(freeformCallId, freeformAction)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
            >
              Classify
            </button>
          </div>
        </div>
      </div>

      {/* Pending approvals panel */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--warning-light)" }}>
          <h2 className="font-semibold text-white mb-1">Pending human approvals</h2>
          <p className="text-xs text-slate-400 mb-4">
            Approver name (optional — defaults to &quot;Service Contract Manager&quot;):
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
                  <p className="text-sm text-white font-medium">{e.callId} — {e.actionType}</p>
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
          <p className="text-sm text-slate-400 px-5 pb-6">No classifications proposed yet — try a scenario above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 640 }}>
              <thead>
                <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  {["Time", "Call", "Action", "Decision", ""].map((h) => (
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
                      <td className="px-4 py-2.5 text-white whitespace-nowrap">{e.callId}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-300 whitespace-nowrap">{e.actionType}</td>
                      <td className="px-4 py-2.5"><Badge decision={e.decision} /></td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => setExpanded(expanded === e.actionId ? null : e.actionId)}
                          className="text-xs"
                          style={{ color: "var(--accent)" }}
                        >
                          {expanded === e.actionId ? "Hide trail" : "Decision trail"}
                        </button>
                      </td>
                    </tr>
                    {expanded === e.actionId && (
                      <tr style={{ borderBottom: i === ledger.length - 1 ? "none" : "1px solid var(--border)" }}>
                        <td colSpan={5} className="px-4 pb-4">
                          <div className="rounded-lg p-3 flex flex-col gap-2" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
                            <div className="text-xs pb-2 mb-1" style={{ borderBottom: "1px solid var(--border)" }}>
                              <span className="text-slate-500">action: </span>
                              <span className="text-slate-300">{e.detail}</span>
                            </div>
                            {e.policyChecks.map((c, ci) => (
                              <div key={ci} className="flex items-start gap-3 text-xs">
                                <span className="font-mono flex-none w-32" style={{ color: checkResultStyle[c.result] }}>{c.name}</span>
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
        Policy: classifying a call as no-charge or billable auto-executes when the covering contract is active, unambiguous,
        and the proposed classification matches its coverage list. It escalates to a named service manager when the
        contract&apos;s language doesn&apos;t clearly resolve the call, when the service date falls within{" "}
        {BOUNDARY_WINDOW_DAYS} days of a contract boundary, or when the visit touched both covered and uncovered work and
        needs an apportioned split. Billing a call that already carries an active warranty claim is never allowed, regardless
        of amount — and waiving a billable charge isn&apos;t an authorized action type at all, since it creates financial
        exposure with no contract basis. The ERP re-validates every classification independently of the policy layer,
        catching a coverage record that contradicts the contract&apos;s category-level terms even when policy approved the
        request. Everything on this page runs in your browser; nothing is sent to a server. Illustrative composite scenario
        grounded in real SAP Plant Maintenance/Customer Service field-service mechanics — not a real client engagement.
      </p>
    </DemoShell>
  );
}
