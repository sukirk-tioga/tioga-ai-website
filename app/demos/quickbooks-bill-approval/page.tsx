"use client";

import { Fragment, useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  cloneSeed,
  evaluateScope,
  evaluateSpend,
  evaluateChangeControl,
  evaluateReconciliation,
  checkDuplicateBill,
  checkVendorStatus,
  validateVendorPaymentChange,
  vendorPaymentCheck,
  postPayment,
  paymentPostedCheck,
  estimateModelCost,
  AUTO_APPROVE_CEILING,
  HUMAN_APPROVAL_CEILING,
  MASTER_DATA_ACTION_TYPES,
  type LedgerEntry,
  type PolicyCheck,
  type Bill,
  type Vendor,
} from "./lib/policy";

// ── Canned scenarios — a QuickBooks bill-approval queue ──────────────────────

const SCENARIOS: { id: string; label: string; billId: string; amount: number; actionType: string; note: string; claimedOutcome?: string }[] = [
  {
    id: "auto",
    label: "1 — Auto-approved",
    billId: "B-101",
    amount: 450,
    actionType: "bill_approval",
    note: "Bill B-101 (Ridgeline Office Supplies) is $450, Net 30 — routine, well under the auto-approve ceiling.",
  },
  {
    id: "escalate",
    label: "2 — Escalated → approved",
    billId: "B-102",
    amount: 3200,
    actionType: "bill_approval",
    note: "Bill B-102 (Cascade Bookkeeping Services) is $3,200 — over the autonomous ceiling, routed to a human.",
  },
  {
    id: "blocked-spend",
    label: "3 — Blocked (spend cap)",
    billId: "B-103",
    amount: 18000,
    actionType: "bill_approval",
    note: "Bill B-103 (Ridgeline Office Supplies) is an unusually large one-off at $18,000 — over the single-approver ceiling entirely.",
  },
  {
    id: "blocked-scope",
    label: "4 — Blocked (scope)",
    billId: "B-104",
    amount: 0,
    actionType: "vendor_hold_release",
    note: "Someone tries to have the agent lift a vendor's hold status directly — not an action type this agent is authorized to take.",
  },
  {
    id: "blocked-vendor",
    label: "5 — Blocked (vendor on hold)",
    billId: "B-104",
    amount: 1500,
    actionType: "bill_approval",
    note: "Bill B-104 (Harbor Fleet Maintenance) is $1,500 — policy would allow the amount, but the vendor is on hold and the vendor-status check catches it regardless.",
  },
  {
    id: "clean-hands",
    label: "6 — Clean-hands: caught by change control, not spend",
    billId: "B-102",
    amount: 0,
    actionType: "vendor_payment_detail_change",
    note: "An email in Cascade Bookkeeping's incoming correspondence asks to update its payment routing details. Triage summarizes it as routine, and the agent proposes the change based on that summary. Scope allows it — payment-detail changes are an authorized action type. There's no dollar amount to cap. Change control is the only thing that catches it: no authorized-change record exists for this vendor.",
  },
  {
    id: "claimed-vs-actual",
    label: "7 — Claimed-vs-actual: caught by reconciliation, not suspicion",
    billId: "B-102",
    amount: 3200,
    actionType: "bill_approval",
    note: "The agent sends its own status update the moment it finishes drafting the approval on B-102 — before the gateway's routing decision is even back. The update says 'paid.' The real decision, a moment later, is escalation to a human. Nothing about this looks wrong yet — it stays wrong until someone runs reconciliation against the ledger's ground truth.",
    claimedOutcome: "B-102 / Cascade Bookkeeping bill paid — cleared, no further action needed.",
  },
  {
    id: "blocked-duplicate",
    label: "8 — Blocked (duplicate bill)",
    billId: "B-105",
    amount: 450,
    actionType: "bill_approval",
    note: "Bill B-105 (Ridgeline Office Supplies) matches B-101 exactly — same vendor, same $450, same date. Run scenario 1 first: this only reads as a duplicate once B-101 has already been paid in this session.",
  },
];

// ── Presentation helpers ─────────────────────────────────────────────────────

