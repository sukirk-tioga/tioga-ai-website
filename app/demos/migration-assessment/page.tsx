"use client";

import { useEffect, useState } from "react";
import DemoShell from "../_lib/demo-shell";

// ── Options (must mirror the API's allowed enums) ────────────────────────────
const VERSIONS = ["R12.1", "R12.2"];
const MODULES = [
  { id: "FI", label: "FI · Financials" },
  { id: "AP", label: "AP · Payables" },
  { id: "AR", label: "AR · Receivables" },
  { id: "GL", label: "GL · General Ledger" },
  { id: "FA", label: "FA · Fixed Assets" },
  { id: "INV", label: "INV · Inventory" },
  { id: "PO", label: "PO · Purchasing" },
];
const VOLUMES = ["1-10GB", "10-100GB", "100GB-1TB", "1TB+"];
const TARGETS = ["S/4HANA Cloud", "S/4HANA Private Cloud", "S/4HANA On-Premise"];

const PROGRESS_STAGES = [
  "Analyzing module footprint…",
  "Scoring complexity…",
  "Drafting assessment…",
];

interface Assessment {
  complexityScore: number;
  scoreReasoning: string;
  timelineRange: string;
  topRisks: { title: string; detail: string }[];
  recommendedApproach: { approach: string; reasoning: string };
  nextSteps: string[];
}

const inputStyle = {
  background: "#0A0F1C",
  border: "1px solid #1E2D4A",
} as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      {children}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const color = score <= 3 ? "#4ADE80" : score <= 6 ? "#FBBF24" : "#F87171";
  return (
    <div className="relative w-24 h-24 flex-none">
      <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1E2D4A" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 10)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white leading-none">{score}</span>
        <span className="text-[10px] text-slate-500 mt-0.5">/ 10</span>
      </div>
    </div>
  );
}

export default function MigrationAssessmentPage() {
  const [version, setVersion] = useState(VERSIONS[1]);
  const [modules, setModules] = useState<string[]>(["FI", "GL", "AP"]);
  const [dataVolume, setDataVolume] = useState(VOLUMES[1]);
  const [target, setTarget] = useState(TARGETS[0]);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Assessment | null>(null);

  useEffect(() => {
    if (state !== "loading") return;
    setStage(0);
    const t = setInterval(
      () => setStage((s) => Math.min(s + 1, PROGRESS_STAGES.length - 1)),
      1800
    );
    return () => clearInterval(t);
  }, [state]);

  const toggleModule = (id: string) =>
    setModules((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  const submit = async () => {
    setState("loading");
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/demos/migration-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, modules, dataVolume, target, email: email || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed.");
      setResult(json.assessment);
      setState("done");
    } catch (e: unknown) {
      setError((e as Error).message ?? "Something went wrong.");
      setState("error");
    }
  };

  return (
    <DemoShell
      title="Migration Assessment"
      description="Answer four questions about your Oracle EBS environment and get a sample S/4HANA migration readiness assessment — generated in about 60 seconds."
    >
      {/* Form */}
      <div className="p-6 rounded-2xl" style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}>
        <h2 className="font-semibold text-white mb-5">Tell us about your Oracle EBS environment</h2>
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Oracle EBS version">
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-slate-500"
                style={inputStyle}
              >
                {VERSIONS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Approximate data volume">
              <select
                value={dataVolume}
                onChange={(e) => setDataVolume(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-slate-500"
                style={inputStyle}
              >
                {VOLUMES.map((v) => <option key={v} value={v}>{v.replace("-", "–")}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Modules in use">
            <div className="flex flex-wrap gap-2">
              {MODULES.map((m) => {
                const on = modules.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleModule(m.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: on ? "#00D4FF15" : "transparent",
                      border: `1px solid ${on ? "#00D4FF50" : "#1E2D4A"}`,
                      color: on ? "#00D4FF" : "#94A3B8",
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Target SAP edition">
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-slate-500"
                style={inputStyle}
              >
                {TARGETS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Send me a copy — optional">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-slate-500 placeholder:text-slate-600"
                style={inputStyle}
              />
            </Field>
          </div>

          <button
            onClick={submit}
            disabled={state === "loading" || modules.length === 0}
            className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
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
          {modules.length === 0 && (
            <p className="text-xs text-slate-500 text-center -mt-2">Select at least one module.</p>
          )}
          {state === "error" && (
            <p className="text-sm text-center" style={{ color: "#F87171" }}>{error}</p>
          )}
        </div>
      </div>

      {/* Results */}
      {state === "done" && result && (
        <div className="mt-8">
          <div className="p-6 rounded-2xl" style={{ background: "#0D1526", border: "1px solid #00D4FF30" }}>
            {/* Score + timeline */}
            <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 mb-6" style={{ borderBottom: "1px solid #1E2D4A" }}>
              <ScoreRing score={result.complexityScore} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">Migration Complexity</h3>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wide"
                    style={{ background: "#00D4FF15", border: "1px solid #00D4FF40", color: "#00D4FF" }}
                  >
                    {result.recommendedApproach.approach}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-3">{result.scoreReasoning}</p>
                <p className="text-sm">
                  <span className="text-slate-500">Estimated timeline: </span>
                  <span className="text-white font-semibold font-mono">{result.timelineRange}</span>
                </p>
              </div>
            </div>

            {/* Risks */}
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Top Risks</h4>
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              {result.topRisks.map((r, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}>
                  <p className="text-sm font-semibold mb-1.5" style={{ color: "#FBBF24" }}>{r.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{r.detail}</p>
                </div>
              ))}
            </div>

            {/* Approach + next steps */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl" style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Recommended approach</p>
                <p className="text-sm text-slate-300 leading-relaxed">{result.recommendedApproach.reasoning}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Next steps</p>
                <ul className="space-y-1.5">
                  {result.nextSteps.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span style={{ color: "#00D4FF" }}>→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4 max-w-lg mx-auto">
            This is a sample assessment. A full assessment includes data profiling, code analysis,
            and a module-by-module roadmap.
          </p>
        </div>
      )}
    </DemoShell>
  );
}
