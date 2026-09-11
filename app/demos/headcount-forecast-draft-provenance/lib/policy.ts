// Headcount-forecast draft policy + synthetic data for this demo.
//
// The governance shape here is the FP&A analog of the other two demos in
// this series: those gate a proposed ACTION or a field entering a CONTEXT
// WINDOW; this one gates a proposed PLAN. An agent drafts changes to a
// headcount/comp/burden budget into a DRAFT version only — it never writes
// to a locked/approved version. Every changed cell carries the source data
// that justifies it and the stated assumption behind the number, so a
// hallucinated figure is falsifiable against a named input rather than
// asserted as fact. A subset of lines are flagged as feeding a
// management-review-control-sensitive forecast (goodwill impairment,
// going-concern cash flow, deferred-tax valuation allowance) — those are
// the SOX-adjacent lines, not just routine planning. See
// ~/SecondBrain/TiogaAI/strategy/2026-09-11-hris-wfm-fpa-expertise-positioning.md
// §1 (Adaptive Planning) and §5 item 3 for the framing this demo builds to.
//
// 100% SYNTHETIC DATA. The company, its five departments, the current
// approved budget, and every "source data" input referenced below (Q2 2026
// attrition actuals, a department hiring request, comp guidelines, a
// benefits-renewal notice, an ops hiring-freeze memo) are invented for this
// demo. None of it is connected to, sourced from, or shaped against any
// real Workday Adaptive Planning tenant, sandbox, or export — Tioga has no
// Adaptive Planning vendor credentials. Workday Adaptive Planning sandboxes
// come bundled with a customer license Tioga doesn't have (per the
// strategy doc's own framing), so this is built against the product's
// publicly documented import/API shape, not a live tenant. Nothing here
// ever calls a real Workday/Adaptive Planning API, and nothing in this demo
// posts anywhere — nothing leaves draft status, even hypothetically.

export const PLAN_LABEL = "FY2027 Q1 Headcount Plan — Draft v3 (not locked)";
export const APPROVED_LABEL = "FY2027 Approved Budget (current)";

export type Department = "Engineering" | "Sales" | "Customer Support" | "Manufacturing & Ops" | "G&A";

export interface ApprovedLine {
  department: Department;
  fte: number;
  avgComp: number; // fully-loaded base salary/OTE midpoint, annualized
  burdenRate: number; // decimal, e.g. 0.32
}

// The current approved budget — the version this draft is compared against.
// Nothing below is ever mutated; the draft always diffs against this.
export const APPROVED_BUDGET: ApprovedLine[] = [
  { department: "Engineering", fte: 42, avgComp: 145000, burdenRate: 0.32 },
  { department: "Sales", fte: 18, avgComp: 110000, burdenRate: 0.28 },
  { department: "Customer Support", fte: 25, avgComp: 68000, burdenRate: 0.3 },
  { department: "Manufacturing & Ops", fte: 60, avgComp: 58000, burdenRate: 0.35 },
  { department: "G&A", fte: 15, avgComp: 95000, burdenRate: 0.3 },
];

export function approvedLine(department: Department): ApprovedLine {
  const line = APPROVED_BUDGET.find((l) => l.department === department);
  if (!line) throw new Error(`No approved line for ${department}`);
  return line;
}

// Fully-loaded annualized cost for one line: fte * avgComp * (1 + burdenRate).
export function lineCost(line: { fte: number; avgComp: number; burdenRate: number }): number {
  return line.fte * line.avgComp * (1 + line.burdenRate);
}

export function approvedTotal(): number {
  return APPROVED_BUDGET.reduce((sum, l) => sum + lineCost(l), 0);
}

export type MrcHook = "goodwill-impairment" | "going-concern-cash-flow" | "deferred-tax-valuation-allowance" | null;

export const MRC_HOOK_LABEL: Record<Exclude<MrcHook, null>, string> = {
  "goodwill-impairment": "Feeds a goodwill-impairment test",
  "going-concern-cash-flow": "Feeds a going-concern cash-flow forecast",
  "deferred-tax-valuation-allowance": "Feeds a deferred-tax valuation-allowance forecast",
};

export interface DraftProposal {
  id: string;
  department: Department;
  fieldChanged: "fte" | "avgComp" | "burdenRate";
  fieldLabel: string;
  proposed: { fte: number; avgComp: number; burdenRate: number };
  // The named source data the agent used to justify this number — the
  // anti-hallucination hook: traceable to a named input, not asserted.
  sourceData: string;
  // The stated assumption behind the number — the second half of the
  // anti-hallucination hook. Every number here has both a source and an
  // assumption; neither is optional.
  assumption: string;
  mrcHook: MrcHook;
  mrcDetail: string | null;
  // What the human reviewer actually decided during this draft's review
  // pass — a completed, logged review, not a live decision.
  defaultDecision: "approved" | "rejected";
  reviewerNote?: string;
}

