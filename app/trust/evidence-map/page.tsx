import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agent Action Evidence Map",
  description:
    "What an agent write into an ERP or CRM should leave behind at each stage — read, propose, approve, commit, roll back, change the agent — and which NIST AI RMF subcategories and EU AI Act articles that evidence supports. A conceptual map, not a certification.",
  alternates: { canonical: "/trust/evidence-map" },
  openGraph: {
    title: "Agent Action Evidence Map — Tioga AI",
    description:
      "One table: for each stage of an agent write, the evidence to keep and the NIST AI RMF / EU AI Act references it supports.",
  },
};

interface Row {
  stage: string;
  keep: string;
  nist: { id: string; text: string }[];
  eu: { id: string; text: string }[];
  iso: string;
}

// NIST AI RMF 1.0 subcategory wording and EU AI Act article text below were
// checked against the primary sources on 2026-09-19 (NIST AIRC core; the
// EU AI Act text for Articles 12, 14 and 26). ISO/IEC 42001 is deliberately
// cited by control THEME only: the standard is paywalled and this site's
// earlier Annex A numbers came from secondary sources, so numbers are left
// to be confirmed against the licensed text in an engagement.
const ROWS: Row[] = [
  {
    stage: "Read",
    keep: "What the agent was allowed to see and what it actually retrieved: sources, the fields included and excluded, the identity used, and the time.",
    nist: [
      {
        id: "MEASURE 2.4",
        text: "Functionality and behavior of the AI system are monitored when in production.",
      },
    ],
    eu: [
      {
        id: "Art. 12(1)",
        text: "High-risk AI systems technically allow automatic recording of events (logs) over the system's lifetime.",
      },
    ],
    iso: "Control theme: data used by the AI system, and event logging.",
  },
  {
    stage: "Propose",
    keep: "The proposed action, the inputs behind it, the policy or rule it cited, the model and version, and the confidence or uncertainty the agent reported.",
    nist: [
      {
        id: "MEASURE 2.8",
        text: "Risks associated with transparency and accountability are examined and documented.",
      },
    ],
    eu: [
      {
        id: "Art. 12(2)",
        text: "Logging enables recording of events relevant to risk situations, post-market monitoring, and monitoring the system's operation.",
      },
    ],
    iso: "Control theme: system documentation and transparency to the people who use the output.",
  },
  {
    stage: "Approve or deny",
    keep: "The named approver, the threshold that triggered the gate, the decision, the time, and what happened on denial or timeout — including that nothing was silently retried.",
    nist: [
      {
        id: "MAP 3.5",
        text: "Processes for human oversight are defined, assessed, and documented.",
      },
      {
        id: "GOVERN 2.1",
        text: "Roles, responsibilities and lines of communication for managing AI risks are documented and clear.",
      },
    ],
    eu: [
      {
        id: "Art. 14(4)(d)",
        text: "Oversight persons can decide not to use the system, or disregard, override or reverse its output.",
      },
      {
        id: "Art. 26(2)",
        text: "Deployers assign human oversight to natural persons with the necessary competence, training and authority.",
      },
    ],
    iso: "Control theme: roles and responsibilities, and human oversight in the use of the system.",
  },
  {
    stage: "Commit (the write)",
    keep: "The system's own audit entry attributing the write to the agent's identity and on whose behalf, the policy check that ran before it, and a read-back confirming the resulting state matches the intent.",
    nist: [
      {
        id: "MEASURE 2.4",
        text: "Behavior is monitored when in production.",
      },
      {
        id: "GOVERN 1.4",
        text: "The risk management process and outcomes are established through transparent policies, procedures, and other controls.",
      },
    ],
    eu: [
      {
        id: "Art. 12(1)",
        text: "Automatic recording of events (logs).",
      },
      {
        id: "Art. 26(6)",
        text: "Deployers keep automatically generated logs under their control for at least six months, unless other law provides otherwise.",
      },
    ],
    iso: "Control theme: operation and monitoring, and event logs.",
  },
  {
    stage: "Roll back",
    keep: "The reversal entry linked to the original write, who authorized the reversal, the time, and confirmation the reversal itself landed correctly.",
    nist: [
      {
        id: "MANAGE 2.4",
        text: "Mechanisms exist to supersede, disengage, or deactivate AI systems whose outcomes are inconsistent with intended use.",
      },
      {
        id: "MANAGE 4.1",
        text: "Post-deployment monitoring plans include appeal and override, incident response, recovery, and change management.",
      },
    ],
    eu: [
      {
        id: "Art. 14(4)(d)–(e)",
        text: "Oversight persons can override or reverse output, and interrupt the system through a stop procedure that brings it to a safe halt.",
      },
    ],
    iso: "Control theme: incident and nonconformity handling.",
  },
  {
    stage: "Change the agent",
    keep: "A review record for any change to the agent's instructions, tools, or model that could alter what it is allowed to write: who reviewed it, when, and what was compared.",
    nist: [
      {
        id: "MANAGE 4.1",
        text: "Post-deployment monitoring plans include change management.",
      },
      {
        id: "GOVERN 1.4",
        text: "Controls are established through transparent policies and procedures.",
      },
    ],
    eu: [],
    iso: "Control theme: change management across the AI system lifecycle.",
  },
];

