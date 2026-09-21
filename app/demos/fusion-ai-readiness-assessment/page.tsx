"use client";

import { useEffect, useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  CONTROL_STATES,
  CONTROL_STATE_LABELS,
  GOVERNANCE_CONTROLS,
  defaultControlSelections,
  summarizeControls,
  type ControlId,
  type ControlSelections,
  type ControlState,
} from "@/lib/fusion-readiness";

// ── Options (must mirror the API's allowed enums) ────────────────────────────
// The governance controls and their three states are shared with the API
// route via lib/fusion-readiness.ts.
const USE_CASES = [
  "AP invoice exceptions (Fusion Payables)",
  "Procurement requisition triage (Fusion Procurement)",
  "GL journal review & anomaly detection (Fusion General Ledger)",
  "Expense report auditing (Fusion Expenses)",
];
const VOLUMES = ["<1,000/month", "1,000–10,000/month", "10,000–100,000/month", "100,000+/month"];
const INTEGRATION_METHODS = [
  "No integration yet — planning phase",
  "Calling Fusion REST APIs directly",
  "Oracle Integration Cloud (OIC) as middleware",
  "Oracle AI Agent Studio (business-object + deep-link tools)",
];

const PROGRESS_STAGES = [
  "Reviewing governance posture…",
  "Scoring readiness…",
  "Drafting assessment…",
];

interface Assessment {
  readinessScore: number;
  scoreReasoning: string;
  keyGaps: { title: string; detail: string }[];
  recommendedApproach: { approach: string; reasoning: string };
  nextSteps: string[];
}

const APPROACH_LABELS: Record<string, string> = {
  "pilot-ready": "Pilot-ready",
  "needs-guardrails": "Needs guardrails",
  "not-ready": "Not ready",
};

const inputStyle = {
  background: "var(--bg-dark)",
  border: "1px solid var(--border)",
} as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">{label}</label>
      {children}
    </div>
  );
}

function ScoreRing({ score, provisional }: { score: number; provisional: boolean }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  // Inverted from the retired migration-complexity ring: here, higher is
  // better (more ready to safely run agents), not worse. While any control is
  // Unknown the score is provisional, so the ring stays neutral: a low number
  // caused by unconfirmed controls must not read as a red "fail".
  const color = provisional
    ? "var(--text-muted)"
    : score >= 8 ? "var(--success)" : score >= 5 ? "var(--warning-light)" : "var(--error-light)";
  return (
    <div className="relative w-24 h-24 flex-none">
      <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 10)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold leading-none" style={{ color: "var(--text)" }}>{score}</span>
        <span className="text-[10px] text-[var(--text-muted)] mt-0.5">/ 10</span>
      </div>
    </div>
  );
}