export const DRAFT_PROPOSALS: DraftProposal[] = [
  {
    id: "eng-backfill",
    department: "Engineering",
    fieldChanged: "fte",
    fieldLabel: "Headcount (FTE)",
    proposed: { fte: 43, avgComp: 145000, burdenRate: 0.32 },
    sourceData:
      "Q2 2026 attrition actuals — Engineering: 3 departures, 2 already backfilled, 1 open requisition on file (REQ-2027-ENG-014).",
    assumption:
      "Backfill completes within 45 days of the attrition date, hired at the departing employee's comp-band midpoint ($145K); no burden-rate change.",
    mrcHook: null,
    mrcDetail: null,
    defaultDecision: "approved",
  },
  {
    id: "sales-expansion",
    department: "Sales",
    fieldChanged: "fte",
    fieldLabel: "Headcount (FTE)",
    proposed: { fte: 21, avgComp: 110000, burdenRate: 0.28 },
    sourceData:
      "Sales Dept. Hiring Request HR-2027-03 (VP Sales, submitted 2026-08-15) — 3 net-new Account Executive requisitions for Q1 FY27 territory expansion.",
    assumption:
      "New hires ramp to full quota productivity within 90 days; hired at the $110K OTE midpoint; no change to the current 28% burden rate.",
    mrcHook: "goodwill-impairment",
    mrcDetail:
      "Sales is a reporting unit carrying goodwill from a prior acquisition; its headcount-cost trajectory is a direct input to the FY2026 Q4 goodwill-impairment test's cash-flow forecast for that unit — this line doesn't just plan headcount, it feeds a number an auditor will scrutinize.",
    defaultDecision: "approved",
  },
  {
    id: "support-merit",
    department: "Customer Support",
    fieldChanged: "avgComp",
    fieldLabel: "Average comp (annualized)",
    proposed: { fte: 25, avgComp: 70720, burdenRate: 0.3 },
    sourceData: "FY2027 Comp Guidelines — Merit Increase Matrix, Support/CS band: 4.0% company-wide merit pool.",
    assumption: "The 4.0% merit increase applies uniformly across all 25 current Support FTEs effective Q1 FY27; no change to headcount or burden rate.",
    mrcHook: null,
    mrcDetail: null,
    defaultDecision: "approved",
  },
  {
    id: "ops-reduction",
    department: "Manufacturing & Ops",
    fieldChanged: "fte",
    fieldLabel: "Headcount (FTE)",
    proposed: { fte: 58, avgComp: 58000, burdenRate: 0.35 },
    sourceData:
      "Ops Hiring-Freeze Memo (2026-08-01) + Q2 2026 attrition actuals: 2 line-technician departures, no backfill approved pending automation-line completion (Project Sable).",
    assumption:
      "No backfill through Q1 FY27; Project Sable's automation line fully offsets the lost capacity by the start of the quarter; burden rate unchanged at 35%.",
    mrcHook: "going-concern-cash-flow",
    mrcDetail:
      "Manufacturing & Ops labor-cost trajectory is a named input to the going-concern cash-flow forecast under review with the FY2026 audit, given an active covenant-headroom review — an over-optimistic automation-offset assumption here would understate a cash-flow forecast that genuinely feeds that assessment.",
    defaultDecision: "rejected",
    reviewerNote:
      "FP&A Director rejected: Project Sable's automation line is not yet at full capacity per the latest Ops status update, so 'fully offsets by start of quarter' is not yet supportable. Sent back for a revised assumption tied to the actual automation-line ramp schedule before this line re-enters draft.",
  },
  {
    id: "ga-burden",
    department: "G&A",
    fieldChanged: "burdenRate",
    fieldLabel: "Burden rate",
    proposed: { fte: 15, avgComp: 95000, burdenRate: 0.32 },
    sourceData: "Benefits Renewal Notice (2026-07-20) — health/dental premium increase effective the 2027 plan year.",
    assumption: "The 2-point burden-rate increase applies uniformly to all current G&A headcount; no other G&A comp or headcount change.",
    mrcHook: "deferred-tax-valuation-allowance",
    mrcDetail:
      "G&A cost trajectory is one input to the multi-year profitability forecast supporting the deferred-tax valuation-allowance assessment — a routine-looking burden-rate tick still lands inside a forecast that has real financial-statement consequences if it's wrong.",
    defaultDecision: "approved",
  },
];

export function defaultDecisions(): Record<string, "approved" | "rejected"> {
  return Object.fromEntries(DRAFT_PROPOSALS.map((p) => [p.id, p.defaultDecision]));
}

// The effective line for a department given the current reviewer decisions:
// the proposed values if approved, the untouched approved-budget values if
// rejected (or if no proposal touches that department at all).
export function effectiveLine(
  department: Department,
  decisions: Record<string, "approved" | "rejected">
): ApprovedLine {
  const base = approvedLine(department);
  const proposal = DRAFT_PROPOSALS.find((p) => p.department === department);
  if (!proposal || decisions[proposal.id] !== "approved") return base;
  return { department, ...proposal.proposed };
}

export function draftTotal(decisions: Record<string, "approved" | "rejected">): number {
  return APPROVED_BUDGET.reduce((sum, l) => sum + lineCost(effectiveLine(l.department, decisions)), 0);
}
