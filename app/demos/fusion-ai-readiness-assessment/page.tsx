"use client";

import { useEffect, useState } from "react";
import DemoShell from "../_lib/demo-shell";

// ── Options (must mirror the API's allowed enums) ────────────────────────────
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
const GOVERNANCE_CONTROLS = [
  { id: "roles", label: "Agent-scoped security roles (not just seeded Fusion roles)" },
  { id: "api-scope", label: "REST API access scoped to specific endpoints, not broad admin access" },
  { id: "audit", label: "Structured audit trail exported to a governance/audit system" },
  { id: "approval", label: "Human-approval rules extended to agent-initiated actions" },
  { id: "incident", label: "Named incident-response owner for agent actions" },
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

function ScoreRing({ score }: { score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  // Inverted from the retired migration-complexity ring: here, higher is
  // better (more ready to safely run agents), not worse.
  const color = score >= 8 ? "var(--success)" : score >= 5 ? "var(--warning-light)" : "var(--error-light)";
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
  const [governanceControls, setGovernanceControls] = useState<string[]>([]);
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

  const toggleControl = (label: string) =>
    setGovernanceControls((c) => (c.includes(label) ? c.filter((x) => x !== label) : [...c, label]));

  const submit = async () => {
    setState("loading");
    setError("");
    setResult(null);
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
              value={integrationMethod}
              onChange={(e) => setIntegrationMethod(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-slate-500"
              style={inputStyle}
            >
              {INTEGRATION_METHODS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>

          <Field label="Governance controls already in place — select any that apply">
            <div className="flex flex-col gap-2">
              {GOVERNANCE_CONTROLS.map((c) => {
                const on = governanceControls.includes(c.label);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleControl(c.label)}
                    className="text-left px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: on ? "#C8340615" : "transparent",
                      border: `1px solid ${on ? "#C8340650" : "var(--border)"}`,
                      color: on ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {on ? "✓ " : ""}{c.label}
                  </button>
                );
              })}
            </div>
          </Field>

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
          {state === "error" && (
            <p className="text-sm text-center" style={{ color: "var(--error-light)" }}>{error}</p>
          )}
        </div>
      </div>

      {/* Results */}
      {state === "done" && result && (
        <div className="mt-8">
          <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid #C8340630" }}>
            {/* Score + approach */}
            <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 mb-6" style={{ borderBottom: "1px solid var(--border)" }}>
              <ScoreRing score={result.readinessScore} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>AI-Agent Readiness</h3>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wide"
                    style={{ background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent)" }}
                  >
                    {APPROACH_LABELS[result.recommendedApproach.approach] ?? result.recommendedApproach.approach}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{result.scoreReasoning}</p>
              </div>
            </div>

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
