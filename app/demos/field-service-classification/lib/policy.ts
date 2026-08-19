// Governed write-path policy for the field-service billable-classification
// demo. A genuinely different governance shape from the other two demos:
// capital-equipment-order gates on a STATE TRANSITION (has the material
// been finalized, has procurement committed) and ap-exception-workflow
// gates on a DOLLAR THRESHOLD (spend ladder). This domain's real risk
// dimension is INTERPRETATION -- the dollar amount on a service call isn't
// the issue, whether the contract-coverage classification itself is
// correct is. Modeled on a real SAP Plant Maintenance/Customer Service
// field-service pattern at a semiconductor capital-equipment manufacturer.
// See ~/SecondBrain/TiogaAI/sales/case-study-semiconductor-capital-equipment-sap-oracle-governance.md
// pattern 5 for the source framing and the honesty rule governing how this
// composite scenario is described (illustrative, not a real named client
// engagement -- and pattern 5 itself is explicit that its classification
// approach is Tioga's own composite reasoning, not a source-documented
// resolution).

export const AUTHORIZED_ACTION_TYPES = new Set(["classify_no_charge", "classify_billable", "split_classification"]);

// A service call within this many days of the covering contract's
// expiration or renewal date is treated as a timing edge case -- which
// contract term actually governs the call isn't mechanical close to the
// boundary, so it routes to a human rather than resolving automatically.
export const BOUNDARY_WINDOW_DAYS = 7;

export const CONTROL_TAGS = {
  scope: "NIST AI RMF GOVERN-1.5 — documented authorities & scope",
  interpretation: "NIST AI RMF MANAGE-1.3 — risk response & escalation",
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

export interface Contract {
  id: string;
  customer: string;
  tier: string;
  status: "active" | "expired";
  coveredServiceTypes: string[];
  // Service types where the contract's own language doesn't clearly
  // resolve covered-failure vs. excluded-wear-item for this customer --
  // e.g. a chamber-liner failure at month 14 of a 36-month agreement.
  scopeAmbiguousTypes: string[];
}

export interface ServiceCall {
  id: string;
  customer: string;
  toolId: string;
  contractId: string;
  serviceType: string;
  serviceTypeLabel: string;
  description: string;
  partsCost: number;
  laborHours: number;
  laborRate: number;
  // Same visit touched a contract-covered item and a separate, uncovered
  // item -- a single no-charge/billable classification can't represent it.
  mixedVisit: boolean;
  // An active manufacturer warranty claim is already logged against this
  // call in the system -- billing it directly bypasses that resolution
  // path entirely, distinct from a normal billable classification.
  activeWarrantyClaim: boolean;
  // Days from the covering contract's nearest boundary (negative = before
  // expiration, positive = after renewal); null if not near a boundary.
  daysFromContractBoundary: number | null;
  status: "open" | "classified_no_charge" | "classified_billable" | "split";
  // The authoritative SAP coverage determination for this exact call --
  // independent of, and finer-grained than, the contract-level
  // coveredServiceTypes category list the policy layer consults. This is
  // what the ERP-layer backstop checks, mirroring the other two demos'
  // independent-validation pattern (a credit hold, committed procurement
  // that the policy layer doesn't and shouldn't need to know about).
  sapCoverageRecord: { covered: boolean; reason: string };
}

export interface LedgerEntry {
  actionId: string;
  timestamp: string;
  callId: string;
  actionType: string;
  detail: string;
  actor: string;
  modelCostUsd: number;
  policyChecks: PolicyCheck[];
  decision: "pending" | "pending_approval" | "executed" | "blocked" | "rolled_back";
  blockedReason?: string;
  erpResult?: { accepted: boolean; errors?: string[] };
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
      detail: `'${actionType}' is not in the authorized action set (${Array.from(AUTHORIZED_ACTION_TYPES).join(", ")}) — this agent has no path to execute it, governed or otherwise. Waiving a billable charge is exactly this case: it isn't a smaller version of a no-charge classification, it's a different, unauthorized action entirely, since it creates financial exposure with no contract basis to point to.`,
      controlTag: CONTROL_TAGS.scope,
    },
    "gateway"
  );
}

