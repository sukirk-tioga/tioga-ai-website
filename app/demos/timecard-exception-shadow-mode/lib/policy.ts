// Shadow-mode policy + synthetic data for the timecard-exception demo.
//
// This applies offer #11's existing "shadow-mode before cutover" delivery
// standard — an agent proposes, never auto-executes, runs for a defined
// window, and cutover to live execution is gated on measured agreement
// between what it proposed and what a human reviewer actually decided, not
// a calendar date — to a payroll/timecard write path instead of an ERP
// write path. See sales/proposals/11-agent-ready-erp-diagnostic.md,
// "Delivery standard: shadow-mode before cutover." Every proposal below is
// logged only; nothing here ever executes a real payroll write.
//
// 100% SYNTHETIC DATA. Every employee, punch, and exception below is
// invented for this demo. None of it is connected to, sourced from, or
// shaped against any real UKG tenant, sandbox, or export — Tioga has no
// UKG vendor credentials or sandbox access. The FLSA/state wage-and-hour
// rules cited are real statutes/regulations, cited illustratively to show
// the *class* of check a timecard-exception agent should run — this is not
// legal advice and not a substitute for counsel on any real pay decision.

export const PAY_PERIOD_LABEL = "Aug 17–28, 2026 (Pay Period 18)";

// The pay period's 10 weekdays (two full workweeks), generated the same
// way as a real biweekly payroll calendar would enumerate them.
export const PAY_PERIOD_WEEKDAYS = (() => {
  const days: string[] = [];
  const d = new Date(Date.UTC(2026, 7, 17)); // 2026-08-17, a Monday
  while (days.length < 10) {
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) days.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
})();

export type WorkState = "CA" | "TX";

export interface Employee {
  id: string;
  name: string;
  state: WorkState;
}

export const EMPLOYEES: Employee[] = [
  { id: "E-101", name: "Sarah Kim", state: "CA" },
  { id: "E-102", name: "Tom Reyes", state: "TX" },
  { id: "E-103", name: "Angela Brooks", state: "CA" },
  { id: "E-104", name: "Marcus Webb", state: "CA" },
  { id: "E-105", name: "Devon Price", state: "TX" },
  { id: "E-106", name: "Linda Ostrowski", state: "CA" },
];

export interface PunchDay {
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  hoursWorked: number;
  exceptionId: string | null;
}

// Overrides on top of a clean 8:00–16:00 (8h) schedule — one exception per
// employee, spread across the two-week window, each tied to a proposal
// below via `exceptionId`.
const PUNCH_OVERRIDES: Record<string, Partial<PunchDay> & { exceptionId: string }> = {
  "E-101|2026-08-18": { clockIn: "08:06", clockOut: "16:00", hoursWorked: 7.9, exceptionId: "late-punch-101" },
  "E-102|2026-08-19": { clockIn: "08:00", clockOut: null, hoursWorked: 8, exceptionId: "missed-punch-102" },
  "E-103|2026-08-20": { clockIn: "08:00", clockOut: "17:45", hoursWorked: 9.75, exceptionId: "unapproved-ot-103" },
  "E-104|2026-08-21": { clockIn: "08:00", clockOut: "14:12", hoursWorked: 6.2, exceptionId: "meal-break-104" },
  "E-105|2026-08-24": { clockIn: null, clockOut: null, hoursWorked: 8, exceptionId: "pto-105" },
  "E-106|2026-08-25": { clockIn: "08:00", clockOut: "17:30", hoursWorked: 9.5, exceptionId: "daily-ot-106" },
  "E-101|2026-08-26": { clockIn: "07:58", clockOut: "16:00", hoursWorked: 8, exceptionId: "duplicate-punch-101" },
  "E-102|2026-08-27": { clockIn: "08:22", clockOut: "16:00", hoursWorked: 7.6, exceptionId: "late-punch-grace-102" },
};

