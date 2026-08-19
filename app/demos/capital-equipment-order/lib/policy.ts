// Governed write-path policy for the capital-equipment order-booking demo.
// A genuinely different governance shape from the AP-exception demo's
// dollar-threshold ladder: this domain's real risk dimension is a STATE
// TRANSITION (has the order's material been finalized, has procurement
// already committed against it), not a spend amount. Modeled from a real
// SAP fit-gap pattern -- semiconductor capital equipment sold configure-to-
// order, where a sales order sometimes has to be booked and tracked before
// the final product/material number is known. See
// ~/SecondBrain/TiogaAI/strategy/2026-08-18-sap-fitgap-notes-case-study-analysis.md
// for the source pattern and the honesty rule governing how this composite
// scenario is described (illustrative, not a real named engagement).

export const AUTHORIZED_ACTION_TYPES = new Set(["book_tbd_order", "finalize_material", "formal_reject_order"]);

// A material-price/tax delta at or below this fraction of the original
// TBD-assumed price is treated as routine (auto-finalizes); above it,
// the delta is large enough to affect revenue recognition and routes to
// a named approver instead.
export const MATERIAL_DELTA_TOLERANCE = 0.08; // 8%

export const CONTROL_TAGS = {
  scope: "NIST AI RMF GOVERN-1.5 — documented authorities & scope",
  stateTransition: "NIST AI RMF MANAGE-1.3 — risk response & escalation",
  erpValidation: "NIST AI RMF MEASURE-2.7 — system behavior monitored against expectations",
  humanApproval: "NIST AI RMF MANAGE-1.3 — risk response & escalation",
  audit: "NIST AI RMF MANAGE-4.1 — post-deployment monitoring & incident response",
} as const;

export type PolicyResult = "pass" | "fail" | "escalate" | "pending";
export type Route = "auto" | "human_approval" | "blocked";

export interface PolicyCheck {
  name: string;
  result: PolicyResult;
  detail: string;
  controlTag: string;
  route?: Route;
  layer: "gateway" | "erp" | "human";
  t: string;
  latencyMs?: number;
}

export interface Order {
  id: string;
  customer: string;
  status: "tbd_material" | "configured" | "rejected";
  tbdMaterialId: string;
  tbdPrice: number;
  finalMaterialId?: string;
  finalPrice?: number;
  capacitySlotConfirmed: boolean;
  // Set once formal procurement (long-lead RF/chamber components) has been
  // triggered against the TBD material's assumed configuration -- once
  // true, finalizing to a materially different configuration or rejecting
  // the order has real downstream cost exposure, not just a paperwork
  // change.
  procurementCommitted: boolean;
}

export interface LedgerEntry {
  actionId: string;
  timestamp: string;
  orderId: string;
  actionType: string;
  detail: string;
  actor: string;
  modelCostUsd: number;
  policyChecks: PolicyCheck[];
  decision: "pending" | "pending_approval" | "executed" | "blocked" | "rolled_back";
  blockedReason?: string;
  erpResult?: { accepted: boolean; errors?: string[] };
  relatesTo?: string;
}

function now() {
  return new Date().toISOString();
}

function tagged(check: Omit<PolicyCheck, "t" | "layer">, layer: PolicyCheck["layer"]): PolicyCheck {
  return { ...check, t: now(), layer };
}

export function evaluateScope(actionType: string): PolicyCheck {
  if (AUTHORIZED_ACTION_TYPES.has(actionType)) {
    return tagged(
      { name: "scope", result: "pass", detail: `'${actionType}' is an authorized action type`, controlTag: CONTROL_TAGS.scope },
      "gateway"
    );
  }
  return tagged(
    {
      name: "scope",
      result: "fail",
      detail: `'${actionType}' is not in the authorized action set (${Array.from(AUTHORIZED_ACTION_TYPES).join(", ")}) — this agent has no path to execute it, governed or otherwise. A raw cancellation is exactly this case: it isn't a smaller version of the formal reject path, it's a different, unauthorized action entirely.`,
      controlTag: CONTROL_TAGS.scope,
    },
    "gateway"
  );
}

// Booking a TBD-material order is safe to auto-execute, but only once the
// fab's capacity-expansion slot is actually confirmed -- otherwise SAP
// would be holding a place in the pipeline for a commitment that doesn't
// exist yet, which corrupts the same downstream forecasting/procurement
// triggers the TBD-material pattern exists to protect.
export function evaluateBooking(order: Order): PolicyCheck {
  if (order.capacitySlotConfirmed) {
    return tagged(
      { name: "capacity_slot", result: "pass", detail: `${order.customer}'s capacity-expansion slot is confirmed — booking against TBD material ${order.tbdMaterialId} is routine`, controlTag: CONTROL_TAGS.stateTransition, route: "auto" },
      "gateway"
    );
  }
  return tagged(
    { name: "capacity_slot", result: "fail", detail: `${order.customer}'s capacity-expansion slot is not yet confirmed — booking would hold a pipeline place for a commitment that doesn't exist yet`, controlTag: CONTROL_TAGS.stateTransition, route: "blocked" },
    "gateway"
  );
}