// A hard, state-based block independent of the scope check above: a call
// already carrying an active manufacturer warranty claim never has a path
// to direct billing, regardless of who's asking or how routine the rest
// of the call looks -- it has to resolve through warranty-claim handling
// first, not through the billable-classification path at all.
export function evaluateWarrantyLock(call: ServiceCall, actionType: string): PolicyCheck {
  if (call.activeWarrantyClaim && actionType !== "classify_no_charge") {
    return tagged(
      {
        name: "warranty_claim_lock",
        result: "fail",
        detail: `${call.id} already has an active manufacturer warranty claim logged in the system — billing it directly isn't a smaller version of the billable-classification path, it's a different, disallowed action while that claim is open. Route through warranty-claim resolution instead.`,
        controlTag: CONTROL_TAGS.scope,
        route: "blocked",
      },
      "gateway"
    );
  }
  return tagged(
    { name: "warranty_claim_lock", result: "pass", detail: `no active warranty claim blocks classification of ${call.id}`, controlTag: CONTROL_TAGS.scope },
    "gateway"
  );
}

// The real interpretation-risk decision point: is this classification
// clear-cut enough to auto-execute, or does it need a named service
// manager's judgment first?
export function evaluateClassification(call: ServiceCall, contract: Contract, actionType: string): PolicyCheck {
  if (actionType === "split_classification") {
    return tagged(
      {
        name: "classification",
        result: "escalate",
        detail: `${call.id}'s billing has to be apportioned between the covered and uncovered work performed in the same visit — that always requires a named service manager to set the actual split, never a single auto no-charge or billable classification.`,
        controlTag: CONTROL_TAGS.interpretation,
        route: "human_approval",
      },
      "gateway"
    );
  }

  if (call.mixedVisit) {
    return tagged(
      {
        name: "classification",
        result: "escalate",
        detail: `${call.id} touched both a contract-covered component and a separate uncovered item in the same visit — a single '${actionType}' classification can't represent that. Needs split_classification and a named service manager's sign-off instead.`,
        controlTag: CONTROL_TAGS.interpretation,
        route: "human_approval",
      },
      "gateway"
    );
  }

  if (call.daysFromContractBoundary !== null && Math.abs(call.daysFromContractBoundary) <= BOUNDARY_WINDOW_DAYS) {
    const side = call.daysFromContractBoundary < 0 ? "expiration" : "renewal";
    return tagged(
      {
        name: "classification",
        result: "escalate",
        detail: `${call.id}'s service date falls within ${BOUNDARY_WINDOW_DAYS} days of ${contract.id}'s ${side} — a timing edge case on which contract term actually governs the call, routed to a named service manager rather than resolved automatically.`,
        controlTag: CONTROL_TAGS.interpretation,
        route: "human_approval",
      },
      "gateway"
    );
  }

  if (contract.scopeAmbiguousTypes.includes(call.serviceType)) {
    return tagged(
      {
        name: "classification",
        result: "escalate",
        detail: `${contract.id}'s language doesn't clearly resolve whether '${call.serviceTypeLabel}' is a covered failure or an excluded wear item for ${call.id} — routed to a named service manager rather than guessed.`,
        controlTag: CONTROL_TAGS.interpretation,
        route: "human_approval",
      },
      "gateway"
    );
  }

  const isCovered = contract.status === "active" && contract.coveredServiceTypes.includes(call.serviceType);
  if (actionType === "classify_no_charge" && isCovered) {
    return tagged(
      {
        name: "classification",
        result: "pass",
        detail: `${contract.id} is active and explicitly covers '${call.serviceTypeLabel}' — a clear-cut, recurring service pattern, auto-executes as no-charge.`,
        controlTag: CONTROL_TAGS.interpretation,
        route: "auto",
      },
      "gateway"
    );
  }
  if (actionType === "classify_billable" && !isCovered) {
    return tagged(
      {
        name: "classification",
        result: "pass",
        detail: `'${call.serviceTypeLabel}' is outside ${contract.id}'s covered scope (or the contract isn't active) — unambiguous, auto-executes as billable T&M.`,
        controlTag: CONTROL_TAGS.interpretation,
        route: "auto",
      },
      "gateway"
    );
  }
  return tagged(
    {
      name: "classification",
      result: "escalate",
      detail: `proposed '${actionType}' for ${call.id} doesn't match what ${contract.id}'s coverage list would suggest for '${call.serviceTypeLabel}' — routed to a named service manager to resolve the discrepancy rather than let a mismatched guess execute unattended.`,
      controlTag: CONTROL_TAGS.interpretation,
      route: "human_approval",
    },
    "gateway"
  );
}

