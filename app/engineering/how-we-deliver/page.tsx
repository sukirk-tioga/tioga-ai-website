import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How Tioga AI Delivers",
  description:
    "The 7-phase delivery lifecycle behind every Tioga AI engagement — propose-and-approve discipline, evidence over assertion, and a named artifact and a client-owned decision at every gate, from the 5-day Discovery Sprint through handover.",
  alternates: { canonical: "/engineering/how-we-deliver" },
  openGraph: {
    title: "How Tioga AI Delivers — Tioga AI",
    description:
      "A client-safe excerpt of Tioga's internal delivery methodology — the same standard Tioga's own AI-operations estate runs under internally.",
  },
};

interface Phase {
  n: string;
  title: string;
  benefit: string;
  gate: string;
}

const PHASES: Phase[] = [
  { n: "0", title: "Do we even talk?", benefit: "You decide: worth a Sprint?", gate: "G0" },
  { n: "1", title: "Prove it before you buy it", benefit: "You decide: Go / No-Go / Redirect", gate: "G1" },
  { n: "2", title: "What you're actually signing", benefit: "You decide: proceed", gate: "G2" },
  { n: "3", title: "The work itself", benefit: "Milestone-by-milestone acceptance, then cutover", gate: "G3.n / G4" },
  { n: "4", title: "Show me it's true", benefit: "You decide: accept", gate: "G5" },
  { n: "5", title: "Nothing depends on one person after this", benefit: "Handover, proven not promised", gate: "G6" },
  { n: "6", title: "Standing coverage, renewed on your terms", benefit: "You decide, every period", gate: "G7" },
];

const SELF_APPLICATION_ROWS: { runs: string; client: string }[] = [
  {
    runs: "Runtime deny lists on production-affecting actions in Tioga's own agent configuration",
    client: "The Tool-Grant Matrix's “tool-enforced” column",
  },
  {
    runs: "Read-only agent types with no write or delegation capability",
    client: "Typed sub-agents in every engagement, documented in the delegation-topology deliverable",
  },
  {
    runs: "Root-originated delegation; no nested sub-agent spawning",
    client: "The delegation-topology deliverable",
  },
  {
    runs: "Human approval required on any externally visible action (publishing, sending, deploying)",
    client: "The Ask-First permission tier; the propose-and-approve layer in Standing Watch",
  },
  {
    runs: "Scheduled verification of Tioga's own automation outputs against what they actually produced, with delivered alerts",
    client: "The Reconciliation Control deliverable",
  },
  {
    runs: "A kept, cited write-up of Tioga's own first-party delegation incident",
    client: "The evidence behind the capability-not-instruction standard; the honesty statement in Tioga's methodology",
  },
  {
    runs: "Engagement-level data handling with named subprocessors, deletion at close, and a plainly stated solo-founder incident posture",
    client: "The data-handling section of every proposal; the deletion schedule at handover",
  },
];

const CONTROL_OWNER_ROWS: { question: string; answer: string }[] = [
  { question: "What can this agent do, and what has it been deliberately prevented from doing?", answer: "The Tool-Grant Matrix" },
  { question: "Who approves each action it proposes?", answer: "The Tool-Grant Matrix, with named identities in the client's own system" },
  { question: "How do we know it does what we think before it does it for real?", answer: "The shadow-mode plan and signed agreement report" },
  { question: "How do we know, every day, that what it says it did is what it did?", answer: "The reconciliation control and its log" },
  { question: "Which framework clause does each control satisfy, and where is the proof?", answer: "The evidence pack" },
  { question: "What happens when it is wrong, and can you show me?", answer: "The acceptance test's failure demonstrations; the runbook's rollback path" },
  { question: "What do you (Tioga) still have access to?", answer: "The access plan, the revocation checklist, the access log" },
  { question: "How did you work on our material, and who else touched it?", answer: "The proposal's data-handling section, the evidence ledger" },
];

function GateBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl mt-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="text-xs font-mono uppercase tracking-wide mb-1.5" style={{ color: "var(--accent)" }}>
        {label}
      </div>
      <div className="text-sm text-[var(--text-muted)] leading-relaxed">{children}</div>
    </div>
  );
}

export default function HowWeDeliverPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <Link href="/engineering" className="text-xs mb-6 inline-block hover:text-[var(--text)] transition-colors" style={{ color: "var(--accent)" }}>
          ← How We Built It
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ color: "var(--accent)", background: "#C8340615", border: "1px solid #C8340630" }}>
            No model call
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-6 leading-tight" style={{ color: "var(--text)" }}>
          How Tioga AI delivers
        </h1>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-12">
          A client-safe excerpt of Tioga&apos;s internal delivery methodology
          — the same standard Tioga&apos;s own AI-operations estate runs
          under internally, with the process detail specific to that
          internal estate trimmed out.
        </p>

        <div className="space-y-10">
          {/* Philosophy */}
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>Philosophy</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              How Tioga builds is what Tioga sells, and that is an operating
              fact, not a claim. Tioga&apos;s own delivery estate — the AI
              automation that runs Tioga&apos;s day-to-day operations — runs
              under propose-and-approve, with capability-absence and runtime
              deny lists ranked above documentation as enforcement, read-only
              agent types, root-originated delegation, and scheduled
              verification of what its own automations claim against what
              they actually produced. A prospect who asks &quot;do you
              actually work this way?&quot; can be shown the deny lists, the
              agent-type definitions, the verification jobs, and Tioga&apos;s
              own dated incident records — real, found-and-fixed gaps in
              Tioga&apos;s own infrastructure, not a single curated write-up.
            </p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Every client engagement below is built to be executed under
              that same discipline going forward: Tioga sells one thing in
              fifteen shapes — the connection between agent behavior,
              governance evidence, and the enterprise transaction itself. An
              assessment sells that connection as a map. A pilot or
              write-path build sells it as running, evidenced software. A
              governance program sells it as a control system with an audit
              trail. A retainer sells it as a standing watch. Every offer has
              the same job: produce that connection, with evidence a control
              owner can inspect.
            </p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              In practice: Tioga writes the spec, scoped sub-agents do
              bounded work under least-privilege grants, a human gate sits in
              front of anything that touches a client system, and a
              reconciliation pass runs on schedule.
            </p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Evidence over assertion, applied to Tioga first: a control you
              cannot produce evidence for is not a control. Tioga has no
              client case studies and does not manufacture composite ones
              that read as real. It offers instead a bounded fixed-fee
              sprint, a working prototype the prospect can break, explicit
              go/no-go gates, and a methodology the prospect can read before
              they read a price. Every phase below ends with an artifact, and
              the artifact is the exit criterion. &quot;We are confident&quot;
              is never a gate condition; &quot;here is the agreement report,
              signed by your controller&quot; is.
            </p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Every engagement starts with the same 5-day, $5,000{" "}
              <Link href="/discovery-sprint" style={{ color: "var(--accent)" }} className="hover:text-[var(--text)] transition-colors">
                Discovery Sprint
              </Link>
              , and a no-go finding out of that sprint is a first-class
              deliverable, not a failed sale. The client keeps all work
              product at every gate whether or not they continue. Tioga is
              never a required runtime dependency: production credentials,
              repositories, logs, and deployment assets stay under the
              client&apos;s control from the first day, and the handover
              phase exists to prove that, not merely promise it. Fixed fees
              have teeth in both directions: named deliverables, named
              exclusions, objective acceptance criteria, a capped
              change-order mechanism, and milestone payments tied to
              accepted outputs.
            </p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Tioga is a solo practice by design, not by apology. One person
              scopes, engineers, maps governance, and produces evidence — the
              promise (&quot;no handoff to a junior team&quot;) is also the
              constraint the methodology below is built to make workable at
              scale.
            </p>
          </div>

          {/* Engagement lifecycle */}
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>The engagement lifecycle</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
              Every engagement moves through the same stages. Some offers
              compress or skip a sub-stage, but the decision points are
              universal: <strong style={{ color: "var(--text)" }}>you never move to the next stage without a named artifact in hand and a decision only you make.</strong>
            </p>

            <div className="space-y-3 mb-8">
              {PHASES.map((p) => (
                <div
                  key={p.n}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="text-xl font-bold font-mono shrink-0 w-8 text-center" style={{ color: "var(--accent)" }}>
                    {p.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>{p.title}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{p.benefit}</p>
                  </div>
                  <span
                    className="text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0"
                    style={{ color: "var(--accent)", background: "#C8340615", border: "1px solid #C8340630" }}
                  >
                    {p.gate}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              {/* Phase 0 */}
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Phase 0 — Do we even talk?</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                  An inbound contact resolves within five business days into
                  one of three outcomes: a Discovery Sprint order, a polite
                  disqualification, or a logged candidate need that no
                  current offer covers. A single 30-45 minute triage call
                  establishes what the pain actually is (automation, an
                  agent that needs to reach a system of record, or answering
                  for AI already in production), what made it urgent now,
                  who signs and who has to be satisfied the result is
                  controlled, which system of record is in play, and how far
                  along the client already is. That produces a starting
                  hypothesis for which offer fits — the Discovery
                  Sprint&apos;s job is then to confirm or overturn it. A
                  Discovery Sprint that ends in &quot;you asked for a pilot;
                  the honest answer is a governance readiness assessment
                  first&quot; is a success, and the $5,000 fee credits toward
                  whichever offer the client actually proceeds with.
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Tioga declines at triage, with a written reason, when the
                  prospect wants staff augmentation rather than an outcome;
                  requires a raw database write path as the deliverable
                  (Tioga always executes through the application&apos;s own
                  logic layer, never a direct database write); requires
                  Tioga to hold production credentials or act as a runtime
                  dependency after handover; requires a reference-customer
                  list as a precondition to paid work; requires a 24/7 SLA a
                  solo practice can&apos;t honestly make; or can&apos;t fund
                  the Discovery Sprint. A declined prospect isn&apos;t a
                  failed lead — it&apos;s evidence of where the offer
                  boundary sits.
                </p>
                <GateBox label="Gate">
                  Discovery Sprint order accepted and paid. Named client
                  sponsor and named control owner. Intake questionnaire
                  returned or scheduled. Access plan agreed — what Tioga will
                  be given read access to, what it will never be given, and
                  how access is revoked at day five. Nothing starts until
                  that clears, including &quot;just a quick look at the
                  system.&quot;
                </GateBox>
              </div>

              {/* Phase 1 */}
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Phase 1 — Prove it before you buy it</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                  In five working days: one prioritized use case, a
                  current-state system and control map, the key risks and
                  integration constraints, a proposed architecture with
                  control points, measurable pilot success criteria, a
                  fixed-fee pilot plan, and a working prototype — or an
                  explicit, reasoned no-go finding. Everything in the
                  eventual proposal traces back to this report.
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                  This requires read-only sandbox access provisioned before
                  day one — a real ask most mid-market IT groups need more
                  than a week&apos;s notice for. If you&apos;re not yet sure
                  you have a real, provisionable candidate use case, or
                  can&apos;t clear that access fast enough, the one-day{" "}
                  <Link href="/ai-fit-check" style={{ color: "var(--accent)" }} className="hover:text-[var(--text)] transition-colors">
                    AI Fit Check
                  </Link>{" "}
                  answers that question first, for a tenth of the cost,
                  before either side commits this Sprint&apos;s full week.
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                  For a prospect who already has that access lined up, this
                  is where every full engagement starts, including
                  governance-only ones. A governance assessment without a
                  system and control map is a questionnaire; an ISO 42001
                  sprint scoped without knowing which agents exist and who
                  owns them gets re-scoped in month two. For pure governance
                  offers the &quot;prototype&quot; is a governance artifact
                  rather than code, but it&apos;s still a working
                  demonstration, not a slide.
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                  Over the five days: access is provisioned read-only,
                  scoped, and time-boxed. Interviews run with the process
                  owner, the systems owner, the control owner, and the
                  sponsor. A current-state system and control map is built,
                  showing where evidence already exists and where it&apos;s
                  missing. Three to five candidate use cases are scored on
                  value, feasibility, blast radius, and controllability — a
                  high-value, uncontrollable use case is not a candidate for
                  a first pilot. One use case is selected with the sponsor,
                  the control points are designed against the client&apos;s
                  real approval matrix, and prototype build starts. The
                  prototype is checked against the original plan, risks are
                  written up as a register rather than a paragraph, and
                  pilot success criteria are written as measurements a
                  controller can verify — agreement rate in shadow mode,
                  cycle time, exception rate, evidence completeness — never
                  as adjectives. A no-go analysis is written down explicitly
                  even when the answer is go. Day five is a single readout
                  session with the sponsor and control owner present: the
                  Discovery Report is walked through, the prototype is
                  demonstrated live and recorded, and a fixed-fee pilot plan
                  is presented with named deliverables, exclusions,
                  acceptance criteria, and price. The client leaves with
                  everything.
                </p>
                <GateBox label="Prototype rules, non-negotiable">
                  Never against production — sandbox, test instance, or
                  exported sample data only. Never with write credentials to
                  any client system; the prototype demonstrates the control
                  point, not end-to-end throughput. Built under the same
                  tool-grant discipline as delivery. Its own delegation
                  structure is documented, even for a five-day artifact —
                  it&apos;s the first time the client sees that discipline
                  applied, on day three of the relationship.
                </GateBox>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-4 mb-0">
                  <strong style={{ color: "var(--text)" }}>What&apos;s produced:</strong> a Discovery Report
                  with seven required sections in order — the prioritized
                  use case and why it beat the alternatives; current-state
                  system and control map; key risks and integration
                  constraints; proposed architecture and control points,
                  including the permission ladder and delegation structure;
                  measurable pilot success criteria; the fixed-fee pilot
                  plan; and the no-go analysis and finding. Plus the
                  prototype and a recorded demo.
                </p>
                <GateBox label="Gate — Go / No-Go / Redirect, in writing, from the client sponsor, within a stated window">
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong style={{ color: "var(--text)" }}>Go.</strong> Proceed to Phase 2 on the offer the Discovery Report recommends. The $5,000 credits against the full engagement price.</li>
                    <li><strong style={{ color: "var(--text)" }}>Redirect.</strong> Proceed, but on a different offer than the triage hypothesis. Same credit rule.</li>
                    <li><strong style={{ color: "var(--text)" }}>No-go.</strong> Either Tioga&apos;s own finding or the client&apos;s decision. The client keeps every artifact. There is no obligation to continue and Tioga does not ask for one.</li>
                  </ul>
                </GateBox>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-4 mb-0">
                  The credit is valid for 60 days from the readout; beyond
                  that, a short re-validation precedes any full engagement
                  rather than assuming the report&apos;s state still holds.
                </p>
              </div>

              {/* Phase 2 */}
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Phase 2 — What you&apos;re actually signing</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                  The Discovery Report converts into a signed Statement of
                  Work with fixed-fee terms that have teeth, without
                  re-scoping anything Discovery already settled. Every
                  proposal section traces to a named source: the executive
                  summary comes from the Discovery Report&apos;s use case
                  and finding, in the client&apos;s own words from the
                  interviews; the problem framing comes from the
                  client&apos;s own stated trigger and the map&apos;s actual
                  gaps — never a generic market statistic standing in for
                  the client&apos;s own situation; what&apos;s delivered,
                  timeline, and investment all trace directly to the pilot
                  plan and offer pricing; the approach section states how
                  Tioga&apos;s three delivery standards apply to this
                  specific engagement.
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  The Statement of Work binds what the proposal describes,
                  and carries at minimum: deliverables named individually,
                  each with acceptance criteria stated as an observable
                  condition (&quot;client satisfaction&quot; is never an
                  acceptance criterion); exclusions named individually,
                  including what Discovery surfaced and consciously
                  deferred; milestone payments tied to accepted outputs, not
                  elapsed time; a capped change-order mechanism — changes
                  are proposed in writing, priced from a rate card, and
                  capped as a percentage of the fixed fee beyond which the
                  engagement is re-scoped rather than extended; go/no-go
                  language at every milestone gate, with the client owing
                  only for accepted milestones and keeping all work product;
                  a continuity clause stating Tioga is not a runtime
                  dependency — credentials, repositories, logs, and
                  deployment assets are the client&apos;s, and Tioga&apos;s
                  access is enumerated and revoked at handover.
                </p>
                <GateBox label="Gate">
                  Signed Statement of Work. Deposit received. Access
                  provisioned per an updated plan — broader than sprint
                  access, still least-privilege, still enumerated, still
                  time-boxed. Named approvers for every higher-risk action.
                  Kickoff scheduled.
                </GateBox>
              </div>

              {/* Phase 3 */}
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Phase 3 — The work itself</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                  Tioga builds or assesses what the Statement of Work names,
                  under three delivery standards, with a written weekly
                  status and milestone gates the client can stop at.
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                  Kickoff presents the milestone map, the status cadence, a
                  decision log and risk register kept for the life of the
                  engagement, named approvers for every higher-risk action,
                  the shadow-window definition, the reconciliation-control
                  definition, and — honestly, for a solo practice — the
                  escalation path: Tioga, by email, promptly. A delivery
                  runbook is delivered in draft at kickoff and finalized by
                  the first milestone; it&apos;s the document a client
                  engineer would use to understand, and if necessary take
                  over, the build.
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  Delivery runs as specified increments, each following the
                  same loop Tioga uses on its own estate: a written spec for
                  what changes and what proves it; scoped, typed sub-agents
                  (reader, builder, tester) working under least-privilege
                  grants with no nested delegation; a build step in the
                  client&apos;s own repository or a Tioga-held one
                  transferred at handover; a verification step where a
                  reconciliation pass compares what was reported against
                  what actually exists, every increment, not only when
                  something looks wrong; and a human review and approval
                  gate in front of anything that touches a client system.
                </p>
                <p className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
                  The three delivery standards, applied concretely:
                </p>
                <ul className="list-disc pl-4 space-y-3 text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  <li>
                    <strong style={{ color: "var(--text)" }}>Capability, not instruction.</strong> Applied
                    at design, before any code. Every agent in the delivered
                    system, every tool it holds, every tool it was
                    deliberately not given, and the permission tier of each
                    action it can take is documented. If an agent could take
                    an action whose misuse would be unacceptable, the tool
                    is removed — not the prompt amended.
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Shadow mode before cutover.</strong> Applied
                    before any production touch. A shadow-mode plan
                    defines, before the window starts: the traffic the
                    agent will see, the agreement metric and its threshold,
                    the minimum window length, and what happens on
                    disagreement. Cutover is gated on a signed
                    shadow-agreement report showing the threshold was met —
                    never on the calendar, never on confidence.
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Verification as an unconditional scheduled control.</strong> Applied
                    from the first day of the shadow window and never
                    turned off. What the agent claims is compared, on a
                    fixed cadence, against ground truth in the system of
                    record, with a delivered alert — not just a logged one —
                    on any divergence. This control is part of the
                    delivered system, not part of Tioga&apos;s project
                    management, and keeps running after handover.
                  </li>
                </ul>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  A weekly written status goes to the sponsor and control
                  owner: milestones planned versus actual, decisions taken,
                  risks that changed, evidence produced, and anything
                  slipping, stated honestly. Each milestone is an acceptance
                  event — the named deliverable is tested against its
                  acceptance criteria with the control owner present where
                  it touches a control, and accepted or returned in
                  writing; payment follows acceptance. The client may stop
                  at any milestone with no further obligation.
                </p>
                <GateBox label="Gate — cutover (for any deliverable acting on production data or actions)">
                  Shadow-agreement report signed; the reconciliation control
                  running and producing logs for the full shadow window; a
                  tested rollback path; named approvers confirmed in the
                  client&apos;s own system, not in Tioga&apos;s
                  documentation; the client&apos;s control owner signs the
                  cutover authorization. Governance-only engagements have no
                  cutover gate.
                </GateBox>
              </div>

              {/* Phase 4 */}
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Phase 4 — Show me it&apos;s true</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                  Tioga assembles, for the client&apos;s control owners and
                  auditors, the evidence that what was delivered is what was
                  specified, that it behaves as its controls say, and that
                  its controls map to the frameworks the client answers to.
                  The evidence pack is compiled from a ledger that has been
                  accumulating since kickoff — not written at the end.
                  Acceptance is demonstrated live in front of the control
                  owner: the positive cases (the agent does the work), the
                  boundary cases (a lower-autonomy action stops and waits; a
                  human-owned action is not available to the agent at all,
                  demonstrated by showing the tool grant, not by asking the
                  agent to refuse), and the failure cases (the
                  reconciliation control catches an injected divergence; the
                  rollback path works). The failure demonstration is
                  required because it&apos;s the part a buyer can&apos;t
                  otherwise verify.
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Each control in the delivered system is mapped to the
                  applicable framework language — NIST AI RMF, ISO 42001, EU
                  AI Act, or US state law where the client is in scope — as
                  a table naming the control, the evidence artifact that
                  proves it, and the framework reference. A control with no
                  evidence artifact isn&apos;t listed as a control;
                  it&apos;s listed as a gap.
                </p>
                <GateBox label="Gate — acceptance">
                  The acceptance test record is signed by the client
                  sponsor and control owner, the evidence pack is
                  delivered, and the final milestone payment follows.
                </GateBox>
              </div>

              {/* Phase 5 */}
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Phase 5 — Nothing depends on one person after this</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Tioga proves, rather than promises, that it is not a
                  runtime dependency and that the client can operate,
                  change, and audit what was delivered without Tioga. Every
                  access Tioga was granted is revoked by the client with
                  Tioga watching, and each revocation is recorded.
                  Repositories are confirmed under client ownership. The
                  reconciliation control is confirmed running under a
                  client-owned schedule with a client-owned alert
                  destination. Knowledge transfer runs as working sessions
                  against the runbook — the client engineer performs a
                  change; the client control owner reads a reconciliation
                  log and an evidence record. Any client material still in
                  Tioga&apos;s environment is scheduled for deletion at the
                  end of the post-delivery clarification window.
                </p>
                <GateBox label="Gate — close">
                  The continuity checklist is executed with zero open access
                  items, handover is accepted in writing, and
                  clarification-window dates are stated.
                </GateBox>
              </div>

              {/* Phase 6 */}
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Phase 6 — Standing coverage, renewed on your terms</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                  Three offers are ongoing: ERP Modernization Advisory,
                  Fractional AI Governance Officer, and Standing Watch
                  Retainer. They still enter through Phases 0-2 — the
                  Discovery Sprint scopes the first period&apos;s priorities
                  and produces the baseline the retainer is measured
                  against. Delivery is then periodic rather than
                  milestone-shaped: Standing Watch runs a weekly automated
                  watch, a monthly human review, and a quarterly evidence
                  pack mapped to NIST AI RMF, ISO 42001, and the EU AI Act;
                  Fractional AI Governance Officer and ERP Modernization
                  Advisory run on a monthly cycle with a monthly written
                  review and a quarterly evidence or decision pack, using
                  the same one-page structure as the weekly status report
                  so the client never sees two report formats.
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Verification stays unconditional on a retainer — the
                  weekly run happens whether or not anything looks wrong —
                  and any proposed change to a control shadows first, the
                  same as during delivery. Each period ends with an
                  explicit continue/stop decision the client can take at any
                  period end, and a retainer exit follows the same handover
                  process as any other engagement in full. Nothing about
                  &quot;ongoing&quot; exempts it.
                </p>
                <GateBox label="Gate — renewal, each period">
                  An explicit continue/stop decision, yours to make at every
                  period end. A retainer exit follows the same handover
                  process as any other engagement, in full.
                </GateBox>
              </div>
            </div>
          </div>

          {/* Governance and evidence discipline */}
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>Governance and evidence discipline</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Every engagement, regardless of offer, produces evidence
              against the three delivery standards at every phase. Where an
              offer has no built agent — a pure governance assessment — the
              standards still apply to Tioga&apos;s own delivery process,
              and the client-facing artifacts describe the client&apos;s
              agents rather than Tioga&apos;s.
            </p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              <strong style={{ color: "var(--text)" }}>The evidence ledger.</strong> Opened
              at first contact, append-only, one row per artifact or event:
              date, what, where it lives, who produced it, who verified it,
              who signed it. This is the backbone of the evidence pack, and
              it&apos;s also the artifact Tioga would hand to its own
              auditor, or to a client who asks &quot;show me how you
              worked&quot; — it has to be able to bear that reading.
            </p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              <strong style={{ color: "var(--text)" }}>What counts as evidence.</strong> An
              artifact only counts as evidence in a Tioga engagement if it
              is attributable (names a human or an agent type, never
              &quot;the system&quot;); timestamped at creation and immutable
              or versioned thereafter; reproducible (a control owner can
              re-run the check and get the same result, without Tioga);
              located (a path, a system, an owner, a retention period); and
              tied to a framework reference where one applies, or listed as
              a gap where it doesn&apos;t yet have one. Anything that fails
              one of these is recorded, but as a claim — not as evidence.
            </p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              <strong style={{ color: "var(--text)" }}>Self-application.</strong> This is
              the &quot;consistency is an operating fact&quot; claim made
              checkable — each row below is something a prospect can be
              shown, mapped to the client-facing artifact that embodies the
              same discipline:
            </p>
            <div className="overflow-x-auto rounded-2xl mb-8" style={{ border: "1px solid var(--border)" }}>
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-card)" }}>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">What Tioga runs on its own estate</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent)" }}>What the client gets</th>
                  </tr>
                </thead>
                <tbody>
                  {SELF_APPLICATION_ROWS.map((r, i) => (
                    <tr key={r.runs} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 1 ? "var(--bg-dark)" : "transparent" }}>
                      <td className="p-4 text-[var(--text-muted)] leading-relaxed align-top">{r.runs}</td>
                      <td className="p-4 text-[var(--text-muted)] leading-relaxed align-top">{r.client}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              <strong style={{ color: "var(--text)" }}>What a control owner should be able to ask, and get:</strong>
            </p>
            <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--border)" }}>
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-card)" }}>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Question</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent)" }}>What answers it</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTROL_OWNER_ROWS.map((r, i) => (
                    <tr key={r.question} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 1 ? "var(--bg-dark)" : "transparent" }}>
                      <td className="p-4 font-medium text-[var(--text)] leading-relaxed align-top">{r.question}</td>
                      <td className="p-4 text-[var(--text-muted)] leading-relaxed align-top">{r.answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs italic text-[var(--text-muted-2)] text-center">
            This is an excerpt. The full methodology, including
            practice-specific delivery patterns and Tioga&apos;s internal
            process detail, is available on request.
          </p>
        </div>

        <div className="mt-16 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/discovery-sprint"
              className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
            >
              Start with the Discovery Sprint →
            </Link>
            <Link
              href="/contact"
              className="inline-block px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-[var(--text)]"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              Talk to Tioga AI
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
