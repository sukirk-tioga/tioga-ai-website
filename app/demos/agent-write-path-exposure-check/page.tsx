"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DemoShell from "../_lib/demo-shell";
import TrackedCTA from "@/components/TrackedCTA";
import {
  ACCESS_PATHS,
  QUESTIONS,
  TARGET_SYSTEMS,
  scoreExposure,
  type Answer,
} from "./lib/questions";

// Everything on this page runs in your browser; nothing you select is sent
// to a server or logged. The scoring is authored rules over twelve control
// points on one agent write — not a model call and not a maturity score.
// "Not sure" is kept separate from "No": an unconfirmed control is not
// reported as a gap (same rule as the Fusion readiness assessment).

const ANSWER_OPTIONS: { value: Answer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

const BAND_COPY: Record<string, { label: string; color: string; line: string }> = {
  high: {
    label: "High exposure",
    color: "var(--error)",
    line: "Several core write-path controls are missing. An agent write here could commit without a dedicated identity, an application-logic path, native attribution, or a named approval.",
  },
  moderate: {
    label: "Moderate exposure",
    color: "var(--warning)",
    line: "The core of the write path is in place, but specific controls you reported missing would each weaken the evidence or the recovery if a write went wrong.",
  },
  low: {
    label: "Low reported exposure",
    color: "var(--success)",
    line: "You reported every control in place. That is a self-report, not a verification.",
  },
  unclear: {
    label: "Exposure unclear",
    color: "var(--text-muted)",
    line: "Too many controls are unconfirmed to call the exposure high or low. Finding out is the first step.",
  },
};

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
      style={{
        background: selected ? "#C8340615" : "var(--bg-dark)",
        border: `1px solid ${selected ? "#C8340650" : "var(--border)"}`,
        color: selected ? "var(--accent-on-tint)" : "var(--text-muted)",
      }}
    >
      {children}
    </button>
  );
}

