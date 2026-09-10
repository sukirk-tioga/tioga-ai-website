// Governed write-path policy for the QuickBooks bill-approval demo — Phase A
// of closing the "QuickBooks or enterprise ERP, we serve both" gap the site
// otherwise only backs up on the enterprise side (see
// app/demos/ap-exception-workflow/lib/policy.ts, the Oracle EBS AP-exception
// demo this one is structurally modeled on).
//
// Deliberately NOT a re-skin of that demo's three-way-match story. SMBs
// running QuickBooks don't operate formal PO systems or a three-way match
// against committed PO ceilings — pretending they do would misrepresent the
// segment. This demo's checks are the honest SMB equivalent: a bill either
// matches something already paid (a duplicate) or its vendor is on hold.
// Same governance shape (scope → spend-tiered routing → change control for
// master-data → claimed-vs-actual reconciliation), different, smaller-scale
// domain checks standing in for 3-way-match/ERP validation.
//
// Spend ceilings are also SMB-scaled, not copy-pasted from the enterprise
// demo: a QuickBooks shop's single-approver bill-approval ceiling is
// realistically in the low thousands, not the tens of thousands an
// enterprise PO threshold would be — so $1,000 / $10,000 here, vs.
// $5,000 / $25,000 on the ap-exception side.

export const AUTHORIZED_ACTION_TYPES = new Set(["bill_approval", "vendor_payment_detail_change"]);

export const AUTO_APPROVE_CEILING = 1000; // below this, agent executes unattended
export const HUMAN_APPROVAL_CEILING = 10000; // between the two, routed to a human
// above HUMAN_APPROVAL_CEILING: blocked outright, no path to execution at all

// Master-data action types (vendor payment/routing details, not a bill
// amount) are never routed through the spend-cap ladder above — dollar
// amount isn't the relevant risk dimension for a change to who gets paid,
// not how much. They're gated on change control instead: a documented,
// matching authorized-change record, checked independent of amount. Mirrors
// ap-exception's "clean-hands" vendor_bank_detail_change pattern exactly.
export const MASTER_DATA_ACTION_TYPES = new Set(["vendor_payment_detail_change"]);

// Seed: which vendors currently have a documented, pre-authorized
// payment-detail-change record on file. Empty by default — the clean-hands
// scenario's point is exactly that no such record exists yet for the
// vendor the agent is about to act on.
export const AUTHORIZED_CHANGE_RECORDS: Set<string> = new Set();

