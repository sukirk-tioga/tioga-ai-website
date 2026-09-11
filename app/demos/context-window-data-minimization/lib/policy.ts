// Field-level data-minimization policy for the context-window demo.
//
// The governance shape here is genuinely different from the other write-path
// demos in this folder: those gate a PROPOSED ACTION (auto-execute / escalate
// / block). This one gates DATA ENTERING AN AGENT'S CONTEXT WINDOW before any
// action is proposed at all — a control class with no ERP write-path
// equivalent, and the one Tioga's HRIS/WFM positioning work flagged as the
// sharpest demo for an HR or privacy-focused buyer (no dollar threshold, no
// approval routing — just "what data did the boundary let through").
//
// 100% SYNTHETIC DATA. Every employee, SSN, pay rate, leave reason, union
// status, and shift record below is invented for this demo. None of it is
// connected to, sourced from, or shaped against any real UKG tenant, sandbox,
// or export — Tioga has no UKG vendor credentials or sandbox access. The
// shift-data structure (employee/shift/hours fields) is a generic,
// illustrative approximation of what a WFM timecard record looks like, not a
// reproduction of UKG Pro's actual schema.

export const PLANT = "Plant 3 — Assembly Line";
export const MONTH_LABEL = "August 2026";
export const QUESTION = "Why was overtime high in Plant 3 last month?";

export interface PunchRecord {
  date: string;
  clockIn: string;
  clockOut: string;
}

// The full UKG-shaped employee record — every field a naive agent would pull
// in in one go if it just fetched "the employee record" to answer an hours
// question, rather than requesting only the fields the question needs.
export interface EmployeeRecord {
  employeeId: string;
  name: string;
  department: string;
  ssn: string;
  payRate: number;
  unionStatus: "Union — Local 447" | "Non-union";
  leaveReason: string | null;
  medicalAccommodationFlag: boolean;
  // Illustrative subset (3 weeks) of what would, on a real UKG record, be a
  // much longer raw punch-level history — included here to make the point
  // that "full timecard history" is itself an oversized field for a
  // one-month aggregate question, not just a stand-in for the sensitive
  // fields above.
  fullTimecardHistory: PunchRecord[];
}

export interface ShiftRecord {
  employeeId: string;
  shiftDate: string;
  scheduledHours: number;
  hoursWorked: number;
  overtimeHours: number;
}

export type FieldName =
  | "employeeId"
  | "name"
  | "department"
  | "shiftDate"
  | "scheduledHours"
  | "hoursWorked"
  | "overtimeHours"
  | "ssn"
  | "payRate"
  | "leaveReason"
  | "medicalAccommodationFlag"
  | "unionStatus"
  | "fullTimecardHistory";

// The field-level allowlist enforced at the boundary for this question class
// (an overtime-hours question). Only these seven fields are ever assembled
// into the governed agent's prompt — everything else on the employee record
// stays behind the boundary, regardless of what the underlying record holds.
export const ALLOWED_FIELDS: FieldName[] = [
  "employeeId",
  "name",
  "department",
  "shiftDate",
  "scheduledHours",
  "hoursWorked",
  "overtimeHours",
];

export const FIELD_CATALOG: Record<FieldName, { label: string; sensitive: boolean; note: string; source: "employee_master" | "shift_log" }> = {
  employeeId: { label: "Employee ID", sensitive: false, note: "Needed to identify who the hours belong to.", source: "employee_master" },
  name: { label: "Name", sensitive: false, note: "Needed to identify who the hours belong to.", source: "employee_master" },
  department: { label: "Department", sensitive: false, note: "Needed to scope the answer to Plant 3.", source: "employee_master" },
  shiftDate: { label: "Shift date", sensitive: false, note: "Needed to identify when overtime occurred.", source: "shift_log" },
  scheduledHours: { label: "Scheduled hours", sensitive: false, note: "Needed to compute overtime (worked minus scheduled).", source: "shift_log" },
  hoursWorked: { label: "Hours worked", sensitive: false, note: "Needed to compute overtime.", source: "shift_log" },
  overtimeHours: { label: "Overtime hours", sensitive: false, note: "The metric the question is actually about.", source: "shift_log" },
  ssn: { label: "SSN", sensitive: true, note: "Never relevant to an hours question — a payroll identifier, not a scheduling fact.", source: "employee_master" },
  payRate: { label: "Pay rate", sensitive: true, note: "Reveals individual compensation; not needed to explain why hours were high.", source: "employee_master" },
  leaveReason: { label: "Leave reason", sensitive: true, note: "Can reveal a medical condition or ADA accommodation — a protected HR attribute.", source: "employee_master" },
  medicalAccommodationFlag: { label: "Medical accommodation flag", sensitive: true, note: "Directly flags protected medical/ADA status.", source: "employee_master" },
  unionStatus: { label: "Union status", sensitive: true, note: "A protected HR attribute, irrelevant to why hours were high.", source: "employee_master" },
  fullTimecardHistory: { label: "Full timecard history", sensitive: true, note: "Raw punch-level history well beyond the one month the question is about.", source: "employee_master" },
};

