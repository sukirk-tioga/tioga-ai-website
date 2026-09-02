"use client";

import { Fragment, useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  cloneSeed,
  evaluateScope,
  evaluateBooking,
  evaluateMaterialDelta,
  evaluateReject,
  validateErpFinalize,
  erpCheck,
  estimateModelCost,
  AUTHORIZED_ACTION_TYPES,
  MATERIAL_DELTA_TOLERANCE,
  type LedgerEntry,
  type PolicyCheck,
  type Order,
} from "./lib/policy";

// ── Canned scenarios — a capital-equipment order pipeline ───────────────────
// Each targets a dedicated seed order (or, for book_tbd_order, a brand new
// one) so scenarios stay independent of click order — see policy.ts's seed
// comment. Illustrative composite scenario, not a real client engagement —
// see ~/SecondBrain/TiogaAI/strategy/2026-08-18-sap-fitgap-notes-case-study-analysis.md.

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

let scenarioCustomerCounter = 0;

// ── Page ──────────────────────────────────────────────────────────────────

export default function CapitalEquipmentOrderPage() {
  const seed = () => cloneSeed();
  const [{ orders }, setState] = useState(seed());
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [spentUsd, setSpentUsd] = useState(0);
  const [approverName, setApproverName] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [freeformOrderId, setFreeformOrderId] = useState("SO-9001");
  const [freeformFinalPrice, setFreeformFinalPrice] = useState("");

  const pendingApprovals = ledger.filter((e) => e.decision === "pending_approval");

  function newActionId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function baseEntry(orderId: string, actionType: string, detail: string, actor: string): LedgerEntry {
    return {
      actionId: newActionId(),
      timestamp: new Date().toISOString(),
      orderId,
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

  // book_tbd_order — creates a brand-new order in tbd_material status.
  async function proposeBooking(customer: string, capacityConfirmed: boolean, actor = "agent") {
    const orderId = `SO-9${(10 + scenarioCustomerCounter++).toString().padStart(2, "0")}`;
    setBusy(`book-${orderId}`);
    let entry = baseEntry(orderId, "book_tbd_order", `Book ${customer}'s order against TBD-material placeholder`, actor);

    const scopeCheck = evaluateScope("book_tbd_order");
    entry = { ...entry, policyChecks: [...entry.policyChecks, scopeCheck] };
    setSpentUsd((s) => s + entry.modelCostUsd);

    const candidate: Order = {
      id: orderId,
      customer,
      status: "tbd_material",
      tbdMaterialId: `TBD-ETCH-${orderId.slice(-2)}`,
      tbdPrice: 2500000,
      capacitySlotConfirmed: capacityConfirmed,
      procurementCommitted: false,
    };
    const bookingCheck = evaluateBooking(candidate);
    entry = { ...entry, policyChecks: [...entry.policyChecks, bookingCheck] };

    if (bookingCheck.result === "fail") {
      entry = { ...entry, decision: "blocked", blockedReason: "capacity_slot_unconfirmed" };
      await settle(entry);
      return;
    }

    await new Promise((r) => setTimeout(r, 350));
    setState((prev) => ({ orders: { ...prev.orders, [orderId]: candidate } }));
    entry = { ...entry, decision: "executed" };
    await settle(entry);
  }

  // raw_cancel_order — always scope-blocked; not an authorized action type.
  async function proposeRawCancel(orderId: string, actor = "agent") {
    setBusy(`cancel-${orderId}`);
    let entry = baseEntry(orderId, "raw_cancel_order", `Attempt to directly cancel ${orderId} instead of the formal reject path`, actor);
    const scopeCheck = evaluateScope("raw_cancel_order");
    entry = { ...entry, policyChecks: [...entry.policyChecks, scopeCheck] };
    setSpentUsd((s) => s + entry.modelCostUsd);
    entry = { ...entry, decision: "blocked", blockedReason: "scope_violation" };
    await settle(entry);
  }

  // formal_reject_order — safe if no procurement committed yet, escalates
  // to a named approver if procurement already has real cost exposure.
  async function proposeReject(orderId: string, actor = "agent") {
    const order = orders[orderId];
    if (!order) return;
    setBusy(`reject-${orderId}`);
    let entry = baseEntry(orderId, "formal_reject_order", `Formally reject ${orderId}`, actor);

    const scopeCheck = evaluateScope("formal_reject_order");
    entry = { ...entry, policyChecks: [...entry.policyChecks, scopeCheck] };
    setSpentUsd((s) => s + entry.modelCostUsd);

    const rejectCheck = evaluateReject(order);
    entry = { ...entry, policyChecks: [...entry.policyChecks, rejectCheck] };

    if (rejectCheck.route === "human_approval") {
      entry = { ...entry, decision: "pending_approval" };
      await settle(entry);
      return;
    }

    await new Promise((r) => setTimeout(r, 300));
    setState((prev) => ({ orders: { ...prev.orders, [orderId]: { ...prev.orders[orderId], status: "rejected" } } }));
    entry = { ...entry, decision: "executed" };
    await settle(entry);
  }

  // finalize_material — the core temp-material pattern: routes on how far
  // the final price departs from the TBD-assumed one, then re-validates
  // against the ERP's own committed-procurement state independent of the
  // policy layer's own decision.
  async function proposeFinalize(orderId: string, finalPrice: number, finalMaterialIdOverride: string | undefined, actor = "agent") {
    const order = orders[orderId];
    if (!order) return;
    setBusy(`finalize-${orderId}`);
    let entry = baseEntry(orderId, "finalize_material", `Finalize ${orderId} from ${order.tbdMaterialId} to a real configured material at $${finalPrice.toLocaleString()}`, actor);

    const scopeCheck = evaluateScope("finalize_material");
    entry = { ...entry, policyChecks: [...entry.policyChecks, scopeCheck] };
    setSpentUsd((s) => s + entry.modelCostUsd);

    const deltaCheck = evaluateMaterialDelta(order, finalPrice);
    entry = { ...entry, policyChecks: [...entry.policyChecks, deltaCheck] };

    if (deltaCheck.route === "human_approval") {
      entry = { ...entry, decision: "pending_approval", erpResult: undefined };
      // Stash what to execute once approved.
      (entry as LedgerEntry & { _pendingFinalPrice?: number; _pendingFinalMaterialId?: string })._pendingFinalPrice = finalPrice;
      (entry as LedgerEntry & { _pendingFinalPrice?: number; _pendingFinalMaterialId?: string })._pendingFinalMaterialId = finalMaterialIdOverride;
      await settle(entry);
      return;
    }

    await executeFinalize(entry, order, finalPrice, finalMaterialIdOverride);
  }

  async function executeFinalize(entry: LedgerEntry, order: Order, finalPrice: number, finalMaterialIdOverride: string | undefined) {
    await new Promise((r) => setTimeout(r, 350));
    const finalMaterialId = finalMaterialIdOverride ?? order.tbdMaterialId.replace("TBD", "CFG");
    const result = validateErpFinalize(order, finalMaterialId);
    const latency = 180 + Math.round(Math.random() * 220);
    const check = erpCheck(result, latency);
    const updated: LedgerEntry = {
      ...entry,
      policyChecks: [...entry.policyChecks, check],
      erpResult: result,
      decision: result.accepted ? "executed" : "blocked",
      blockedReason: result.accepted ? undefined : "erp_validation_failed",
    };
    if (result.accepted) {
      setState((prev) => ({
        orders: {
          ...prev.orders,
          [order.id]: { ...prev.orders[order.id], status: "configured", finalMaterialId, finalPrice },
        },
      }));
    }
    setLedger((prev) => [updated, ...prev]);
    setBusy(null);
    setExpanded(updated.actionId);
  }

  async function approve(actionId: string) {
    const entry = ledger.find((e) => e.actionId === actionId);
    if (!entry) return;
    setBusy(`approve-${actionId}`);
    const approver = approverName.trim() || "Revenue Recognition Owner";
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

    if (entry.actionType === "formal_reject_order") {
      setState((prev) => ({ orders: { ...prev.orders, [entry.orderId]: { ...prev.orders[entry.orderId], status: "rejected" } } }));
      const finalEntry: LedgerEntry = { ...updatedBase, decision: "executed" };
      setLedger((prev) => prev.map((e) => (e.actionId === actionId ? finalEntry : e)));
      setBusy(null);
      setExpanded(actionId);
      return;
    }

    // finalize_material: execute the stashed final price/material now that it's approved.
    const stash = entry as LedgerEntry & { _pendingFinalPrice?: number; _pendingFinalMaterialId?: string };
    const order = orders[entry.orderId];
    setLedger((prev) => prev.filter((e) => e.actionId !== actionId));
    if (order && stash._pendingFinalPrice !== undefined) {
      await executeFinalize(updatedBase, order, stash._pendingFinalPrice, stash._pendingFinalMaterialId);
    }
  }

  async function deny(actionId: string) {
    const entry = ledger.find((e) => e.actionId === actionId);
    if (!entry) return;
    setBusy(`deny-${actionId}`);
    const approver = approverName.trim() || "Revenue Recognition Owner";
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
    scenarioCustomerCounter = 0;
  }

  const SCENARIOS: Scenario[] = [
    {
      id: "book-auto",
      label: "1 — Book TBD order (auto)",
      note: "A new customer's capacity-expansion slot is confirmed — booking a sales order against a placeholder TBD material is routine.",
      run: () => proposeBooking("Fab Customer F", true),
    },
    {
      id: "book-blocked",
      label: "2 — Blocked (capacity slot not confirmed)",
      note: "Booking against TBD material before the capacity slot itself is confirmed would hold a pipeline place for a commitment that doesn't exist yet.",
      run: () => proposeBooking("Fab Customer G", false),
    },
    {
      id: "finalize-auto",
      label: "3 — Finalize material (auto)",
      note: `SO-9001's final configured price is within ${(MATERIAL_DELTA_TOLERANCE * 100).toFixed(0)}% of what the TBD material assumed — routine, auto-finalizes.`,
      run: () => proposeFinalize("SO-9001", 2450000, undefined),
    },
    {
      id: "finalize-escalate",
      label: "4 — Escalated → approved (material delta)",
      note: "SO-9002's final configuration came in well above the TBD-assumed price — affects revenue-recognition timing, routed to a named approver.",
      run: () => proposeFinalize("SO-9002", 3550000, undefined),
    },
    {
      id: "cancel-blocked",
      label: "5 — Blocked (scope: raw cancellation)",
      note: "Someone tries to have the agent directly cancel SO-9003 — not the formal reject path, not an action type this agent is authorized to take at all.",
      run: () => proposeRawCancel("SO-9003"),
    },
    {
      id: "reject-escalate",
      label: "6 — Escalated → approved (reject with cost exposure)",
      note: "SO-9004 already has long-lead procurement committed against its TBD configuration — rejecting now has real cost exposure, routed to a named approver.",
      run: () => proposeReject("SO-9004"),
    },
    {
      id: "finalize-erp-blocked",
      label: "7 — Blocked (ERP: contradicts committed procurement)",
      note: "SO-9005 already has procurement committed against its TBD configuration — policy approves finalizing it, but the ERP itself catches that the proposed final material contradicts what's already on order.",
      run: () => proposeFinalize("SO-9005", 2260000, "CFG-ETCH-E-5CHAMBER"),
    },
  ];

  const budgetCap = 50;

  return (
    <DemoShell
      title="Governed Capital Equipment Order Booking"
      badge="Live Interactive Demo — Governed Write-Path"
      description="A real SAP fit-gap pattern: semiconductor capital equipment is sold configure-to-order, and a sales order sometimes has to be booked against a fab's confirmed capacity slot before the final tool configuration is known. Watch a deterministic policy decide whether booking, finalizing, or rejecting that order executes alone, escalates to a named approver, or gets blocked outright — with an ERP-layer check that catches what the policy alone can't. Illustrative composite scenario, not a real client engagement."
    >
      {/* Stats */}
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

      {/* Order pipeline snapshot */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Order pipeline</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">The seed orders each canned scenario targets — watch this update as scenarios execute.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Order", "Customer", "Status", "Material", "Price", "Procurement"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-medium px-3 py-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(orders)
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--text)" }}>{o.id}</td>
                    <td className="px-3 py-2 text-[var(--text-muted)] whitespace-nowrap">{o.customer}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          color: o.status === "configured" ? "var(--success)" : o.status === "rejected" ? "var(--error-light)" : "var(--accent)",
                          background: o.status === "configured" ? "#4ADE8015" : o.status === "rejected" ? "#EF444415" : "#C8340615",
                        }}
                      >
                        {o.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{o.finalMaterialId ?? o.tbdMaterialId}</td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{fmtUsd(o.finalPrice ?? o.tbdPrice)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-xs" style={{ color: o.procurementCommitted ? "var(--warning-light)" : "var(--text-muted)" }}>
                        {o.procurementCommitted ? "committed" : "none yet"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Propose panel */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Propose an action</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">Click a scenario, or finalize any order yourself with your own price.</p>
        <div className="flex flex-col gap-2 mb-5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              disabled={busy !== null}
              onClick={s.run}
              className="text-left px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{s.label}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.note}</p>
            </button>
          ))}
        </div>

        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs text-[var(--text-muted)] mb-3">Or finalize a TBD order yourself — pick one and set the final price:</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={freeformOrderId}
              onChange={(e) => setFreeformOrderId(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
            >
              {Object.values(orders)
                .filter((o) => o.status === "tbd_material")
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} — {o.customer} (TBD ${o.tbdPrice.toLocaleString()})
                  </option>
                ))}
            </select>
            <input
              type="number"
              placeholder="Final price, e.g. 2500000"
              value={freeformFinalPrice}
              onChange={(e) => setFreeformFinalPrice(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm flex-1"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <button
              disabled={busy !== null || !freeformFinalPrice || Number(freeformFinalPrice) <= 0 || !orders[freeformOrderId]}
              onClick={() => proposeFinalize(freeformOrderId, Number(freeformFinalPrice), undefined)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
            >
              Finalize
            </button>
          </div>
        </div>
      </div>

      {/* Pending approvals panel */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--warning-light)" }}>
          <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Pending human approvals</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Approver name (optional — defaults to &quot;Revenue Recognition Owner&quot;):
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
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{e.orderId} — {e.actionType}</p>
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
          <p className="text-sm text-[var(--text-muted)] px-5 pb-6">No actions proposed yet — try a scenario above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 640 }}>
              <thead>
                <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  {["Time", "Order", "Action", "Decision", ""].map((h) => (
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
                      <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: "var(--text)" }}>{e.orderId}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{e.actionType}</td>
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
                              <span className="text-[var(--text-muted)]">{e.detail}</span>
                            </div>
                            {e.policyChecks.map((c, ci) => (
                              <div key={ci} className="flex items-start gap-3 text-xs">
                                <span className="font-mono flex-none w-32" style={{ color: checkResultStyle[c.result] }}>{c.name}</span>
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
        Policy: booking a TBD-material order auto-executes once the customer&apos;s capacity slot is confirmed; finalizing to a
        real material auto-executes if the price stays within {(MATERIAL_DELTA_TOLERANCE * 100).toFixed(0)}% of the TBD
        estimate, and escalates to a named approver above that; rejecting an order auto-executes if no procurement has been
        triggered yet, and escalates if it has. A raw cancellation is never an authorized action, regardless of state — only
        the formal reject path exists. The ERP re-validates every finalize independently of the policy layer, catching a
        configuration that contradicts already-committed procurement even when policy approved the request. Everything on
        this page runs in your browser; nothing is sent to a server. Illustrative composite scenario grounded in a real SAP
        fit-gap pattern — not a real client engagement.
      </p>
    </DemoShell>
  );
}