export const CONTROL_TAGS = {
  scope: "NIST AI RMF GOVERN-1.5 — documented authorities & scope",
  spendCap: "NIST AI RMF MANAGE-1.3 — risk response & escalation",
  duplicateCheck: "NIST AI RMF MEASURE-2.7 — system behavior monitored against expectations",
  vendorStatus: "NIST AI RMF MEASURE-2.7 — system behavior monitored against expectations",
  humanApproval: "NIST AI RMF MANAGE-1.3 — risk response & escalation",
  audit: "NIST AI RMF MANAGE-4.1 — post-deployment monitoring & incident response",
  changeControl: "NIST AI RMF MANAGE-1.3 — segregation of duties & change authorization for agent-effected master-data changes",
  reconciliation: "NIST AI RMF MEASURE-2.7 — claimed-vs-actual reconciliation, run unconditionally on a schedule",
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

export interface Bill {
  id: string;
  vendorId: string;
  amount: number;
  terms: string;
  date: string; // ISO date
  status: "open" | "paid";
}

export interface LedgerEntry {
  actionId: string;
  timestamp: string;
  billId: string;
  actionType: string;
  amount: number;
  actor: string;
  modelCostUsd: number;
  policyChecks: PolicyCheck[];
  decision: "pending" | "pending_approval" | "executed" | "blocked";
  blockedReason?: string;
  // The agent's own self-reported status update — sent to a stakeholder at
  // proposal time, before the gateway's actual routing decision is known.
  // Ground truth is `decision`, not this. Reconciliation compares the two.
  claimedOutcome?: string;
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

// SMB check #1, replacing 3-way-match: a duplicate bill. Same vendor, same
// amount, same date as a bill already marked paid is the SMB equivalent of
// an ERP rejecting a bad write — the honest signal a QuickBooks shop
// actually has, since there's no PO to match against. Deliberately checked
// as an absolute precondition, independent of the spend-cap ladder below —
// a duplicate blocks the bill regardless of amount, the same way scope does.
export function checkDuplicateBill(bill: Bill, allBills: Record<string, Bill>): PolicyCheck {
  const duplicate = Object.values(allBills).find(
    (b) => b.id !== bill.id && b.vendorId === bill.vendorId && b.amount === bill.amount && b.date === bill.date && b.status === "paid"
  );
  if (duplicate) {
    return tagged(
      {
        name: "duplicate_check",
        result: "fail",
        detail: `matches ${duplicate.id}, already marked paid — same vendor, amount ($${bill.amount.toLocaleString()}), and date (${bill.date}). Treated as a duplicate submission, not a new bill.`,
        controlTag: CONTROL_TAGS.duplicateCheck,
      },
      "erp"
    );
  }
  return tagged(
    {
      name: "duplicate_check",
      result: "pass",
      detail: "no already-paid bill matches this vendor, amount, and date",
      controlTag: CONTROL_TAGS.duplicateCheck,
    },
    "erp"
  );
}

// SMB check #2, replacing 3-way-match: vendor status. Same role as
// ap-exception's vendor-status check inside validateErpChange, just run as
// its own standalone, independently-tagged check here rather than folded
// into a single combined "ERP validation" line.
export function checkVendorStatus(vendor: Vendor | undefined): PolicyCheck {
  if (!vendor) {
    return tagged({ name: "vendor_status", result: "fail", detail: "vendor not found in vendor master", controlTag: CONTROL_TAGS.vendorStatus }, "erp");
  }
  if (vendor.status === "hold") {
    return tagged(
      {
        name: "vendor_status",
        result: "fail",
        detail: `${vendor.name} (${vendor.id}) is on hold — no bill can be paid against a vendor on hold, regardless of amount`,
        controlTag: CONTROL_TAGS.vendorStatus,
      },
      "erp"
    );
  }
  return tagged(
    { name: "vendor_status", result: "pass", detail: `${vendor.name} (${vendor.id}) is active — clear to pay`, controlTag: CONTROL_TAGS.vendorStatus },
    "erp"
  );
}

// Change control for master-data actions — independent of the spend-cap
// ladder above on purpose. A supplier payment-detail change is exactly the
// "clean-hands" red-team scenario: an agent can propose it based on a
// summary of external content that read as routine, every upstream check
// (scope, vendor/duplicate validation) can pass, and the only thing that
// catches it is whether a human already authorized this specific change —
// the same segregation-of-duties standard a human-effected change to the
// same field would already be held to.
export function evaluateChangeControl(vendorId: string): PolicyCheck {
  if (AUTHORIZED_CHANGE_RECORDS.has(vendorId)) {
    return tagged(
      {
        name: "change_control",
        result: "pass",
        detail: `a documented, pre-authorized change record exists for ${vendorId} — still routed to human approval as a formality, not auto-executed`,
        controlTag: CONTROL_TAGS.changeControl,
        route: "human_approval",
      },
      "gateway"
    );
  }
  return tagged(
    {
      name: "change_control",
      result: "escalate",
      detail: `no matching authorized-change record exists for a payment-detail change on ${vendorId} — master-data changes to vendor remittance/routing details always require a named, documented approval authority distinct from the agent proposing them, independent of dollar amount`,
      controlTag: CONTROL_TAGS.changeControl,
      route: "human_approval",
    },
    "gateway"
  );
}

// Application-logic-layer validation for an approved master-data change —
// mirrors validateVendorMasterChange's discipline (re-validated through the
// application layer, never a raw write) against vendor-master fields.
export function validateVendorPaymentChange(vendor: Vendor | undefined): { accepted: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!vendor) errors.push("vendor not found in vendor master");
  if (vendor && vendor.status !== "active") errors.push(`vendor status is '${vendor.status}', not active`);
  if (errors.length > 0) return { accepted: false, errors };
  return { accepted: true, errors: [] };
}

export function vendorPaymentCheck(result: { accepted: boolean; errors: string[] }, latencyMs: number): PolicyCheck {
  return tagged(
    {
      name: "vendor_master_write",
      result: result.accepted ? "pass" : "fail",
      detail: result.accepted
        ? "QuickBooks accepted the vendor payment-detail change through the application-logic layer"
        : `rejected: ${result.errors.join("; ")}`,
      controlTag: CONTROL_TAGS.audit,
      latencyMs,
    },
    "erp"
  );
}

// The actual write: posting an approved bill as paid. Runs only after
// duplicate-check and vendor-status have both already passed — this
// function's job is the write itself, not re-deciding whether it should
// happen.
export function postPayment(bill: Bill | undefined): { accepted: boolean; errors: string[] } {
  if (!bill) return { accepted: false, errors: ["bill not found in bill queue"] };
  if (bill.status === "paid") return { accepted: false, errors: [`${bill.id} is already marked paid`] };
  return { accepted: true, errors: [] };
}

export function paymentPostedCheck(result: { accepted: boolean; errors: string[] }, latencyMs: number): PolicyCheck {
  return tagged(
    {
      name: "payment_posted",
      result: result.accepted ? "pass" : "fail",
      detail: result.accepted
        ? "bill marked paid in QuickBooks through the application-logic layer, not a raw table write"
        : `posting rejected: ${result.errors.join("; ")}`,
      controlTag: CONTROL_TAGS.audit,
      latencyMs,
    },
    "erp"
  );
}

// Claimed-vs-actual reconciliation — compares an agent's own self-reported
// status update against the ledger's real, gateway-adjudicated decision.
// Deliberately a separate pass from everything above: nothing here runs
// automatically when an entry is created, the same way the source incident
// this models only surfaced its own divergence because the violating agent
// happened to self-report. Verbatim logic from the ap-exception demo — only
// the entity references changed.
export function evaluateReconciliation(entry: LedgerEntry): PolicyCheck | null {
  if (!entry.claimedOutcome) return null;
  const claimsResolved = /resolved|processed|cleared|no further action|paid/i.test(entry.claimedOutcome);
  const actuallyResolved = entry.decision === "executed";
  if (claimsResolved && !actuallyResolved) {
    return tagged(
      {
        name: "reconciliation",
        result: "fail",
        detail: `claimed outcome ("${entry.claimedOutcome}") reports the bill as resolved. The ledger's actual decision is '${entry.decision}' — nothing has been paid yet. Caught by scheduled reconciliation against ground truth, not because anything looked wrong at the time it was sent.`,
        controlTag: CONTROL_TAGS.reconciliation,
      },
      "human"
    );
  }
  return tagged(
    {
      name: "reconciliation",
      result: "pass",
      detail: "claimed outcome matches the ledger's actual decision — no divergence found on this reconciliation pass.",
      controlTag: CONTROL_TAGS.reconciliation,
    },
    "human"
  );
}

// Illustrative per-action model-cost line item for the budget gauge.
// Deterministic-ish so demo runs are easy to narrate, same as the source.
export function estimateModelCost(actionType: string, amount: number): number {
  const base = actionType === "bill_approval" ? 0.008 : 0.014;
  const complexity = Math.min(amount / 100000, 1) * 0.006;
  return Number((base + complexity).toFixed(4));
}

// Seed data: a small QuickBooks bill queue. One vendor on hold, one
// duplicate bill already planted in the queue (B-105 mirrors B-101 exactly)
// — same shape as ap-exception's reference seed, new SMB-flavored IDs.
export const SEED_VENDORS: Record<string, Vendor> = {
  "V-1": { id: "V-1", name: "Ridgeline Office Supplies", status: "active" },
  "V-2": { id: "V-2", name: "Cascade Bookkeeping Services", status: "active" },
  "V-3": { id: "V-3", name: "Harbor Fleet Maintenance", status: "hold" },
};

export const SEED_BILLS: Record<string, Bill> = {
  "B-101": { id: "B-101", vendorId: "V-1", amount: 450, terms: "Net 30", date: "2026-09-02", status: "open" },
  "B-102": { id: "B-102", vendorId: "V-2", amount: 3200, terms: "Net 15", date: "2026-09-05", status: "open" },
  "B-103": { id: "B-103", vendorId: "V-1", amount: 18000, terms: "Net 30", date: "2026-09-08", status: "open" },
  "B-104": { id: "B-104", vendorId: "V-3", amount: 1500, terms: "Net 30", date: "2026-09-09", status: "open" },
  // Same vendor, amount, and date as B-101 on purpose — this is the
  // duplicate-bill scenario's setup. It only reads as a duplicate once
  // B-101 has actually been paid in this session (scenario 1 first).
  "B-105": { id: "B-105", vendorId: "V-1", amount: 450, terms: "Net 30", date: "2026-09-02", status: "open" },
};

export function cloneSeed() {
  return {
    vendors: structuredClone(SEED_VENDORS),
    bills: structuredClone(SEED_BILLS),
  };
}