export const PUNCH_TABLE: PunchDay[] = EMPLOYEES.flatMap((e) =>
  PAY_PERIOD_WEEKDAYS.map((date) => {
    const key = `${e.id}|${date}`;
    const override = PUNCH_OVERRIDES[key];
    return {
      employeeId: e.id,
      date,
      clockIn: override?.clockIn ?? "08:00",
      clockOut: override?.clockOut ?? "16:00",
      hoursWorked: override?.hoursWorked ?? 8,
      exceptionId: override?.exceptionId ?? null,
    };
  })
);

export type ReviewingRole = "auto_approvable" | "payroll_manager";

export interface Proposal {
  id: string;
  employeeId: string;
  date: string;
  exceptionLabel: string;
  proposedAction: string;
  // The named payroll-cycle control that authorizes this proposal — the
  // SOX-adjacent hook: a control an auditor can look up, not an
  // unstated judgment call.
  authorizationBasis: string;
  // The specific FLSA/state wage-and-hour rule the agent checked this
  // proposal against, illustrative only (not legal advice).
  statutoryCheck: string;
  reviewingRole: ReviewingRole;
  reviewingRoleDetail: string;
  // What the human reviewer actually did during the shadow-mode window —
  // this is a completed, logged review window, not a live decision.
  defaultDecision: "accepted" | "overridden";
  overrideNote?: string;
}

