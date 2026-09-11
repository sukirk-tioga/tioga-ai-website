"use client";

import { useMemo, useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  APPROVED_BUDGET,
  DRAFT_PROPOSALS,
  PLAN_LABEL,
  APPROVED_LABEL,
  MRC_HOOK_LABEL,
  approvedLine,
  lineCost,
  approvedTotal,
  draftTotal,
  effectiveLine,
  defaultDecisions,
  type DraftProposal,
} from "./lib/policy";

type Decision = "approved" | "rejected";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
function fmt(n: number) {
  return usd.format(n);
}
function fmtSigned(n: number) {
  const s = usd.format(Math.abs(n));
  return n === 0 ? s : n > 0 ? `+${s}` : `-${s}`;
}
function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function MrcBadge({ proposal }: { proposal: DraftProposal }) {
  if (!proposal.mrcHook) {
    return (
      <span
        className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap"
        style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
      >
        Routine planning line
      </span>
    );
  }
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap"
      style={{ color: "var(--error-light)", border: "1px solid #C6402B60" }}
    >
      MRC-sensitive: {MRC_HOOK_LABEL[proposal.mrcHook]}
    </span>
  );
}

function fieldDiff(proposal: DraftProposal) {
  const current = approvedLine(proposal.department);
  switch (proposal.fieldChanged) {
    case "fte":
      return { from: `${current.fte} FTE`, to: `${proposal.proposed.fte} FTE`, delta: proposal.proposed.fte - current.fte };
    case "avgComp":
      return { from: fmt(current.avgComp), to: fmt(proposal.proposed.avgComp), delta: proposal.proposed.avgComp - current.avgComp };
    case "burdenRate":
      return { from: pct(current.burdenRate), to: pct(proposal.proposed.burdenRate), delta: proposal.proposed.burdenRate - current.burdenRate };
  }
}