// ── Synthetic data generation ───────────────────────────────────────────────

function weekdaysInMonth(year: number, monthIndex0: number): string[] {
  const days: string[] = [];
  const d = new Date(Date.UTC(year, monthIndex0, 1));
  while (d.getUTCMonth() === monthIndex0) {
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) {
      days.push(d.toISOString().slice(0, 10));
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

// August 2026's weekdays — the "last month" of shift data this demo's
// question is about.
export const MONTH_WEEKDAYS = weekdaysInMonth(2026, 7);

function punchHistory(startOffset: number, clockInHour: number, clockOutHour: number): PunchRecord[] {
  // Illustrative 3-week window immediately preceding the month above —
  // representative of the much larger raw punch history a real UKG record
  // would carry, not the full record itself.
  const days = weekdaysInMonth(2026, 6).slice(startOffset, startOffset + 15);
  return days.map((date) => ({
    date,
    clockIn: `${String(clockInHour).padStart(2, "0")}:0${startOffset % 2}`,
    clockOut: `${String(clockOutHour).padStart(2, "0")}:1${startOffset % 3}`,
  }));
}

interface EmployeeSeed {
  employeeId: string;
  name: string;
  ssn: string;
  payRate: number;
  unionStatus: EmployeeRecord["unionStatus"];
  leaveReason: string | null;
  medicalAccommodationFlag: boolean;
  // Function of day-index (0..21) -> hours actually worked that day.
  hoursForDay: (dayIndex: number) => number;
}

const EMPLOYEE_SEEDS: EmployeeSeed[] = [
  {
    employeeId: "E-4471",
    name: "Maria Chen",
    ssn: "412-77-2093",
    payRate: 24.5,
    unionStatus: "Union — Local 447",
    leaveReason: null,
    medicalAccommodationFlag: false,
    hoursForDay: () => 8,
  },
  {
    employeeId: "E-4472",
    name: "David Okafor",
    ssn: "588-14-6650",
    payRate: 26.0,
    unionStatus: "Union — Local 447",
    leaveReason: null,
    medicalAccommodationFlag: false,
    hoursForDay: (i) => (i === 4 ? 9 : 8),
  },
  {
    employeeId: "E-4473",
    name: "Priya Natarajan",
    ssn: "301-92-4487",
    payRate: 23.75,
    unionStatus: "Non-union",
    leaveReason: "FMLA — approved medical leave (partial-day accommodation)",
    medicalAccommodationFlag: true,
    // Reduced schedule most days under an approved partial-day accommodation
    // — the real source of the coverage gap Jason and Marcus below fill.
    hoursForDay: (i) => (i % 3 === 0 ? 6 : 8),
  },
  {
    employeeId: "E-4474",
    name: "Jason Whitfield",
    ssn: "205-63-8871",
    payRate: 28.1,
    unionStatus: "Union — Local 447",
    leaveReason: null,
    medicalAccommodationFlag: false,
    // Covers the coverage gap on the same cadence Priya's hours drop.
    hoursForDay: (i) => (i % 3 === 0 ? 11.5 : 8),
  },
  {
    employeeId: "E-4475",
    name: "Elena Ruiz",
    ssn: "477-28-1039",
    payRate: 25.4,
    unionStatus: "Non-union",
    leaveReason: null,
    medicalAccommodationFlag: false,
    hoursForDay: () => 8,
  },
  {
    employeeId: "E-4476",
    name: "Marcus Boone",
    ssn: "163-55-9924",
    payRate: 22.9,
    unionStatus: "Non-union",
    leaveReason: null,
    medicalAccommodationFlag: false,
    // Covers the remainder of the gap on the days Jason doesn't.
    hoursForDay: (i) => (i % 4 === 1 ? 12 : 8),
  },
];

export const SEED_EMPLOYEES: Record<string, EmployeeRecord> = Object.fromEntries(
  EMPLOYEE_SEEDS.map((e, idx) => [
    e.employeeId,
    {
      employeeId: e.employeeId,
      name: e.name,
      department: PLANT,
      ssn: e.ssn,
      payRate: e.payRate,
      unionStatus: e.unionStatus,
      leaveReason: e.leaveReason,
      medicalAccommodationFlag: e.medicalAccommodationFlag,
      fullTimecardHistory: punchHistory(idx, 7, 15),
    } satisfies EmployeeRecord,
  ])
);

export const SEED_SHIFTS: ShiftRecord[] = EMPLOYEE_SEEDS.flatMap((e) =>
  MONTH_WEEKDAYS.map((shiftDate, i) => {
    const hoursWorked = e.hoursForDay(i);
    return {
      employeeId: e.employeeId,
      shiftDate,
      scheduledHours: 8,
      hoursWorked,
      overtimeHours: Math.max(0, Math.round((hoursWorked - 8) * 10) / 10),
    };
  })
);

export function cloneSeed() {
  return { employees: structuredClone(SEED_EMPLOYEES), shifts: structuredClone(SEED_SHIFTS) };
}

// ── Context-assembly simulation ─────────────────────────────────────────────

export interface FieldLogEntry {
  field: FieldName;
  label: string;
  sensitive: boolean;
  note: string;
  occurrences: number;
}

// Simulates each agent assembling its context for the same question over the
// same underlying employee + shift data — the only difference is which
// fields the boundary lets through. `mode: "naive"` pulls the entire
// employee master record for every employee with any shift that month, plus
// every shift-log field. `mode: "governed"` enforces ALLOWED_FIELDS.
export function buildFieldLog(
  mode: "naive" | "governed",
  employees: Record<string, EmployeeRecord>,
  shifts: ShiftRecord[]
): FieldLogEntry[] {
  const employeeIds = Object.keys(employees);
  const employeeLevelFields: FieldName[] =
    mode === "naive"
      ? ["employeeId", "name", "department", "ssn", "payRate", "leaveReason", "medicalAccommodationFlag", "unionStatus", "fullTimecardHistory"]
      : ALLOWED_FIELDS.filter((f) => FIELD_CATALOG[f].source === "employee_master");
  const shiftLevelFields: FieldName[] = ALLOWED_FIELDS.filter((f) => FIELD_CATALOG[f].source === "shift_log");

  const entries: FieldLogEntry[] = [];
  for (const field of employeeLevelFields) {
    entries.push({ field, ...pick(FIELD_CATALOG[field]), occurrences: employeeIds.length });
  }
  for (const field of shiftLevelFields) {
    entries.push({ field, ...pick(FIELD_CATALOG[field]), occurrences: shifts.length });
  }
  return entries;
}

function pick(c: { label: string; sensitive: boolean; note: string }) {
  return { label: c.label, sensitive: c.sensitive, note: c.note };
}

export interface OvertimeSummary {
  employeeId: string;
  name: string;
  department: string;
  totalOvertimeHours: number;
  overtimeShiftCount: number;
}

export function summarizeOvertime(employees: Record<string, EmployeeRecord>, shifts: ShiftRecord[]): OvertimeSummary[] {
  const byEmployee = new Map<string, OvertimeSummary>();
  for (const s of shifts) {
    if (s.overtimeHours <= 0) continue;
    const emp = employees[s.employeeId];
    if (!emp) continue;
    const prev = byEmployee.get(s.employeeId) ?? {
      employeeId: emp.employeeId,
      name: emp.name,
      department: emp.department,
      totalOvertimeHours: 0,
      overtimeShiftCount: 0,
    };
    prev.totalOvertimeHours = Math.round((prev.totalOvertimeHours + s.overtimeHours) * 10) / 10;
    prev.overtimeShiftCount += 1;
    byEmployee.set(s.employeeId, prev);
  }
  return Array.from(byEmployee.values()).sort((a, b) => b.totalOvertimeHours - a.totalOvertimeHours);
}

// The two agents' final answers are deliberately built from the SAME
// aggregation (summarizeOvertime) — the point of this demo is data exposure,
// not answer quality, so both agents should land on a materially similar
// conclusion regardless of which fields they had access to.
export function buildAnswer(mode: "naive" | "governed", employees: Record<string, EmployeeRecord>, shifts: ShiftRecord[]): string {
  const summary = summarizeOvertime(employees, shifts);
  const totalOt = Math.round(summary.reduce((a, s) => a + s.totalOvertimeHours, 0) * 10) / 10;
  const top = summary.slice(0, 2);
  const topList = top.map((s) => `${s.name} (${s.totalOvertimeHours}h across ${s.overtimeShiftCount} shifts)`).join(" and ");

  if (mode === "naive") {
    const priya = employees["E-4473"];
    return (
      `${PLANT} logged ${totalOt} overtime hours in ${MONTH_LABEL}, concentrated in ${summary.length} of ` +
      `${Object.keys(employees).length} employees. ${topList} account for most of it. Pulling the full employee ` +
      `records shows why: ${priya.name} has been on a partial-day medical accommodation (${priya.leaveReason}) for ` +
      `most of the month, and ${top[0]?.name ?? "the top contributor"} and ${top[1]?.name ?? "a second employee"} ` +
      `have been covering the resulting scheduling gap.`
    );
  }
  return (
    `${PLANT} logged ${totalOt} overtime hours in ${MONTH_LABEL}, concentrated in ${summary.length} of ` +
    `${Object.keys(employees).length} employees. ${topList} account for most of it, each covering a recurring ` +
    `scheduling gap on the same days each week — the shift-hours data alone shows the coverage pattern without ` +
    `needing to know why the gap exists.`
  );
}
