"use client";

import { useMemo, useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  PROPOSALS,
  PUNCH_TABLE,
  PAY_PERIOD_LABEL,
  PAY_PERIOD_WEEKDAYS,
  EMPLOYEES,
  employeeById,
  agreementRate,
  defaultDecisions,
  type Proposal,
} from "./lib/policy";

type Decision = "accepted" | "overridden";

function RoleBadge({ role }: { role: Proposal["reviewingRole"] }) {
  const auto = role === "auto_approvable";
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap"
      style={{
        color: auto ? "var(--success)" : "var(--warning)",
        border: `1px solid ${auto ? "#4B7A4560" : "#A8681E60"}`,
      }}
    >
      {auto ? "Auto-approvable" : "Payroll Manager sign-off"}
    </span>
  );
}

function ProposalCard({
  proposal,
  decision,
  onToggle,
}: {
  proposal: Proposal;
  decision: Decision;
  onToggle: (id: string, decision: Decision) => void;
}) {
  const emp = employeeById(proposal.employeeId);
  const overridden = decision === "overridden";
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${overridden ? "#A8681E50" : "var(--border)"}`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {emp?.name} <span className="text-[var(--text-muted)] font-mono text-xs">({proposal.employeeId})</span>
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">{proposal.date}</span>
        </div>
        <RoleBadge role={proposal.reviewingRole} />
      </div>

      <p className="text-xs uppercase tracking-wide text-[var(--text-muted-3)] mb-1">Exception</p>
      <p className="text-sm mb-3" style={{ color: "var(--text)" }}>{proposal.exceptionLabel}</p>

      <p className="text-xs uppercase tracking-wide text-[var(--text-muted-3)] mb-1">Proposed action</p>
      <p className="text-sm mb-3 p-3 rounded-lg" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}>
        {proposal.proposedAction}
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted-3)] mb-1">Authorization basis</p>
          <p className="text-xs font-mono" style={{ color: "var(--accent)" }}>{proposal.authorizationBasis}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted-3)] mb-1">Reviewing role required</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{proposal.reviewingRoleDetail}</p>
        </div>
      </div>

      <p className="text-xs uppercase tracking-wide text-[var(--text-muted-3)] mb-1">Statutory check (illustrative, not legal advice)</p>
      <p className="text-xs text-[var(--text-muted)] mb-4">{proposal.statutoryCheck}</p>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => onToggle(proposal.id, "accepted")}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
            style={
              decision === "accepted"
                ? { background: "#4B7A4520", border: "1px solid #4B7A4560", color: "var(--success)" }
                : { border: "1px solid var(--border)", color: "var(--text-muted)" }
            }
          >
            Accept as proposed
          </button>
          <button
            onClick={() => onToggle(proposal.id, "overridden")}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
            style={
              decision === "overridden"
                ? { background: "#A8681E20", border: "1px solid #A8681E60", color: "var(--warning)" }
                : { border: "1px solid var(--border)", color: "var(--text-muted)" }
            }
          >
            Override
          </button>
        </div>
      </div>

      {overridden && (
        <p className="text-xs mt-3 p-3 rounded-lg" style={{ background: "#A8681E10", border: "1px solid #A8681E40", color: "var(--text-muted)" }}>
          <span className="font-semibold" style={{ color: "var(--warning)" }}>Reviewer override: </span>
          {proposal.overrideNote ?? "The Payroll Manager chose a different disposition than the agent proposed for this exception."}
        </p>
      )}
    </div>
  );
}

export default function TimecardExceptionShadowModePage() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>(() => defaultDecisions());

  const rate = useMemo(() => agreementRate(decisions), [decisions]);
  const autoCount = PROPOSALS.filter((p) => p.reviewingRole === "auto_approvable").length;
  const managerCount = PROPOSALS.length - autoCount;
  const overriddenCount = PROPOSALS.filter((p) => decisions[p.id] === "overridden").length;

  function toggle(id: string, decision: Decision) {
    setDecisions((prev) => ({ ...prev, [id]: decision }));
  }

  function resetToActual() {
    setDecisions(defaultDecisions());
  }

  return (
    <DemoShell
      title="Timecard Exception Agent — Shadow Mode"
      badge="Live Interactive Demo — Shadow-Mode Review"
      evidenceTier="browser-simulation"
      description="An agent reviews a synthetic two-week pay period's timecard exceptions — missed punches, late punches, unapproved overtime, a missed meal break, a daily-overtime day, a PTO request — and proposes a correction or approval for each. It never auto-executes: every proposal names the payroll-cycle control that authorizes it, the FLSA/state wage-and-hour rule it checked, and the role required to sign off. Toggle any proposal below to see how the agreement rate moves. 100% synthetic data: an invented six-person roster and pay period, not connected to any real UKG tenant."
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Proposals this window</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--text)" }}>{PROPOSALS.length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{PAY_PERIOD_LABEL}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Auto-approvable</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--success)" }}>{autoCount}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">no dollar or hours impact beyond neutral rounding</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Payroll Manager sign-off</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--warning)" }}>{managerCount}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">statutory premium, missing data, or policy exception</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Agreement rate</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--accent)" }}>{rate}%</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{overriddenCount} of {PROPOSALS.length} overridden</p>
        </div>
      </div>

      {/* Explanation panel */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Why this is the proof point, not a black box</h2>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          This mirrors Tioga&apos;s shadow-mode delivery standard: before any agent action is authorized to execute
          live, it runs for a defined window against real activity, proposing only — never executing — and cutover
          to live execution is gated on measured agreement between what the agent proposed and what a human
          reviewer actually decided during that window, not a calendar date. Below is that window&apos;s actual, logged
          outcome; toggle any card to see how the rate changes if a decision had gone the other way.
        </p>
        <button
          onClick={resetToActual}
          className="text-xs px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          style={{ border: "1px solid var(--border)" }}
        >
          Reset to actual review outcomes
        </button>
      </div>

      {/* Proposal queue */}
      <div className="flex flex-col gap-4 mb-6">
        {PROPOSALS.map((p) => (
          <ProposalCard key={p.id} proposal={p} decision={decisions[p.id]} onToggle={toggle} />
        ))}
      </div>

      {/* Underlying synthetic data */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Underlying synthetic punch data</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Invented roster and punches for {EMPLOYEES.length} employees across {PAY_PERIOD_WEEKDAYS.length} shift-days
          in {PAY_PERIOD_LABEL}. Every name, punch, and exception is synthetic and does not represent any real person
          or any real UKG tenant. Rows with a highlighted exception feed a proposal above.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Employee", "State", "Date", "Clock in", "Clock out", "Hours", "Exception"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-medium px-3 py-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PUNCH_TABLE.filter((row) => row.exceptionId).map((row) => {
                const emp = employeeById(row.employeeId);
                const proposal = PROPOSALS.find((p) => p.id === row.exceptionId);
                return (
                  <tr key={`${row.employeeId}-${row.date}`} style={{ borderBottom: "1px solid var(--border)", background: "#A8681E0C" }}>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--text)" }}>
                      {emp?.name} <span className="text-[var(--text-muted)] font-mono text-xs">({row.employeeId})</span>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-muted)] whitespace-nowrap">{emp?.state}</td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{row.date}</td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{row.clockIn ?? "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{row.clockOut ?? "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{row.hoursWorked}h</td>
                    <td className="px-3 py-2 text-xs text-[var(--text-muted)]">{proposal?.exceptionLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Shadow mode means exactly this: the agent proposes, it never executes, and every proposal is scored against
        what a human reviewer actually decided. The FLSA/state wage-and-hour rules cited above are real statutes and
        regulations, cited illustratively to show the class of check a timecard-exception agent should run against —
        this is not legal advice and not a substitute for counsel on any real pay decision. Everything on this page
        runs in your browser; nothing is sent to a server. 100% synthetic data — invented for this demo, not sourced
        from or connected to any real UKG tenant, sandbox, or export.
      </p>
    </DemoShell>
  );
}