// The real fit-gap decision point: does the final configuration's price
// delta from the TBD-assumed price stay inside a routine tolerance (auto),
// or is it large enough that revenue-recognition and downstream tax
// classification need a named human to sign off before it takes effect?
export function evaluateMaterialDelta(order: Order, finalPrice: number): PolicyCheck {
  const delta = Math.abs(finalPrice - order.tbdPrice) / order.tbdPrice;
  if (delta <= MATERIAL_DELTA_TOLERANCE) {
    return tagged(
      { name: "material_delta", result: "pass", detail: `final price $${finalPrice.toLocaleString()} is within ${(MATERIAL_DELTA_TOLERANCE * 100).toFixed(0)}% of the TBD-assumed $${order.tbdPrice.toLocaleString()} — routine, auto-finalizes`, controlTag: CONTROL_TAGS.stateTransition, route: "auto" },
      "gateway"
    );
  }
  return tagged(
    { name: "material_delta", result: "escalate", detail: `final price $${finalPrice.toLocaleString()} differs from the TBD-assumed $${order.tbdPrice.toLocaleString()} by ${(delta * 100).toFixed(1)}% — exceeds the ${(MATERIAL_DELTA_TOLERANCE * 100).toFixed(0)}% routine tolerance, affects revenue-recognition timing, routed to a named approver`, controlTag: CONTROL_TAGS.stateTransition, route: "human_approval" },
    "gateway"
  );
}

// Formal reject path (distinct from the blocked raw-cancellation action
// type above): safe to auto-execute if no procurement has been triggered
// yet against the TBD material's assumed configuration; needs a named
// approval if procurement already committed, since real cost is now at
// stake, not just a pipeline entry.
export function evaluateReject(order: Order): PolicyCheck {
  if (!order.procurementCommitted) {
    return tagged(
      { name: "reject_exposure", result: "pass", detail: `no procurement has been triggered against ${order.id} yet — reject is a clean pipeline removal`, controlTag: CONTROL_TAGS.stateTransition, route: "auto" },
      "gateway"
    );
  }
  return tagged(
    { name: "reject_exposure", result: "escalate", detail: `long-lead procurement is already committed against ${order.id}'s TBD configuration — rejecting now has real cost exposure, routed to a named approver`, controlTag: CONTROL_TAGS.stateTransition, route: "human_approval" },
    "gateway"
  );
}

// ERP-layer validation, independent of the policy layer above -- mirrors
// the AP-exception demo's "vendor on credit hold" pattern: policy can
// approve an action and the ERP's own application-logic layer can still
// catch a state the policy check didn't and shouldn't need to know about.
// Here: finalizing to a configuration that contradicts what procurement
// already ordered against the TBD material (e.g. a 3-chamber component
// set already on order, finalize attempts to set the order to 5 chambers).
export function validateErpFinalize(order: Order, finalMaterialId: string): { accepted: boolean; errors: string[] } {
  const errors: string[] = [];
  if (order.status !== "tbd_material") errors.push(`order status is '${order.status}', not awaiting a TBD material`);
  if (order.procurementCommitted && finalMaterialId !== order.tbdMaterialId.replace("TBD", "CFG")) {
    errors.push(
      `committed procurement was triggered against ${order.tbdMaterialId}'s assumed configuration — finalizing to ${finalMaterialId} contradicts what's already on order for long-lead components`
    );
  }
  if (errors.length > 0) return { accepted: false, errors };
  return { accepted: true, errors: [] };
}

export function erpCheck(result: { accepted: boolean; errors: string[] }, latencyMs: number): PolicyCheck {
  return tagged(
    {
      name: "erp_validation",
      result: result.accepted ? "pass" : "fail",
      detail: result.accepted
        ? "ERP accepted the finalize through the application-logic layer"
        : `ERP rejected: ${result.errors.join("; ")}`,
      controlTag: CONTROL_TAGS.erpValidation,
      latencyMs,
    },
    "erp"
  );
}

export function estimateModelCost(actionType: string): number {
  const base: Record<string, number> = { book_tbd_order: 0.006, finalize_material: 0.009, formal_reject_order: 0.007 };
  return base[actionType] ?? 0.006;
}

// Seed: a semiconductor capital-equipment order pipeline. Illustrative
// composite scenario, not real client data — see the source analysis's
// honesty rule.
// Each order below is the dedicated target of exactly one canned scenario
// in page.tsx, so scenarios can be clicked in any order without one
// mutating another's starting state (the same independence the AP-exception
// demo's PO-4471/4488/4502/4519 targets have).
export const SEED_ORDERS: Record<string, Order> = {
  "SO-9001": { id: "SO-9001", customer: "Fab Customer A", status: "tbd_material", tbdMaterialId: "TBD-ETCH-A", tbdPrice: 2400000, capacitySlotConfirmed: true, procurementCommitted: false },
  "SO-9002": { id: "SO-9002", customer: "Fab Customer B", status: "tbd_material", tbdMaterialId: "TBD-DEP-B", tbdPrice: 3100000, capacitySlotConfirmed: true, procurementCommitted: true },
  "SO-9003": { id: "SO-9003", customer: "Fab Customer C", status: "tbd_material", tbdMaterialId: "TBD-ETCH-C", tbdPrice: 1950000, capacitySlotConfirmed: false, procurementCommitted: false },
  "SO-9004": { id: "SO-9004", customer: "Fab Customer D", status: "tbd_material", tbdMaterialId: "TBD-DEP-D", tbdPrice: 2750000, capacitySlotConfirmed: true, procurementCommitted: true },
  "SO-9005": { id: "SO-9005", customer: "Fab Customer E", status: "tbd_material", tbdMaterialId: "TBD-ETCH-E", tbdPrice: 2200000, capacitySlotConfirmed: true, procurementCommitted: true },
};

export function cloneSeed() {
  return { orders: structuredClone(SEED_ORDERS) };
}
