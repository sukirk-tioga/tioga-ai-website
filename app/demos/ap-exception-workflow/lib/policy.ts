// Governed write-path policy for the AP exception-workflow demo. Ported
// from ~/Downloads/tioga-governed-agent-demo/agent-gateway/src/policy.js
// and erp-mock/src/server.js (offer #11's reference implementation),
// reskinned as an accounts-payable three-way-match exception story instead
// of generic procurement. Kept deliberately simple and readable, same as
// the source — an audit reviewer should be able to read this in a minute.

export const AUTHORIZED_ACTION_TYPES = new Set(["po_adjustment"]);

export const AUTO_APPROVE_CEILING = 5000; // below this, agent executes unattended
export const HUMAN_APPROVAL_CEILING = 25000; // between the two, routed to a human
// above HUMAN_APPROVAL_CEILING: blocked outright, no path to execution at all

export const CONTROL_TAGS = {
  scope: "NIST AI RMF GOVERN-1.5 — documented authorities & scope",
  spendCap: "NIST AI RMF MANAGE-1.3 — risk response & escalation",
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

export interface Vendor {
  id: string;
  name: string;
  status: "active" | "hold";
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  status: "open" | "closed";
  ceiling: number;
  committed: number;
}

export interface LedgerEntry {
  actionId: string;
  timestamp: string;
  poId: string;
  actionType: string;
  amount: number;
  actor: string;
  modelCostUsd: number;
  policyChecks: PolicyCheck[];
  decision: "pending" | "pending_approval" | "executed" | "blocked" | "rolled_back";
  blockedReason?: string;
  erpResult?: { accepted: boolean; newCommitted?: number; ceiling?: number; errors?: string[] };
  relatesTo?: string; // actionId of the entry a rollback reverses
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
      detail: `'${actionType}' is not in the authorized action set (${Array.from(AUTHORIZED_ACTION_TYPES).join(", ")}) — this agent has no path to execute it, governed or otherwise`,
      controlTag: CONTROL_TAGS.scope,
    },
    "gateway"
  );
}

export function evaluateSpend(amount: number): PolicyCheck {
  if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
    return tagged({ name: "spend_cap", result: "fail", detail: "amount must be a positive number", controlTag: CONTROL_TAGS.spendCap, route: "blocked" }, "gateway");
  }
  if (amount <= AUTO_APPROVE_CEILING) {
    return tagged(
      { name: "spend_cap", result: "pass", detail: `$${amount.toLocaleString()} is under the $${AUTO_APPROVE_CEILING.toLocaleString()} autonomous-execution ceiling`, controlTag: CONTROL_TAGS.spendCap, route: "auto" },
      "gateway"
    );
  }
  if (amount <= HUMAN_APPROVAL_CEILING) {
    return tagged(
      { name: "spend_cap", result: "escalate", detail: `$${amount.toLocaleString()} exceeds the autonomous ceiling — routed to human approval (up to $${HUMAN_APPROVAL_CEILING.toLocaleString()})`, controlTag: CONTROL_TAGS.spendCap, route: "human_approval" },
      "gateway"
    );
  }
  return tagged(
    { name: "spend_cap", result: "fail", detail: `$${amount.toLocaleString()} exceeds the $${HUMAN_APPROVAL_CEILING.toLocaleString()} single-approver ceiling entirely — no execution path exists at this layer`, controlTag: CONTROL_TAGS.spendCap, route: "blocked" },
    "gateway"
  );
}

// Illustrative per-action model-cost line item for the budget gauge.
// Deterministic-ish so demo runs are easy to narrate, same as the source.
export function estimateModelCost(actionType: string, amount: number): number {
  const base = actionType === "po_adjustment" ? 0.008 : 0.014;
  const complexity = Math.min(amount / 100000, 1) * 0.006;
  return Number((base + complexity).toFixed(4));
}