// ERP-layer validation, independent of the policy layer above -- mirrors
// the other two demos' independent-validation pattern (a vendor credit
// hold, committed procurement contradicting a finalize). Here: policy can
// approve a classification based on the contract's category-level coverage
// list, and the ERP's own authoritative, call-specific coverage record can
// still catch a state the policy check didn't and shouldn't need to know
// about -- e.g. a contract placed on billing hold for non-payment before
// this call, which the generic covered-service-type list doesn't reflect.
export function validateErpCoverage(call: ServiceCall, proposedClassification: "no_charge" | "billable"): { accepted: boolean; errors: string[] } {
  const errors: string[] = [];
  if (proposedClassification === "no_charge" && !call.sapCoverageRecord.covered) {
    errors.push(`SAP's authoritative coverage record for ${call.id} shows NOT covered (${call.sapCoverageRecord.reason}) — contradicts the proposed no-charge classification`);
  }
  if (proposedClassification === "billable" && call.sapCoverageRecord.covered) {
    errors.push(`SAP's authoritative coverage record for ${call.id} shows covered (${call.sapCoverageRecord.reason}) — contradicts the proposed billable classification`);
  }
  if (errors.length > 0) return { accepted: false, errors };
  return { accepted: true, errors: [] };
}

// A split apportions dollars rather than asserting a single covered/not-
// covered claim, so there's no single-classification contradiction for the
// ERP layer to catch here -- it's still re-validated through the same
// sanctioned write path, never a raw table write, for audit consistency.
export function validateErpSplit(): { accepted: boolean; errors: string[] } {
  return { accepted: true, errors: [] };
}

export function erpCheck(result: { accepted: boolean; errors: string[] }, latencyMs: number): PolicyCheck {
  return tagged(
    {
      name: "erp_validation",
      result: result.accepted ? "pass" : "fail",
      detail: result.accepted
        ? "ERP accepted the classification through the application-logic layer"
        : `ERP rejected: ${result.errors.join("; ")}`,
      controlTag: CONTROL_TAGS.erpValidation,
      latencyMs,
    },
    "erp"
  );
}

export function estimateModelCost(actionType: string): number {
  const base: Record<string, number> = { classify_no_charge: 0.007, classify_billable: 0.007, split_classification: 0.011, waive_billable_charge: 0.005 };
  return base[actionType] ?? 0.007;
}

