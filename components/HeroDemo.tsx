"use client";

import { useEffect, useState } from "react";
import TrackedCTA from "@/components/TrackedCTA";

type Phase = "input" | "processing" | "output";

interface Field {
  label: string;
  value: string;
}

interface Scenario {
  tag: string;
  icon: string;
  filename: string;
  fields: Field[];
  time: string;
  demoHref: string;
}

// Field values mirror real output shapes from the live /demos tabs
// (DocResult / EmailResult) so this stays an honest preview, not a
// fabricated capability — see app/demos/page.tsx.
const SCENARIOS: Scenario[] = [
  {
    tag: "AP Automation",
    icon: "📄",
    filename: "invoice_meridian_logistics.pdf",
    fields: [
      { label: "Vendor", value: "Meridian Logistics" },
      { label: "Amount", value: "$18,450.00" },
      { label: "Document type", value: "Invoice — Net 30" },
      { label: "Confidence", value: "98%" },
      { label: "Routed to", value: "3-way match queue" },
    ],
    time: "2.1s",
    demoHref: "/demos?tab=invoice",
  },
  {
    tag: "Operations",
    icon: "📧",
    filename: "RE: Ticket #4821 — production down",
    fields: [
      { label: "Category", value: "Complaint" },
      { label: "Urgency", value: "Critical" },
      { label: "Sentiment", value: "Frustrated" },
      { label: "Route to", value: "Support escalation" },
      { label: "Draft reply", value: "Generated, pending review" },
    ],
    time: "1.4s",
    demoHref: "/demos?tab=email",
  },
];

const INPUT_MS = 900;
const PROCESSING_MS = 1100;
const FIELD_STEP_MS = 350;
const HOLD_MS = 1900;

// A looping, honestly-labeled preview built from real demo output shapes —
// not a live model call on every homepage view, which would put API cost
// and latency on every visitor instead of only the ones who click through
// to /demos. See 2026-08-08 design review synthesis, item 10.
export default function HeroDemo() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("input");
  const [revealCount, setRevealCount] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timers.push(setTimeout(() => { if (!cancelled) fn(); }, ms));
    };

    if (phase === "input") {
      schedule(() => setPhase("processing"), INPUT_MS);
    } else if (phase === "processing") {
      schedule(() => { setRevealCount(0); setPhase("output"); }, PROCESSING_MS);
    } else {
      const fields = SCENARIOS[scenarioIndex].fields;
      if (revealCount < fields.length) {
        schedule(() => setRevealCount((c) => c + 1), FIELD_STEP_MS);
      } else {
        schedule(() => {
          setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
          setPhase("input");
        }, HOLD_MS);
      }
    }

    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [phase, revealCount, scenarioIndex, reducedMotion]);

  const scenario = SCENARIOS[scenarioIndex];
  const effectivePhase: Phase = reducedMotion ? "output" : phase;
  const effectiveRevealCount = reducedMotion ? scenario.fields.length : revealCount;

  return (
    <div data-testid="hero-demo" className="mx-auto mt-10 mb-2" style={{ maxWidth: "420px" }}>
      <div
        className="rounded-2xl overflow-hidden text-left"
        style={{ background: "var(--bg-darker)", border: "1px solid var(--border)" }}
      >
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--error)" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--warning)" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--success-dark)" }} />
          </div>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted-2)" }}>{scenario.tag}</span>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: "#00D4FF10", color: "var(--accent)", border: "1px solid #00D4FF25" }}
          >
            sample run
          </span>
        </div>

        <div className="p-4" style={{ minHeight: "188px" }}>
          <div className="flex items-center gap-2 text-sm mb-3" style={{ color: "var(--text)" }}>
            <span className="text-lg leading-none">{scenario.icon}</span>
            <span className="font-mono text-xs truncate">{scenario.filename}</span>
          </div>

          {effectivePhase === "processing" && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono" style={{ color: "var(--text-muted-2)" }}>processing</span>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "var(--text-muted-2)", animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          )}

          {effectivePhase === "output" && (
            <div className="space-y-1.5">
              {scenario.fields.slice(0, effectiveRevealCount).map((f) => (
                <div key={f.label} className="flex items-baseline justify-between text-xs gap-3 field-fade-in">
                  <span style={{ color: "var(--text-muted-2)" }}>{f.label}</span>
                  <span className="font-mono text-right" style={{ color: "var(--text)" }}>{f.value}</span>
                </div>
              ))}
              {effectiveRevealCount >= scenario.fields.length && (
                <div
                  className="pt-2 mt-2 text-xs font-mono flex items-center gap-1.5 field-fade-in"
                  style={{ borderTop: "1px solid var(--border)", color: "var(--success)" }}
                >
                  ✓ Structured in {scenario.time}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <TrackedCTA
        href={scenario.demoHref}
        event="cta_hero_demo_widget"
        data={{ location: "hero_demo_widget", scenario: scenario.tag }}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-white"
        style={{ color: "var(--accent)" }}
      >
        Run this yourself, with your own file or email →
      </TrackedCTA>
    </div>
  );
}