// Seed data: an AP three-way-match exception queue. One vendor on credit
// hold, one PO already closed — same shape as the reference erp-mock, new
// AP-flavored IDs.
export const SEED_VENDORS: Record<string, Vendor> = {
  "V-1001": { id: "V-1001", name: "Meridian Steel Supply", status: "active" },
  "V-1002": { id: "V-1002", name: "Cascade Logistics", status: "active" },
  "V-1003": { id: "V-1003", name: "Northline Fabrication", status: "hold" },
};

export const SEED_POS: Record<string, PurchaseOrder> = {
  "PO-4471": { id: "PO-4471", vendorId: "V-1001", status: "open", ceiling: 50000, committed: 32000 },
  "PO-4488": { id: "PO-4488", vendorId: "V-1002", status: "open", ceiling: 12000, committed: 9000 },
  "PO-4502": { id: "PO-4502", vendorId: "V-1003", status: "open", ceiling: 75000, committed: 41000 },
  "PO-4519": { id: "PO-4519", vendorId: "V-1001", status: "closed", ceiling: 20000, committed: 20000 },
};

export function cloneSeed() {
  return {
    vendors: structuredClone(SEED_VENDORS),
    pos: structuredClone(SEED_POS),
  };
}

// Simulates the ERP application-logic layer re-validating the change on
// every call — the same sanctioned write path, whoever the caller is.
// Mirrors erp-mock's /pos/:id/change: vendor status, PO status, and
// ceiling checks, never a raw table write.
export function validateErpChange(
  po: PurchaseOrder | undefined,
  vendor: Vendor | undefined,
  deltaAmount: number
): { accepted: boolean; errors: string[]; newCommitted?: number } {
  const errors: string[] = [];
  if (!po) errors.push("PO not found");
  if (po && po.status !== "open") errors.push(`PO status is '${po.status}', not open`);
  if (!vendor) errors.push("vendor not found in vendor master");
  if (vendor && vendor.status !== "active") errors.push(`vendor status is '${vendor.status}', not active`);
  if (typeof deltaAmount !== "number" || deltaAmount <= 0) errors.push("amount must be a positive number");
  if (po && typeof deltaAmount === "number" && po.committed + deltaAmount > po.ceiling) {
    errors.push(`change would exceed PO ceiling ($${po.ceiling.toLocaleString()}), committed would be $${(po.committed + deltaAmount).toLocaleString()}`);
  }
  if (errors.length > 0) return { accepted: false, errors };
  return { accepted: true, errors: [], newCommitted: po!.committed + deltaAmount };
}

export function erpCheck(result: { accepted: boolean; errors: string[]; newCommitted?: number }, latencyMs: number): PolicyCheck {
  return tagged(
    {
      name: "erp_validation",
      result: result.accepted ? "pass" : "fail",
      detail: result.accepted
        ? `ERP accepted the change through application-logic-layer; new committed $${result.newCommitted?.toLocaleString()}`
        : `ERP rejected: ${result.errors.join("; ")}`,
      controlTag: CONTROL_TAGS.erpValidation,
      latencyMs,
    },
    "erp"
  );
}

// New logic (not in the reference demo): reverses an already-executed
// action's committed-amount delta, through the same sanctioned write path
// — a rollback is itself a governed write, not a silent state mutation.
export function rollbackChange(po: PurchaseOrder | undefined, deltaAmount: number): { accepted: boolean; errors: string[]; newCommitted?: number } {
  const errors: string[] = [];
  if (!po) errors.push("PO not found");
  if (po && po.committed - deltaAmount < 0) errors.push("rollback would drive committed amount negative — cannot reverse");
  if (errors.length > 0) return { accepted: false, errors };
  return { accepted: true, errors: [], newCommitted: po!.committed - deltaAmount };
}

export function rollbackCheck(result: { accepted: boolean; errors: string[]; newCommitted?: number }, latencyMs: number): PolicyCheck {
  return tagged(
    {
      name: "rollback",
      result: result.accepted ? "pass" : "fail",
      detail: result.accepted
        ? `reversal executed through the same sanctioned write path; new committed $${result.newCommitted?.toLocaleString()}`
        : `rollback rejected: ${result.errors.join("; ")}`,
      controlTag: CONTROL_TAGS.audit,
      latencyMs,
    },
    "erp"
  );
}