// Seed: a field-service billable-classification queue at a semiconductor
// capital-equipment manufacturer's installed base. Illustrative composite
// scenario, not real client data — see the source case study's honesty
// rule. Each call below is the dedicated target of exactly one canned
// scenario in page.tsx, so scenarios stay independent of click order (same
// independence discipline as the other two demos' seed data).
export const SEED_CONTRACTS: Record<string, Contract> = {
  "CT-501": { id: "CT-501", customer: "Fab Customer A", tier: "Full Coverage", status: "active", coveredServiceTypes: ["scheduled_pm_tuneup", "rf_generator_repair", "vacuum_pump_replacement", "mfc_calibration"], scopeAmbiguousTypes: [] },
  "CT-502": { id: "CT-502", customer: "Fab Customer B", tier: "Full Coverage", status: "active", coveredServiceTypes: ["scheduled_pm_tuneup", "rf_generator_repair"], scopeAmbiguousTypes: [] },
  "CT-503": { id: "CT-503", customer: "Fab Customer C", tier: "Full Coverage (36-month)", status: "active", coveredServiceTypes: ["scheduled_pm_tuneup", "rf_generator_repair", "vacuum_pump_replacement"], scopeAmbiguousTypes: ["chamber_liner_replacement"] },
  "CT-504": { id: "CT-504", customer: "Fab Customer D", tier: "Full Coverage", status: "active", coveredServiceTypes: ["scheduled_pm_tuneup", "rf_generator_repair", "vacuum_pump_replacement"], scopeAmbiguousTypes: [] },
  "CT-505": { id: "CT-505", customer: "Fab Customer E", tier: "Full Coverage", status: "active", coveredServiceTypes: ["scheduled_pm_tuneup", "rf_generator_repair", "vacuum_pump_replacement"], scopeAmbiguousTypes: [] },
  "CT-506": { id: "CT-506", customer: "Fab Customer F", tier: "Parts & Labor", status: "active", coveredServiceTypes: ["scheduled_pm_tuneup", "rf_generator_repair"], scopeAmbiguousTypes: [] },
  "CT-507": { id: "CT-507", customer: "Fab Customer G", tier: "Full Coverage", status: "active", coveredServiceTypes: ["scheduled_pm_tuneup", "rf_generator_repair"], scopeAmbiguousTypes: [] },
  "CT-508": { id: "CT-508", customer: "Fab Customer H", tier: "Full Coverage", status: "active", coveredServiceTypes: ["scheduled_pm_tuneup", "rf_generator_repair", "vacuum_pump_replacement"], scopeAmbiguousTypes: [] },
};