function ProposalCard({
  proposal,
  decision,
  onToggle,
}: {
  proposal: DraftProposal;
  decision: Decision;
  onToggle: (id: string, decision: Decision) => void;
}) {
  const current = approvedLine(proposal.department);
  const costCurrent = lineCost(current);
  const costProposed = lineCost({ ...current, ...proposal.proposed });
  const diff = fieldDiff(proposal);
  const rejected = decision === "rejected";

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${rejected ? "#A8681E50" : "var(--border)"}`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{proposal.department}</span>
          <span className="text-xs font-mono text-[var(--text-muted)]">{proposal.fieldLabel}</span>
        </div>
        <MrcBadge proposal={proposal} />
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted-3)] mb-1">Current (approved)</p>
          <p className="text-sm font-mono" style={{ color: "var(--text)" }}>{diff?.from}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted-3)] mb-1">Proposed (draft)</p>
          <p className="text-sm font-mono" style={{ color: "var(--accent)" }}>{diff?.to}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted-3)] mb-1">Annualized cost impact</p>
          <p className="text-sm font-mono" style={{ color: costProposed - costCurrent >= 0 ? "var(--warning)" : "var(--success)" }}>
            {fmtSigned(costProposed - costCurrent)}
          </p>
        </div>
      </div>

      <p className="text-xs uppercase tracking-wide text-[var(--text-muted-3)] mb-1">Source data</p>
      <p className="text-sm mb-3 p-3 rounded-lg" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}>
        {proposal.sourceData}
      </p>

      <p className="text-xs uppercase tracking-wide text-[var(--text-muted-3)] mb-1">Stated assumption</p>
      <p className="text-sm mb-3 p-3 rounded-lg" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}>
        {proposal.assumption}
      </p>

      {proposal.mrcHook && (
        <>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted-3)] mb-1">Why this line is MRC-sensitive</p>
          <p className="text-xs text-[var(--text-muted)] mb-4">{proposal.mrcDetail}</p>
        </>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap mt-1">
        <div className="flex gap-2">
          <button
            onClick={() => onToggle(proposal.id, "approved")}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
            style={
              decision === "approved"
                ? { background: "#4B7A4520", border: "1px solid #4B7A4560", color: "var(--success)" }
                : { border: "1px solid var(--border)", color: "var(--text-muted)" }
            }
          >
            Approve line
          </button>
          <button
            onClick={() => onToggle(proposal.id, "rejected")}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
            style={
              decision === "rejected"
                ? { background: "#A8681E20", border: "1px solid #A8681E60", color: "var(--warning)" }
                : { border: "1px solid var(--border)", color: "var(--text-muted)" }
            }
          >
            Reject line
          </button>
        </div>
      </div>

      {rejected && (
        <p className="text-xs mt-3 p-3 rounded-lg" style={{ background: "#A8681E10", border: "1px solid #A8681E40", color: "var(--text-muted)" }}>
          <span className="font-semibold" style={{ color: "var(--warning)" }}>Reviewer decision: </span>
          {proposal.reviewerNote ?? "The reviewer rejected this line; it stays at the current approved value and does not move into the draft total."}
        </p>
      )}
    </div>
  );
}

export default function HeadcountForecastDraftProvenancePage() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>(() => defaultDecisions());

  const approvedGrandTotal = useMemo(() => approvedTotal(), []);
  const draftGrandTotal = useMemo(() => draftTotal(decisions), [decisions]);
  const netImpact = draftGrandTotal - approvedGrandTotal;

  const mrcCount = DRAFT_PROPOSALS.filter((p) => p.mrcHook).length;
  const approvedCount = DRAFT_PROPOSALS.filter((p) => decisions[p.id] === "approved").length;

  function toggle(id: string, decision: Decision) {
    setDecisions((prev) => ({ ...prev, [id]: decision }));
  }

  function resetToActual() {
    setDecisions(defaultDecisions());
  }

  return (
    <DemoShell
      title="Headcount Forecast Draft — Per-Cell Provenance"
      badge="Live Interactive Demo — Draft-Only FP&A Workflow"
      evidenceTier="browser-simulation"
      description="An agent drafts five headcount/comp/burden changes into a draft version of next quarter's plan — never the locked, approved version. Every changed line is tagged with the source data that justifies it, the stated assumption behind the number, and whether it feeds a management-review-control-sensitive forecast. Toggle any line's Approve/Reject to see the draft-vs-approved diff move. 100% synthetic data: an invented five-department org, not connected to any real Workday Adaptive Planning tenant."
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Proposed lines</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--text)" }}>{DRAFT_PROPOSALS.length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{PLAN_LABEL}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">MRC-sensitive lines</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--error-light)" }}>{mrcCount}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">goodwill / going-concern / deferred-tax inputs</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Approved by reviewer</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--success)" }}>{approvedCount} / {DRAFT_PROPOSALS.length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">only approved lines enter the draft total</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Net budget impact</p>
          <p className="text-xl font-bold font-mono" style={{ color: netImpact >= 0 ? "var(--warning)" : "var(--success)" }}>
            {fmtSigned(netImpact)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">draft vs. approved, annualized</p>
        </div>
      </div>

      {/* Explanation panel */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Why this stays a draft, not a budget line</h2>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          The agent never writes to the locked, approved budget — it only ever proposes into a draft. Every proposed
          number is traceable to a named source input and a named assumption, not asserted as fact, so a bad number
          is falsifiable before it becomes consequential. A human reviewer approves or rejects each line individually;
          nothing here moves from draft to approved without that sign-off, and nothing on this page ever posts
          anywhere. The lines flagged MRC-sensitive below are the sharper case: their inputs also feed a forecast
          that genuinely enters the financials (goodwill impairment, going-concern cash flow, deferred-tax valuation
          allowance) — this is what makes the control SOX-adjacent rather than just a planning nicety.
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
        {DRAFT_PROPOSALS.map((p) => (
          <ProposalCard key={p.id} proposal={p} decision={decisions[p.id]} onToggle={toggle} />
        ))}
      </div>

      {/* Diff summary */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Diff summary: {PLAN_LABEL} vs. {APPROVED_LABEL}</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Recomputed live from the Approve/Reject decisions above — a rejected line stays at its current approved
          value and contributes zero diff.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Department", "Approved (annualized)", "Draft (annualized)", "Diff", "Status"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-medium px-3 py-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {APPROVED_BUDGET.map((l) => {
                const proposal = DRAFT_PROPOSALS.find((p) => p.department === l.department);
                const costCurrent = lineCost(l);
                const eff = effectiveLine(l.department, decisions);
                const costDraft = lineCost(eff);
                const diff = costDraft - costCurrent;
                const status = !proposal ? "No change proposed" : decisions[proposal.id] === "approved" ? "Approved into draft" : "Rejected — held at approved";
                return (
                  <tr key={l.department} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--text)" }}>{l.department}</td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{fmt(costCurrent)}</td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap" style={{ color: "var(--accent)" }}>{fmt(costDraft)}</td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap" style={{ color: diff === 0 ? "var(--text-muted)" : diff > 0 ? "var(--warning)" : "var(--success)" }}>
                      {fmtSigned(diff)}
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--text-muted)] whitespace-nowrap">{status}</td>
                  </tr>
                );
              })}
              <tr>
                <td className="px-3 py-2 font-semibold whitespace-nowrap" style={{ color: "var(--text)" }}>Total</td>
                <td className="px-3 py-2 font-mono text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text)" }}>{fmt(approvedGrandTotal)}</td>
                <td className="px-3 py-2 font-mono text-xs font-semibold whitespace-nowrap" style={{ color: "var(--accent)" }}>{fmt(draftGrandTotal)}</td>
                <td className="px-3 py-2 font-mono text-xs font-semibold whitespace-nowrap" style={{ color: netImpact >= 0 ? "var(--warning)" : "var(--success)" }}>{fmtSigned(netImpact)}</td>
                <td className="px-3 py-2 text-xs text-[var(--text-muted)] whitespace-nowrap">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Underlying synthetic data */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Underlying synthetic approved budget</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          The current approved FY2027 budget the draft above diffs against — an invented five-department org. Every
          department, headcount, comp, and burden-rate figure is synthetic and does not represent any real company.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Department", "FTE", "Avg. comp", "Burden rate", "Annualized cost"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-medium px-3 py-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {APPROVED_BUDGET.map((l) => (
                <tr key={l.department} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--text)" }}>{l.department}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{l.fte}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{fmt(l.avgComp)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{pct(l.burdenRate)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">{fmt(lineCost(l))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Draft-only means exactly this: the agent proposes, a human reviewer approves or rejects each line
        individually, and nothing here ever writes to a locked/approved budget or posts anywhere. Every proposed
        number carries a named source and a named assumption so a bad number is falsifiable, not asserted as fact —
        that&apos;s how &quot;hallucination doesn&apos;t silently become a real budget line.&quot; Everything on this
        page runs in your browser; nothing is sent to a server. 100% synthetic data — invented for this demo, not
        sourced from or connected to any real Workday Adaptive Planning tenant, sandbox, or export. Workday Adaptive
        Planning sandboxes come bundled with a customer license Tioga doesn&apos;t have, so this is built against the
        product&apos;s publicly documented import/API shape, not a live tenant, and calls no real vendor API.
      </p>
    </DemoShell>
  );
}
