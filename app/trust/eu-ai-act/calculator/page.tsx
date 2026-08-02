"use client";

import { useMemo, useState } from "react";

// Deterministic, rules-based classification — not a model call. Real
// regulatory classification isn't something we're willing to let an LLM
// improvise; this is authored logic against the Act's published risk tiers.

type Tier = "none" | "prohibited" | "high" | "limited" | "minimal";

const PROHIBITED_ITEMS = [
  { id: "social-scoring", label: "Social scoring of individuals by a public authority" },
  { id: "realtime-biometric", label: "Real-time remote biometric identification in public spaces for law enforcement" },
  { id: "manipulation", label: "Subliminal or manipulative techniques designed to distort behavior and cause harm" },
  { id: "exploiting-vulnerabilities", label: "Exploiting vulnerabilities of children, elderly, or disabled people to distort behavior" },
];

const HIGH_RISK_ITEMS = [
  { id: "employment", label: "Hiring, promotion, or termination decisions" },
  { id: "credit", label: "Credit scoring, loan, or insurance underwriting decisions" },
  { id: "law-enforcement", label: "Law enforcement risk assessment or predictive policing" },
  { id: "critical-infra", label: "Safety component of critical infrastructure (energy, water, transport)" },
  { id: "education", label: "Student assessment, exam scoring, or admissions decisions" },
  { id: "migration", label: "Migration, asylum, or border control decisions" },
  { id: "essential-services", label: "Determining access to essential services (benefits, utilities, insurance)" },
  { id: "biometric-id", label: "Biometric identification or categorization (not real-time law enforcement)" },
];

const LIMITED_RISK_ITEMS = [
  { id: "chatbot", label: "Chatbot or conversational AI that interacts directly with people" },
  { id: "synthetic-content", label: "AI-generated or synthetic content — text, image, audio, video, deepfakes" },
  { id: "emotion-recognition", label: "Emotion recognition systems" },
];

const RESULTS: Record<Tier, { title: string; color: string; penalty: string; body: string; cta: { label: string; href: string } }> = {
  none: {
    title: "Likely minimal exposure today",
    color: "var(--success)",
    penalty: "—",
    body: "Based on what you selected, you don't have EU exposure to worry about right now. That can change fast as AI usage grows inside an organization — worth revisiting if that's in motion.",
    cta: { label: "See the full exposure breakdown →", href: "/trust/eu-ai-act" },
  },
  prohibited: {
    title: "This falls under prohibited practices",
    color: "var(--error)",
    penalty: "Up to €35M or 7% of global annual turnover",
    body: "Article 5 prohibited practices aren't a compliance gap to document — they're already illegal in the EU, in force since February 2025. This isn't something a governance program brings into compliance; it needs legal review and likely a redesign or discontinuation of this specific use case. If you want an independent technical read on whether this classification is actually right, that's something we can help with.",
    cta: { label: "Get a second opinion →", href: "/#contact" },
  },
  high: {
    title: "This falls under Annex III high-risk",
    color: "var(--warning)",
    penalty: "Up to €15M or 3% of global annual turnover",
    body: "High-risk systems require a conformity assessment, technical documentation, a risk management system, and human oversight before deployment — obligations phasing in through August 2026. This is exactly what a conformity program is built to produce.",
    cta: { label: "See the EU AI Act Conformity Program →", href: "/services" },
  },
  limited: {
    title: "This falls under limited-risk transparency rules",
    color: "var(--accent)",
    penalty: "Same \"other obligations\" tier as high-risk: up to €15M or 3%",
    body: "Article 50 transparency obligations apply — disclosing that people are interacting with AI, and labeling AI-generated or synthetic content. Lower burden than high-risk, but still a real, enforceable requirement phasing in through August 2026.",
    cta: { label: "See what's already in force →", href: "/trust/eu-ai-act" },
  },
  minimal: {
    title: "No specific high-risk category identified",
    color: "var(--success)",
    penalty: "General obligations only",
    body: "Nothing you selected maps to a named risk tier under the Act. Voluntary codes of conduct and general AI literacy obligations still apply, but there's no elevated compliance burden based on what's selected here.",
    cta: { label: "See the full framework →", href: "/trust" },
  },
};

function CheckItem({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all"
      style={{ background: checked ? "#00D4FF10" : "transparent", border: `1px solid ${checked ? "#00D4FF40" : "var(--border)"}` }}
    >
      <span
        className="mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center text-[10px]"
        style={{ background: checked ? "var(--accent)" : "transparent", border: `1px solid ${checked ? "var(--accent)" : "var(--text-muted-3)"}` }}
      >
        {checked && <span style={{ color: "var(--bg-dark)" }}>✓</span>}
      </span>
      <span className="text-sm text-slate-300 leading-snug">{label}</span>
    </button>
  );
}