export const SEED_CALLS: Record<string, ServiceCall> = {
  "SVC-3301": {
    id: "SVC-3301", customer: "Fab Customer A", toolId: "ETCH-A-07", contractId: "CT-501",
    serviceType: "scheduled_pm_tuneup", serviceTypeLabel: "Scheduled PM tune-up",
    description: "Routine quarterly preventive-maintenance tune-up on an etch chamber — no anomalies found.",
    partsCost: 0, laborHours: 3, laborRate: 185, mixedVisit: false, activeWarrantyClaim: false, daysFromContractBoundary: null,
    status: "open", sapCoverageRecord: { covered: true, reason: "matches CT-501's standard quarterly PM entitlement" },
  },
  "SVC-3302": {
    id: "SVC-3302", customer: "Fab Customer B", toolId: "DEP-B-03", contractId: "CT-502",
    serviceType: "contamination_cleanup", serviceTypeLabel: "Chamber contamination cleanup",
    description: "Customer's own process excursion left photoresist residue in the chamber — cleanup requested outside any covered-failure category.",
    partsCost: 1200, laborHours: 6, laborRate: 195, mixedVisit: false, activeWarrantyClaim: false, daysFromContractBoundary: null,
    status: "open", sapCoverageRecord: { covered: false, reason: "customer-caused contamination is explicitly excluded, not a covered failure" },
  },
  "SVC-3303": {
    id: "SVC-3303", customer: "Fab Customer C", toolId: "DEP-C-01", contractId: "CT-503",
    serviceType: "chamber_liner_replacement", serviceTypeLabel: "Chamber liner replacement",
    description: "Chamber-liner failure at month 14 of CT-503's 36-month Full Coverage agreement on a $2.6M deposition tool — the contract's language doesn't clearly resolve 'normal wear' (excluded) vs. 'covered failure' (included) for a liner at this age.",
    partsCost: 18400, laborHours: 12, laborRate: 195, mixedVisit: false, activeWarrantyClaim: false, daysFromContractBoundary: null,
    status: "open", sapCoverageRecord: { covered: true, reason: "pending manual review — no authoritative determination recorded yet" },
  },
  "SVC-3304": {
    id: "SVC-3304", customer: "Fab Customer D", toolId: "ETCH-D-02", contractId: "CT-504",
    serviceType: "rf_generator_repair", serviceTypeLabel: "RF generator repair",
    description: "RF generator fault repaired 3 days before CT-504's annual renewal took effect — a timing edge case on which contract term actually governs the call.",
    partsCost: 6800, laborHours: 8, laborRate: 195, mixedVisit: false, activeWarrantyClaim: false, daysFromContractBoundary: -3,
    status: "open", sapCoverageRecord: { covered: true, reason: "covered once the renewal is confirmed effective, pending manual timing review" },
  },
  "SVC-3305": {
    id: "SVC-3305", customer: "Fab Customer E", toolId: "ETCH-E-05", contractId: "CT-505",
    serviceType: "vacuum_pump_replacement", serviceTypeLabel: "Vacuum pump replacement + throughput upgrade",
    description: "Same visit replaced a covered vacuum pump and performed a customer-requested throughput upgrade that CT-505 doesn't cover — one classification can't represent both.",
    partsCost: 9300, laborHours: 10, laborRate: 195, mixedVisit: true, activeWarrantyClaim: false, daysFromContractBoundary: null,
    status: "open", sapCoverageRecord: { covered: true, reason: "only the pump-replacement portion is covered; the upgrade portion is not — needs a split, not a single record" },
  },
  "SVC-3306": {
    id: "SVC-3306", customer: "Fab Customer F", toolId: "DEP-F-04", contractId: "CT-506",
    serviceType: "rf_generator_repair", serviceTypeLabel: "RF generator repair",
    description: "RF generator failure already logged as an open manufacturer warranty claim (claim #WC-2291) — billing this call directly would bypass the warranty-claim resolution process entirely.",
    partsCost: 5200, laborHours: 5, laborRate: 195, mixedVisit: false, activeWarrantyClaim: true, daysFromContractBoundary: null,
    status: "open", sapCoverageRecord: { covered: false, reason: "not a contract-coverage question at all while claim WC-2291 is open" },
  },
  "SVC-3307": {
    id: "SVC-3307", customer: "Fab Customer G", toolId: "ETCH-G-08", contractId: "CT-507",
    serviceType: "contamination_cleanup", serviceTypeLabel: "Chamber contamination cleanup",
    description: "Customer-caused contamination, billable T&M under CT-507 — a request comes in to waive the charge as a goodwill gesture even though the contract gives no basis for that.",
    partsCost: 950, laborHours: 4, laborRate: 195, mixedVisit: false, activeWarrantyClaim: false, daysFromContractBoundary: null,
    status: "open", sapCoverageRecord: { covered: false, reason: "customer-caused, excluded" },
  },
  "SVC-3308": {
    id: "SVC-3308", customer: "Fab Customer H", toolId: "DEP-H-06", contractId: "CT-508",
    serviceType: "rf_generator_repair", serviceTypeLabel: "RF generator repair",
    description: "RF generator repair matches CT-508's generic covered-service-type list — but CT-508 was placed on a billing hold for non-payment before this call, a fact the category-level contract terms don't reflect.",
    partsCost: 7100, laborHours: 7, laborRate: 195, mixedVisit: false, activeWarrantyClaim: false, daysFromContractBoundary: null,
    status: "open", sapCoverageRecord: { covered: false, reason: "CT-508 was placed on a billing hold for non-payment prior to this service call — coverage entitlement is suspended in SAP even though the category-level contract terms still list this service type as included" },
  },
};

export function cloneSeed() {
  return { calls: structuredClone(SEED_CALLS), contracts: structuredClone(SEED_CONTRACTS) };
}