export default function EvidenceMapPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Evidence Map
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: "var(--text)" }}>
          What an agent write should leave behind
        </h1>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mb-6">
          A governance review usually asks for the story of one transaction. This map lists, for each stage of an agent
          write into an ERP or CRM, the evidence worth keeping — and the NIST AI RMF subcategories and EU AI Act
          articles that evidence supports.
        </p>
        <div
          className="p-5 rounded-2xl mb-12 text-sm text-[var(--text-muted)] leading-relaxed"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="font-semibold mb-2" style={{ color: "var(--text)" }}>Read this first</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              This is a <strong style={{ color: "var(--text)" }}>conceptual map, not a certification, a control-by-control
              audit mapping, or legal advice.</strong> Keeping this evidence supports the referenced requirements; it does
              not by itself satisfy them.
            </li>
            <li>
              The EU AI Act articles apply to <strong style={{ color: "var(--text)" }}>high-risk AI systems</strong> and
              their deployers. Whether a given agent is high-risk depends on its use, and many finance-operations workflows
              are not. The articles are shown for teams that are in scope.
            </li>
            <li>
              NIST AI RMF is a voluntary framework; subcategory wording is paraphrased from NIST AI RMF 1.0. ISO/IEC 42001
              is cited by <strong style={{ color: "var(--text)" }}>control theme only</strong>: control numbers should be
              confirmed against the licensed standard.
            </li>
            <li>Tioga AI is not ISO 42001 certified.</li>
          </ul>
        </div>

        <div className="space-y-4 mb-16">
          {ROWS.map((r) => (
            <div key={r.stage} className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold tracking-wide uppercase mb-2" style={{ color: "var(--accent)" }}>{r.stage}</p>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text)" }}>
                <span className="font-semibold">Evidence to keep: </span>
                <span className="text-[var(--text-muted)]">{r.keep}</span>
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] mb-1.5">NIST AI RMF</p>
                  <ul className="space-y-2">
                    {r.nist.map((n) => (
                      <li key={n.id} className="text-sm text-[var(--text-muted)] leading-relaxed">
                        <span className="font-mono text-xs mr-1.5" style={{ color: "var(--accent)" }}>{n.id}</span>
                        {n.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:pl-6" style={{ borderLeft: "1px solid var(--border)" }}>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] mb-1.5">EU AI Act (high-risk scope)</p>
                  {r.eu.length > 0 ? (
                    <ul className="space-y-2">
                      {r.eu.map((e) => (
                        <li key={e.id} className="text-sm text-[var(--text-muted)] leading-relaxed">
                          <span className="font-mono text-xs mr-1.5" style={{ color: "var(--accent)" }}>{e.id}</span>
                          {e.text}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">No single article cited for this stage here.</p>
                  )}
                </div>
                <div className="md:pl-6" style={{ borderLeft: "1px solid var(--border)" }}>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] mb-1.5">ISO/IEC 42001</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{r.iso}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl mb-12" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>See a record like this</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
            The governed AP exception demo runs this loop on synthetic data — propose, policy decision, approval or block,
            simulated write, audit, rollback — and the composed-evidence demo shows one attributable record joining an
            assistant&apos;s request to what the ERP actually did. Both are browser simulations, not client systems.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/demos/ap-exception-workflow" className="underline underline-offset-2" style={{ color: "var(--accent)" }}>Governed AP exception demo →</Link>
            <Link href="/demos/composed-evidence" className="underline underline-offset-2" style={{ color: "var(--accent)" }}>Composed evidence demo →</Link>
            <Link href="/samples/governance-evidence-excerpt.html" className="underline underline-offset-2" style={{ color: "var(--accent)" }}>Sample evidence excerpt →</Link>
          </div>
        </div>

        <div className="flex flex-col items-center sm:flex-row gap-4 justify-center text-center">
          <Link
            href="/demos/agent-write-path-exposure-check"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--accent-dark)" }}
          >
            Check your own write path →
          </Link>
          <Link
            href="/trust/framework-mapping"
            className="inline-block px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-[var(--text)]"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            The broader framework mapping →
          </Link>
        </div>
      </section>
    </main>
  );
}