export const PROPOSALS: Proposal[] = [
  {
    id: "late-punch-101",
    employeeId: "E-101",
    date: "2026-08-18",
    exceptionLabel: "Late punch (6 min)",
    proposedAction: "Apply standard rounding: treat the 8:06am punch as an 8:00am start.",
    authorizationBasis: "PC-2: Punch Rounding Rule (Payroll Cycle Control)",
    statutoryCheck: "29 CFR § 785.48(b) — rounding practice must average out and not consistently favor the employer; a 6-minute round is within the policy's ±7-minute grace window.",
    reviewingRole: "auto_approvable",
    reviewingRoleDetail: "Auto-approvable — rounding within the ±7-minute grace window, no pay impact.",
    defaultDecision: "accepted",
  },
  {
    id: "missed-punch-102",
    employeeId: "E-102",
    date: "2026-08-19",
    exceptionLabel: "Missed punch (no clock-out)",
    proposedAction: "Flag for manager review to confirm the actual clock-out time before the timecard is finalized.",
    authorizationBasis: "PC-3: Missed Punch Resolution (Payroll Cycle Control)",
    statutoryCheck: "29 CFR § 516.2 — employers must maintain an accurate record of hours worked; a missing punch can't be reconstructed by the agent alone.",
    reviewingRole: "payroll_manager",
    reviewingRoleDetail: "Requires Payroll Manager sign-off — reconstructing missing hours is never auto-approvable.",
    defaultDecision: "accepted",
  },
  {
    id: "unapproved-ot-103",
    employeeId: "E-103",
    date: "2026-08-20",
    exceptionLabel: "Unapproved overtime (9.75h, no pre-approval on file)",
    proposedAction: "Approve and pay the full 9.75 hours as worked, including 1.75h overtime; separately flag the missing pre-approval for manager follow-up.",
    authorizationBasis: "PC-4: Unauthorized Overtime Review (Payroll Cycle Control)",
    statutoryCheck: "29 U.S.C. § 207(a) (FLSA overtime) — overtime for hours actually worked over 40/week must be paid regardless of whether it was pre-authorized; lack of authorization is a policy matter, not a basis to withhold pay.",
    reviewingRole: "payroll_manager",
    reviewingRoleDetail: "Requires Payroll Manager sign-off — pay-and-flag decisions on unauthorized OT are never auto-approvable.",
    defaultDecision: "accepted",
  },
  {
    id: "meal-break-104",
    employeeId: "E-104",
    date: "2026-08-21",
    exceptionLabel: "Missed meal break (CA, 6.2h shift, no break logged before hour 5)",
    proposedAction: "Apply a one-hour meal-break premium at the employee's regular rate.",
    authorizationBasis: "PC-5: California Meal-Break Premium Assessment (Payroll Cycle Control)",
    statutoryCheck: "Cal. Lab. Code § 226.7 / IWC Wage Order 4-2001 §11 — a missed, short, or late meal period on a shift over 5 hours triggers one additional hour of pay at the regular rate.",
    reviewingRole: "payroll_manager",
    reviewingRoleDetail: "Requires Payroll Manager sign-off — premium pay is always reviewed, never auto-approved.",
    defaultDecision: "accepted",
  },
  {
    id: "pto-105",
    employeeId: "E-105",
    date: "2026-08-24",
    exceptionLabel: "PTO request (8h, submitted before pay-period lock)",
    proposedAction: "Approve the PTO request as-is; accrued balance covers the request.",
    authorizationBasis: "PC-6: PTO Balance Verification (Payroll Cycle Control)",
    statutoryCheck: "No FLSA or state wage-and-hour statute governs PTO accrual or usage — this is an internal accrual-balance check against company policy, not a statutory check.",
    reviewingRole: "auto_approvable",
    reviewingRoleDetail: "Auto-approvable — balance sufficient, request submitted before the pay-period lock.",
    defaultDecision: "accepted",
  },
  {
    id: "daily-ot-106",
    employeeId: "E-106",
    date: "2026-08-25",
    exceptionLabel: "California daily overtime (9.5h in one day)",
    proposedAction: "Apply CA daily overtime premium (1.5x) to the 1.5 hours worked beyond the 8-hour daily threshold.",
    authorizationBasis: "PC-7: Daily Overtime Threshold Check (Payroll Cycle Control)",
    statutoryCheck: "Cal. Lab. Code § 510 — California requires 1.5x pay for hours worked beyond 8 in a single day, independent of the 40-hour weekly FLSA threshold.",
    reviewingRole: "payroll_manager",
    reviewingRoleDetail: "Requires Payroll Manager sign-off — statutory premium-pay calculations are always reviewed.",
    defaultDecision: "accepted",
  },
  {
    id: "duplicate-punch-101",
    employeeId: "E-101",
    date: "2026-08-26",
    exceptionLabel: "Duplicate punch (two clock-ins, 7:58am and 8:01am)",
    proposedAction: "Correct to a single entry (7:58am), then apply standard rounding to 8:00am start.",
    authorizationBasis: "PC-8: Duplicate Punch Correction (Payroll Cycle Control)",
    statutoryCheck: "29 CFR § 785.48(b) — same neutral-rounding standard as any other punch; no hours are added or removed by deduplicating.",
    reviewingRole: "auto_approvable",
    reviewingRoleDetail: "Auto-approvable — no hours change, mechanical correction only.",
    defaultDecision: "accepted",
  },
  {
    id: "late-punch-grace-102",
    employeeId: "E-102",
    date: "2026-08-27",
    exceptionLabel: "Late punch beyond grace window (22 min, no advance notice on file)",
    proposedAction: "Flag for manager review against the attendance policy rather than apply standard rounding.",
    authorizationBasis: "PC-9: Attendance Policy Escalation (Payroll Cycle Control)",
    statutoryCheck: "Not a wage-and-hour statute — a 22-minute punch is outside the ±7-minute neutral-rounding window in PC-2, so this is an internal attendance-policy matter, not a rounding decision.",
    reviewingRole: "payroll_manager",
    reviewingRoleDetail: "Requires Payroll Manager sign-off — outside the auto-approvable rounding window.",
    defaultDecision: "overridden",
    overrideNote:
      "Payroll Manager overrode the agent's escalation: the employee had texted a shift lead in advance about a delayed commute train (documented outside the timecard system). Manager approved standard rounding instead of an attendance-policy flag — a documented-notice exception the agent didn't have visibility into.",
  },
];

export function agreementRate(decisions: Record<string, "accepted" | "overridden">): number {
  const total = PROPOSALS.length;
  if (total === 0) return 0;
  const accepted = PROPOSALS.filter((p) => decisions[p.id] === "accepted").length;
  return Math.round((accepted / total) * 1000) / 10;
}

export function defaultDecisions(): Record<string, "accepted" | "overridden"> {
  return Object.fromEntries(PROPOSALS.map((p) => [p.id, p.defaultDecision]));
}

export function employeeById(id: string): Employee | undefined {
  return EMPLOYEES.find((e) => e.id === id);
}