export default function AgentWritePathExposureCheckPage() {
  const [answers, setAnswers] = useState<Record<string, Answer | undefined>>({});
  const [system, setSystem] = useState<string>("");
  const [path, setPath] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const answered = QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const result = useMemo(() => scoreExposure(answers), [answers]);
  const band = BAND_COPY[result.band];

  const setAnswer = (id: string, value: Answer) => setAnswers((prev) => ({ ...prev, [id]: value }));
  const reset = () => {
    setAnswers({});
    setSystem("");
    setPath("");
    setShowResult(false);
  };

  return (
    <DemoShell
      title="Agent Write-Path Exposure Check"
      badge="Free Self-Check — Rules-Based, Not a Model Call"
      evidenceTier="browser-simulation"
      evidenceDetail="Runs entirely in your browser. Nothing you select is sent anywhere. Your answers are self-reported and unaudited."
      description="Twelve control points on one agent write into an ERP or CRM. It shows where that write is exposed and which starting route fits — it is not a maturity score."
    >
      <div
        className="p-5 rounded-2xl mb-8 text-sm text-[var(--text-muted)] leading-relaxed"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        Pick <strong style={{ color: "var(--text)" }}>one</strong> agent action that writes to a system of record — for
        example posting an invoice exception, updating a purchase order, or changing a customer record — and answer for
        that write. <strong style={{ color: "var(--text)" }}>&ldquo;Not sure&rdquo; is a valid answer</strong> and is
        reported as unconfirmed, not as a gap.
      </div>

      {/* Context (not scored) */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label htmlFor="wpec-system" className="text-xs text-[var(--text-muted)] mb-1.5 block">
            Which system does the agent write to? <span className="opacity-70">(optional, not scored)</span>
          </label>
          <select
            id="wpec-system"
            value={system}
            onChange={(e) => setSystem(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            <option value="">Select…</option>
            {TARGET_SYSTEMS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="wpec-path" className="text-xs text-[var(--text-muted)] mb-1.5 block">
            How does the agent reach it today? <span className="opacity-70">(optional, not scored)</span>
          </label>
          <select
            id="wpec-path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            <option value="">Select…</option>
            {ACCESS_PATHS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions */}
      <ol className="space-y-5 mb-8">
        {QUESTIONS.map((q, i) => (
          <li
            key={q.id}
            className="p-5 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <p id={`wpec-q-${q.id}`} className="text-sm leading-relaxed mb-3" style={{ color: "var(--text)" }}>
              <span className="font-mono text-xs mr-2" style={{ color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")}</span>
              {q.ask}
            </p>
            <div role="radiogroup" aria-labelledby={`wpec-q-${q.id}`} className="flex flex-wrap gap-2">
              {ANSWER_OPTIONS.map((o) => (
                <Choice key={o.value} selected={answers[q.id] === o.value} onClick={() => setAnswer(q.id, o.value)}>
                  {o.label}
                </Choice>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-4 mb-10">
        <button
          type="button"
          onClick={() => setShowResult(true)}
          className="px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
          style={{ background: "var(--accent-dark)" }}
        >
          See my exposure read
        </button>
        <span className="text-sm text-[var(--text-muted)]" aria-live="polite">
          {answered} of {QUESTIONS.length} answered{answered < QUESTIONS.length ? " — unanswered count as unconfirmed" : ""}
        </span>
        {(answered > 0 || showResult) && (
          <button type="button" onClick={reset} className="text-sm underline underline-offset-2 text-[var(--text-muted)] hover:text-[var(--text)]">
            Start over
          </button>
        )}
      </div>

      {/* Result */}
      {showResult && (
        <section aria-labelledby="wpec-result-title" data-testid="wpec-result" className="space-y-6">
          <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: `1px solid ${band.color}` }}>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">Your exposure read</p>
            <h2 id="wpec-result-title" className="text-2xl font-bold mb-2" style={{ color: band.color }}>{band.label}</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-5">{band.line}</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { n: result.covered, label: "Reported in place", color: "var(--success)" },
                { n: result.exposed, label: "Exposed (No)", color: "var(--error)" },
                { n: result.unconfirmed, label: "Unconfirmed", color: "var(--text-muted)" },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
                  <p className="text-2xl font-bold font-mono" style={{ color: s.color }} data-testid={`wpec-count-${s.label.split(" ")[0].toLowerCase()}`}>{s.n}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            {(system || path) && (
              <p className="text-xs text-[var(--text-muted)] mt-4">
                Context you gave (not scored): {[system, path].filter(Boolean).join(" · ")}.
              </p>
            )}
          </div>

          {result.exposedQuestions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>Where this write is exposed</h3>
              <ul className="space-y-3">
                {result.exposedQuestions.map((q) => (
                  <li key={q.id} className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
                      {q.ask}
                      {q.weight === "core" && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide align-middle" style={{ color: "var(--error)", border: "1px solid var(--error)" }}>Core</span>
                      )}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-1">{q.whyItMatters}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                      <span className="font-semibold">First step:</span> {q.firstStep}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.unconfirmedQuestions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text)" }}>Still to confirm</h3>
              <p className="text-sm text-[var(--text-muted)] mb-3">
                These are not counted as gaps. They are things nobody on the call could confirm — which is itself worth knowing.
              </p>
              <ul className="space-y-2">
                {result.unconfirmedQuestions.map((q) => (
                  <li key={q.id} className="text-sm text-[var(--text-muted)] leading-relaxed">
                    <span style={{ color: "var(--text)" }}>{q.ask}</span> — <span className="italic">to confirm: {q.firstStep}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--accent)" }}>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">Suggested starting route</p>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>{result.route.name}</h3>
            <p className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>{result.route.price}</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-5">{result.route.reason}</p>
            <div className="flex flex-wrap gap-3">
              <TrackedCTA
                href={result.route.href}
                event="cta_exposure_check_route"
                data={{ route: result.route.id, band: result.band }}
                className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: "var(--accent-dark)" }}
              >
                See the {result.route.name} →
              </TrackedCTA>
              <Link
                href="/contact?offer=Exposure%20check%20follow-up"
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                Talk it through
              </Link>
            </div>
            {result.suggestDiagnostic && (
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-4">
                Three or more core write-path controls are exposed. The{" "}
                <Link href="/solutions/governed-write-path" className="underline underline-offset-2" style={{ color: "var(--accent)" }}>
                  Agent-Ready ERP Diagnostic &amp; Governed Write-Path
                </Link>{" "}
                is scoped around exactly this — one stalled write path, assessed and rebuilt to go through the system&apos;s own application logic.
              </p>
            )}
          </div>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            <strong style={{ color: "var(--text)" }}>What this is and isn&apos;t.</strong> A rules-based self-check on one write path, built from the
            controls Tioga scopes in governed-write-path engagements. Answers are self-reported and unverified; &ldquo;in place&rdquo; means you said
            yes, not that anyone tested it. It does not assess your organization&apos;s AI maturity, security posture, or regulatory compliance, and
            it is not a substitute for testing the write path against your actual system.
          </p>
        </section>
      )}
    </DemoShell>
  );
}