export default function EUAIActCalculatorPage() {
  const [euExposure, setEuExposure] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [gpai, setGpai] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const tier: Tier = useMemo(() => {
    if (euExposure === false) return "none";
    if (euExposure === null) return "none";
    if (PROHIBITED_ITEMS.some((i) => selected.has(i.id))) return "prohibited";
    if (HIGH_RISK_ITEMS.some((i) => selected.has(i.id))) return "high";
    if (LIMITED_RISK_ITEMS.some((i) => selected.has(i.id))) return "limited";
    return "minimal";
  }, [euExposure, selected]);

  const showQuestions = euExposure === true;
  const result = RESULTS[tier];

  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-4xl mx-auto">
        <a href="/trust/eu-ai-act" className="text-xs mb-6 inline-block hover:text-white transition-colors" style={{ color: "var(--accent)" }}>
          ← EU AI Act Exposure
        </a>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Readiness Calculator
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
          Which risk tier does your AI system fall into?
        </h1>
        <p className="text-slate-400 leading-relaxed max-w-2xl mb-4">
          A quick, rules-based check against the Act&apos;s published risk
          categories — not a model-generated guess. Select everything that
          applies; nothing here is saved or sent anywhere.
        </p>
        <p className="text-xs text-slate-400 mb-12">
          This is a directional check, not legal advice — a real classification
          depends on facts a form can&apos;t capture. Talk to counsel for anything
          consequential.
        </p>

        <div className="grid lg:grid-cols-[1fr,340px] gap-8">
          <div>
            {/* Q1 */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-white mb-3">
                Does your organization deploy or provide AI systems used by people in the EU?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setEuExposure(true)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: euExposure === true ? "#00D4FF15" : "var(--bg-card)", border: `1px solid ${euExposure === true ? "var(--accent)" : "var(--border)"}`, color: euExposure === true ? "var(--accent)" : "var(--text-muted)" }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setEuExposure(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: euExposure === false ? "#00D4FF15" : "var(--bg-card)", border: `1px solid ${euExposure === false ? "var(--accent)" : "var(--border)"}`, color: euExposure === false ? "var(--accent)" : "var(--text-muted)" }}
                >
                  No / not sure
                </button>
              </div>
            </div>

            {showQuestions && (
              <>
                <div className="mb-8">
                  <p className="text-sm font-semibold text-white mb-1">Does your AI system do any of the following?</p>
                  <p className="text-xs text-red-400 mb-3">These are prohibited practices under Article 5 — select if any apply.</p>
                  <div className="space-y-2">
                    {PROHIBITED_ITEMS.map((i) => (
                      <CheckItem key={i.id} checked={selected.has(i.id)} onChange={() => toggle(i.id)} label={i.label} />
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-sm font-semibold text-white mb-1">Is your AI system used for any of these?</p>
                  <p className="text-xs text-slate-400 mb-3">Annex III high-risk categories.</p>
                  <div className="space-y-2">
                    {HIGH_RISK_ITEMS.map((i) => (
                      <CheckItem key={i.id} checked={selected.has(i.id)} onChange={() => toggle(i.id)} label={i.label} />
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-sm font-semibold text-white mb-1">Does your AI system do any of these?</p>
                  <p className="text-xs text-slate-400 mb-3">Limited-risk — Article 50 transparency obligations.</p>
                  <div className="space-y-2">
                    {LIMITED_RISK_ITEMS.map((i) => (
                      <CheckItem key={i.id} checked={selected.has(i.id)} onChange={() => toggle(i.id)} label={i.label} />
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-sm font-semibold text-white mb-3">One more thing</p>
                  <CheckItem
                    checked={gpai}
                    onChange={() => setGpai(!gpai)}
                    label="We build or fine-tune our own general-purpose AI model — not just calling one via API"
                  />
                </div>
              </>
            )}
          </div>

          {/* Result panel */}
          <div className="lg:sticky lg:top-28 h-fit">
            {euExposure === null ? (
              <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">Result</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Answer the question above to see your likely risk tier.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: `1px solid ${result.color}40` }}>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">Result</p>
                <h2 className="text-lg font-bold mb-3" style={{ color: result.color }}>{result.title}</h2>
                <div className="mb-4 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Penalty exposure</p>
                  <p className="text-sm font-semibold text-white">{result.penalty}</p>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{result.body}</p>
                {gpai && euExposure && (
                  <p className="text-xs text-slate-400 leading-relaxed mb-5 p-3 rounded-lg" style={{ background: "var(--bg-dark)" }}>
                    You also flagged building your own model — that adds GPAI
                    provider obligations (documentation, copyright policy, and
                    systemic-risk assessment for the most capable models) on top
                    of whatever tier applies above.
                  </p>
                )}
                <a
                  href={result.cta.href}
                  className="block text-center px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
                >
                  {result.cta.label}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