const decisionStyle: Record<LedgerEntry["decision"], { color: string; label: string }> = {
  pending: { color: "var(--text-muted)", label: "pending" },
  pending_approval: { color: "var(--warning-light)", label: "escalated" },
  executed: { color: "var(--success)", label: "executed" },
  blocked: { color: "var(--error-light)", label: "blocked" },
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

function fmtAmount(actionType: string, amount: number) {
  return MASTER_DATA_ACTION_TYPES.has(actionType) ? "Master data — no $ threshold" : fmtUsd(amount);
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function QuickbooksBillApprovalPage() {
  const seed = () => cloneSeed();
  const [{ vendors, bills }, setState] = useState(seed());
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [spentUsd, setSpentUsd] = useState(0);
  const [approverName, setApproverName] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [freeformBillId, setFreeformBillId] = useState("B-101");
  const [lastReconciliation, setLastReconciliation] = useState<{ checkedCount: number; divergentCount: number } | null>(null);

  const pendingApprovals = ledger.filter((e) => e.decision === "pending_approval");

  function newActionId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function baseEntry(billId: string, actionType: string, amount: number, actor: string, claimedOutcome?: string): LedgerEntry {
    return {
      actionId: newActionId(),
      timestamp: new Date().toISOString(),
      billId,
      actionType,
      amount,
      actor,
      modelCostUsd: estimateModelCost(actionType, amount),
      policyChecks: [],
      decision: "pending",
      claimedOutcome,
    };
  }

  // Duplicate-bill and vendor-status checks — the SMB equivalent of
  // 3-way-match, run as absolute preconditions independent of the spend-cap
  // ladder: a duplicate or a vendor on hold blocks the bill regardless of
  // amount, same role scope plays above it.
  function withPreExecutionChecks(
    entry: LedgerEntry,
    billId: string,
    billsSnapshot: Record<string, Bill>,
    vendorsSnapshot: Record<string, Vendor>
  ): { entry: LedgerEntry; blocked: boolean } {
    const bill = billsSnapshot[billId] ?? { id: billId, vendorId: "", amount: entry.amount, terms: "", date: "", status: "open" as const };
    const vendor = billsSnapshot[billId] ? vendorsSnapshot[bill.vendorId] : undefined;

    const duplicateCheck = checkDuplicateBill(bill, billsSnapshot);
    let updated: LedgerEntry = { ...entry, policyChecks: [...entry.policyChecks, duplicateCheck] };
    if (duplicateCheck.result === "fail") {
      return { entry: { ...updated, decision: "blocked", blockedReason: "duplicate_bill" }, blocked: true };
    }

    const vendorStatusCheck = checkVendorStatus(vendor);
    updated = { ...updated, policyChecks: [...updated.policyChecks, vendorStatusCheck] };
    if (vendorStatusCheck.result === "fail") {
      return { entry: { ...updated, decision: "blocked", blockedReason: "vendor_on_hold" }, blocked: true };
    }

    return { entry: updated, blocked: false };
  }

  function finalizePayment(entry: LedgerEntry, billId: string, billsSnapshot: Record<string, Bill>): LedgerEntry {
    const bill = billsSnapshot[billId];
    const result = postPayment(bill);
    const latency = 180 + Math.round(Math.random() * 220);
    const check = paymentPostedCheck(result, latency);
    const updated: LedgerEntry = {
      ...entry,
      policyChecks: [...entry.policyChecks, check],
      decision: result.accepted ? "executed" : "blocked",
      blockedReason: result.accepted ? undefined : "erp_validation_failed",
    };
    if (result.accepted) {
      setState((prev) => ({
        vendors: prev.vendors,
        bills: { ...prev.bills, [billId]: { ...prev.bills[billId], status: "paid" } },
      }));
    }
    return updated;
  }

  async function propose(billId: string, actionType: string, amount: number, actor = "agent", claimedOutcome?: string) {
    setBusy(`propose-${billId}-${amount}`);
    let entry = baseEntry(billId, actionType, amount, actor, claimedOutcome);

    const scopeCheck = evaluateScope(actionType);
    entry = { ...entry, policyChecks: [...entry.policyChecks, scopeCheck] };
    setSpentUsd((s) => s + entry.modelCostUsd);

    if (scopeCheck.result === "fail") {
      entry = { ...entry, decision: "blocked", blockedReason: "scope_violation" };
      await settle(entry);
      return;
    }

    if (MASTER_DATA_ACTION_TYPES.has(actionType)) {
      const bill = bills[billId];
      const vendorId = bill?.vendorId ?? "";
      const changeControlCheck = evaluateChangeControl(vendorId);
      entry = { ...entry, policyChecks: [...entry.policyChecks, changeControlCheck], decision: "pending_approval" };
      await settle(entry);
      return;
    }

    const pre = withPreExecutionChecks(entry, billId, bills, vendors);
    entry = pre.entry;
    if (pre.blocked) {
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
    entry = finalizePayment(entry, billId, bills);
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
    if (MASTER_DATA_ACTION_TYPES.has(entry.actionType)) {
      const bill = bills[entry.billId];
      const vendor = bill ? vendors[bill.vendorId] : undefined;
      const result = validateVendorPaymentChange(vendor);
      const latency = 160 + Math.round(Math.random() * 200);
      const check = vendorPaymentCheck(result, latency);
      updated = {
        ...updated,
        policyChecks: [...updated.policyChecks, check],
        decision: result.accepted ? "executed" : "blocked",
        blockedReason: result.accepted ? undefined : "erp_validation_failed",
      };
    } else {
      const pre = withPreExecutionChecks(updated, entry.billId, bills, vendors);
      updated = pre.entry;
      if (!pre.blocked) {
        updated = finalizePayment(updated, entry.billId, bills);
      }
    }
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

  function reset() {
    setState(seed());
    setLedger([]);
    setSpentUsd(0);
    setExpanded(null);
    setBusy(null);
    setLastReconciliation(null);
  }

  // Runs unconditionally, against every entry that carries a self-reported
  // claim — not just ones that already look suspicious. Re-evaluates from
  // scratch each run (replacing any prior reconciliation check) so approving
  // a previously-flagged entry and re-running shows it clear.
  function runReconciliation() {
    const updatedLedger = ledger.map((e) => {
      if (!e.claimedOutcome) return e;
      const check = evaluateReconciliation(e);
      if (!check) return e;
      const withoutPriorCheck = e.policyChecks.filter((c) => c.name !== "reconciliation");
      return { ...e, policyChecks: [...withoutPriorCheck, check] };
    });
    const checkedCount = ledger.filter((e) => e.claimedOutcome).length;
    const divergentCount = updatedLedger.filter((e) => e.claimedOutcome && e.policyChecks.some((c) => c.name === "reconciliation" && c.result === "fail")).length;
    setLedger(updatedLedger);
    setLastReconciliation({ checkedCount, divergentCount });
  }

  const budgetCap = 50;

  return (
    <DemoShell
      title="Governed QuickBooks Bill Approval"
      badge="Live Interactive Demo — Governed Bill Approval"
      evidenceTier="browser-simulation"
      evidenceDetail="Synthetic bills and vendors, local state — no live QuickBooks connection. Same tier as the Oracle EBS AP-exception demo."
      description="Every bill here is checked against vendor status and duplicate-bill history — the honest SMB equivalent of a three-way match, since QuickBooks shops don't run formal PO systems. Watch an agent propose a bill for approval, a deterministic policy decide whether it executes alone, escalates to a human, or gets blocked outright — and every decision lands in an audit-grade ledger. No chatbot in the decision loop; the policy is under 60 lines and reads like a checklist."
    >
      {/* Budget gauge */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Model spend</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--text)" }}>{fmtUsd(Number(spentUsd.toFixed(4)))}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">of ${budgetCap} cap</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Ledger entries</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--text)" }}>{ledger.length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">every decision, not just successes</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Pending approvals</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--text)" }}>{pendingApprovals.length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">escalated, awaiting a human</p>
        </div>
      </div>

      {/* Propose panel */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Propose a bill for approval</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">Click a scenario, or pick a bill from the queue below.</p>
        <div className="flex flex-col gap-2 mb-5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              disabled={busy !== null}
              onClick={() => propose(s.billId, s.actionType, s.amount, "agent", s.claimedOutcome)}
              className="text-left px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{s.label} <span className="text-[var(--text-muted)] font-normal">— {s.billId}, {fmtUsd(s.amount)}</span></p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.note}</p>
            </button>
          ))}
        </div>

        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs text-[var(--text-muted)] mb-3">Or process another bill from the queue, at its stated amount:</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={freeformBillId}
              onChange={(e) => setFreeformBillId(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm flex-1"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
            >
              {Object.values(bills).map((bill) => (
                <option key={bill.id} value={bill.id}>
                  {bill.id} — {vendors[bill.vendorId].name} ({fmtUsd(bill.amount)}, {bill.terms}, {bill.status})
                </option>
              ))}
            </select>
            <button
              disabled={busy !== null}
              onClick={() => propose(freeformBillId, "bill_approval", bills[freeformBillId].amount)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
            >
              Propose for approval
            </button>
          </div>
        </div>
      </div>

      {/* Pending approvals panel */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--warning-light)" }}>
          <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Pending human approvals</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Approver name (optional — defaults to "Compliance Reviewer"):
          </p>
          <input
            type="text"
            placeholder="Your name"
            value={approverName}
            onChange={(e) => setApproverName(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm mb-4 w-full sm:w-64"
            style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <div className="flex flex-col gap-3">
            {pendingApprovals.map((e) => (
              <div key={e.actionId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{e.billId} — {fmtAmount(e.actionType, e.amount)}</p>
                  <p className="text-xs text-[var(--text-muted)]">{e.policyChecks[e.policyChecks.length - 1]?.detail}</p>
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

      {/* Scheduled reconciliation — runs unconditionally, not on suspicion */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Scheduled reconciliation</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Compares every agent self-reported status update against the ledger's actual decision — runs on a fixed cadence in production, not only when something looks wrong. Click it any time, whether or not anything here looks suspicious.
            </p>
          </div>
          <button
            onClick={runReconciliation}
            disabled={busy !== null}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex-none"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Run reconciliation pass
          </button>
        </div>
        {lastReconciliation && (
          <div
            className="mt-4 p-3 rounded-xl text-xs"
            style={{
              background: lastReconciliation.divergentCount > 0 ? "color-mix(in srgb, var(--error-light) 12%, transparent)" : "color-mix(in srgb, var(--success) 12%, transparent)",
              border: `1px solid ${lastReconciliation.divergentCount > 0 ? "var(--error-light)" : "var(--success)"}`,
            }}
          >
            {lastReconciliation.checkedCount === 0
              ? "No self-reported claims exist yet to reconcile — try scenario 7."
              : lastReconciliation.divergentCount > 0
                ? `Checked ${lastReconciliation.checkedCount} claimed outcome(s) against the ledger's actual decisions — ${lastReconciliation.divergentCount} diverged. Expand a flagged entry's decision trail below for the specific gap. Nothing about these entries looked wrong until this pass ran.`
                : `Checked ${lastReconciliation.checkedCount} claimed outcome(s) against the ledger's actual decisions — no divergence found.`}
          </div>
        )}
      </div>

      {/* Ledger */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>Audit ledger</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Blocked and escalated actions are logged with the same fidelity as executed ones.</p>
          </div>
          <button
            onClick={reset}
            className="text-xs px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex-none"
            style={{ border: "1px solid var(--border)" }}
          >
            Reset demo
          </button>
        </div>

        {ledger.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] px-5 pb-6">No bills proposed yet — try a scenario above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 640 }}>
              <thead>
                <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  {["Time", "Bill", "Amount", "Decision", ""].map((h) => (
                    <th key={h} className="text-left text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-medium px-4 py-2.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ledger.map((e, i) => (
                  <Fragment key={e.actionId}>
                    <tr style={{ borderBottom: expanded === e.actionId ? "none" : i === ledger.length - 1 ? "none" : "1px solid var(--border)" }}>
                      <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{new Date(e.timestamp).toLocaleTimeString()}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: "var(--text)" }}>{e.billId}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{fmtAmount(e.actionType, e.amount)}</td>
                      <td className="px-4 py-2.5"><Badge decision={e.decision} /></td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => setExpanded(expanded === e.actionId ? null : e.actionId)}
                          className="text-xs mr-3"
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
                            {e.claimedOutcome && (
                              <div className="text-xs pb-2 mb-1" style={{ borderBottom: "1px solid var(--border)" }}>
                                <span className="text-slate-500">agent's own status update: </span>
                                <span className="italic text-[var(--text-muted)]">&ldquo;{e.claimedOutcome}&rdquo;</span>
                              </div>
                            )}
                            {e.policyChecks.map((c, ci) => (
                              <div key={ci} className="flex items-start gap-3 text-xs">
                                <span className="font-mono flex-none w-28" style={{ color: checkResultStyle[c.result] }}>{c.name}</span>
                                <span className="flex-1 text-[var(--text-muted)]">{c.detail}</span>
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
        Policy: bills under {fmtUsd(AUTO_APPROVE_CEILING)} execute autonomously; up to {fmtUsd(HUMAN_APPROVAL_CEILING)} require human approval; above that, blocked entirely — no override exists at this layer, on purpose. Duplicate-bill and vendor-status checks (scenarios 5 and 8) run as absolute preconditions, independent of amount — the honest SMB stand-in for a three-way match. Master-data changes (scenario 6) skip the dollar ladder entirely and are gated on a documented authorized-change record instead. Scenario 7's claimed-vs-actual gap is invisible until reconciliation runs — that's deliberate, and the point. Everything on this page runs in your browser; nothing is sent to a server.
      </p>
    </DemoShell>
  );
}