export default function FusionAiReadinessAssessmentPage() {
  const [useCase, setUseCase] = useState(USE_CASES[0]);
  const [transactionVolume, setTransactionVolume] = useState(VOLUMES[1]);
  const [integrationMethod, setIntegrationMethod] = useState(INTEGRATION_METHODS[0]);
  // Every control defaults to Unknown (not confirmed), never to Absent.
  const [governanceControls, setGovernanceControls] = useState<ControlSelections>(defaultControlSelections);
  // The Present / Absent / Unknown split the result was generated from; the
  // radios can change afterwards without the shown result changing.
  const [submittedControls, setSubmittedControls] = useState<ControlSelections | null>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Assessment | null>(null);
  const [emailed, setEmailed] = useState(false);

  useEffect(() => {
    if (state !== "loading") return;
    setStage(0);
    const t = setInterval(
      () => setStage((s) => Math.min(s + 1, PROGRESS_STAGES.length - 1)),
      1800
    );
    return () => clearInterval(t);
  }, [state]);

  const setControl = (id: ControlId, value: ControlState) =>
    setGovernanceControls((c) => ({ ...c, [id]: value }));
  const liveCounts = summarizeControls(governanceControls);
  const resultCounts = submittedControls ? summarizeControls(submittedControls) : null;

  const submit = async () => {
    setState("loading");
    setError("");
    setResult(null);
    setSubmittedControls(governanceControls);
    try {
      const res = await fetch("/api/demos/fusion-ai-readiness-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCase, transactionVolume, integrationMethod, governanceControls, email: email || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed.");
      setResult(json.assessment);
      setEmailed(Boolean(json.emailed));
      setState("done");
    } catch (e: unknown) {
      setError((e as Error).message ?? "Something went wrong.");
      setState("error");
    }
  };

  return (
    <DemoShell
      title="Oracle Fusion Cloud AI-Readiness Assessment"
      evidenceTier="model-demonstration"
      evidenceDetail="Claude Sonnet 5 reasons live, via the production endpoint, over the allowlisted Fusion Cloud ERP scenario you select — it does not connect to a live Fusion tenant. A real Fusion sandbox connection is a planned follow-up (Phase B), not yet built."
      description="Answer a few questions about your Oracle Fusion Cloud ERP environment and get a sample AI-agent-readiness assessment — covering role/security scope, REST API discipline, audit-trail readiness, and human-approval gates — generated in about 60 seconds."
    >
      {/* Form */}
      <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-5" style={{ color: "var(--text)" }}>Tell me about your Fusion Cloud ERP environment</h2>
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Target agent use case">
              <select
                aria-label="Target agent use case"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-slate-500"
                style={inputStyle}
              >
                {USE_CASES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Approximate transaction volume">
              <select
                aria-label="Approximate transaction volume"
                value={transactionVolume}
                onChange={(e) => setTransactionVolume(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-slate-500"
                style={inputStyle}
              >
                {VOLUMES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Current integration method">
            <select
              aria-label="Current integration method"
              value={integrationMethod}
              onChange={(e) => setIntegrationMethod(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-slate-500"
              style={inputStyle}
            >
              {INTEGRATION_METHODS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>

          <div role="group" aria-labelledby="fusion-controls-heading" aria-describedby="fusion-controls-help">
            <p id="fusion-controls-heading" className="text-sm font-medium text-[var(--text-muted)] mb-1">
              Governance controls — mark each one Present, Absent, or Unknown
            </p>
            <p id="fusion-controls-help" className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
              <strong style={{ color: "var(--text)" }}>Present</strong> = you can confirm it is in place.{" "}
              <strong style={{ color: "var(--text)" }}>Absent</strong> = you can confirm it is missing.{" "}
              <strong style={{ color: "var(--text)" }}>Unknown</strong> = you can&apos;t confirm either way (the default).
              Unknown controls are reported as &ldquo;to confirm&rdquo;, never as missing.
            </p>
            <div className="flex flex-col gap-2">
              {GOVERNANCE_CONTROLS.map((c) => (
                <fieldset
                  key={c.id}
                  className="min-w-0 px-3 py-2.5 rounded-lg"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <legend className="float-left w-full text-xs font-medium mb-2" style={{ color: "var(--text)" }}>
                    {c.label}
                  </legend>
                  <div className="clear-both flex flex-wrap gap-2">
                    {CONTROL_STATES.map((s) => {
                      const on = governanceControls[c.id] === s;
                      return (
                        <label
                          key={s}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
                          style={{
                            background: on ? "#C8340615" : "transparent",
                            border: `1px solid ${on ? "#C8340650" : "var(--border)"}`,
                            color: on ? "var(--accent-on-tint)" : "var(--text-muted)",
                          }}
                        >
                          <input
                            type="radio"
                            name={`fusion-control-${c.id}`}
                            value={s}
                            checked={on}
                            onChange={() => setControl(c.id, s)}
                            className="h-4 w-4 cursor-pointer"
                            style={{ accentColor: "var(--accent)" }}
                          />
                          {CONTROL_STATE_LABELS[s]}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
            <p role="status" aria-live="polite" data-testid="fusion-control-counts" className="text-xs text-[var(--text-muted)] mt-3">
              {liveCounts.present.length} Present · {liveCounts.absent.length} Absent · {liveCounts.unknown.length} Unknown
              {liveCounts.unknown.length > 0 ? " — Unknown is not counted as missing." : ""}
            </p>
          </div>

          <Field label="Send me a copy — optional">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-slate-500 placeholder:text-[var(--text-muted)]"
              style={inputStyle}
            />
          </Field>

          <button
            onClick={submit}
            disabled={state === "loading"}
            className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            {state === "loading" ? (
              <span className="inline-flex items-center gap-2.5">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {PROGRESS_STAGES[stage]}
              </span>
            ) : (
              "Generate Readiness Assessment"
            )}
          </button>
          <p role="status" aria-live="polite" className="sr-only">
            {state === "loading" ? PROGRESS_STAGES[stage] : state === "done" ? "Assessment ready; the results are shown below." : ""}
          </p>
          {state === "error" && (
            <p role="alert" className="text-sm text-center" style={{ color: "var(--error-light)" }}>{error}</p>
          )}
        </div>
      </div>

      {/* Results */}
      {state === "done" && result && (
        <div className="mt-8">
          <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid #C8340630" }}>
            {/* Score + approach */}
            <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 mb-6" style={{ borderBottom: "1px solid var(--border)" }}>
              <ScoreRing score={result.readinessScore} provisional={(resultCounts?.unknown.length ?? 0) > 0} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>AI-Agent Readiness</h3>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wide"
                    style={{ background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent-on-tint)" }}
                  >
                    {APPROACH_LABELS[result.recommendedApproach.approach] ?? result.recommendedApproach.approach}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{result.scoreReasoning}</p>
                {resultCounts && (
                  <p data-testid="fusion-result-counts" className="text-xs text-[var(--text-muted)] mt-2">
                    Controls you reported: {resultCounts.present.length} Present · {resultCounts.absent.length} Absent · {resultCounts.unknown.length} Unknown.{" "}
                    {resultCounts.unknown.length > 0
                      ? "The score is provisional: it reflects only the controls you confirmed. Unknown controls are not confirmed either way. They are not counted as missing and are not a failing mark."
                      : "Every control was confirmed one way or the other, so the score reflects all five."}
                  </p>
                )}
              </div>
            </div>

            {resultCounts && resultCounts.unknown.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text)" }}>To confirm</h4>
                <p className="text-xs text-[var(--text-muted)] mb-2">These were marked Unknown. Finding out is the next step; none of them is reported as a gap.</p>
                <ul data-testid="fusion-to-confirm" className="space-y-1">
                  {resultCounts.unknown.map((label) => (
                    <li key={label} className="text-sm text-[var(--text-muted)] flex gap-2">
                      <span style={{ color: "var(--accent)" }} aria-hidden="true">?</span>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps */}
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text)" }}>Key Gaps To Close</h4>
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              {result.keyGaps.map((r, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
                  <p className="text-sm font-semibold mb-1.5" style={{ color: "var(--warning-light)" }}>{r.title}</p>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{r.detail}</p>
                </div>
              ))}
            </div>

            {/* Approach + next steps */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Recommended approach</p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{result.recommendedApproach.reasoning}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Next steps</p>
                <ul className="space-y-1.5">
                  {result.nextSteps.map((s, i) => (
                    <li key={i} className="text-sm text-[var(--text-muted)] flex gap-2">
                      <span style={{ color: "var(--accent)" }}>→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] text-center mt-4 max-w-lg mx-auto">
            This is a sample assessment against a scenario you selected, not your live tenant.
            A full assessment includes a real role/security-role audit, endpoint-by-endpoint API
            scope review, and a named rollout plan.
          </p>
          {emailed && (
            <p className="text-xs text-center mt-2" style={{ color: "var(--success)" }}>
              A copy has been emailed to {email}.
            </p>
          )}
          {email && !emailed && (
            <p className="text-xs text-[var(--text-muted)] text-center mt-2">
              I couldn&apos;t email a copy just now — you can still copy this page&apos;s results manually.
            </p>
          )}
        </div>
      )}
    </DemoShell>
  );
}
