"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

interface Classification {
  service: string;
  urgency: "low" | "medium" | "high" | "critical";
  complexity: string;
  summary: string;
  nextStep: string;
  responseTime: string;
  fitScore: number;
}

const urgencyColors = {
  low: { bg: "#C8340610", border: "#C8340630", text: "var(--accent)" },
  medium: { bg: "#F59E0B10", border: "#F59E0B30", text: "var(--warning)" },
  high: { bg: "#EF444410", border: "#EF444430", text: "var(--error)" },
  critical: { bg: "#EF444420", border: "var(--error)", text: "var(--error)" },
};

const complexityLabel = {
  small: "Small Project",
  medium: "Mid-size Project",
  large: "Large Project",
  enterprise: "Enterprise Scale",
};

export default function SmartContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    description: "",
  });
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "classifying" | "done" | "error">("idle");
  const [classification, setClassification] = useState<Classification | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.description || !consent) return;

    setState("classifying");
    setErrorMsg("");

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setClassification(data.classification);
      setState("done");
      track("contact_form_submitted", {
        service: data.classification.service,
        urgency: data.classification.urgency,
        complexity: data.classification.complexity,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  const colors = classification ? urgencyColors[classification.urgency] : urgencyColors.low;

  if (state === "done" && classification) {
    return (
      <div
        role="status"
        className="p-8 rounded-2xl text-left"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        {/* Success header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            ✓
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--text)" }}>Inquiry Received & Classified</p>
            <p className="text-sm text-[var(--text-muted)]">I'll be in touch {classification.responseTime}</p>
          </div>
        </div>

        {/* Classification result */}
        <div
          className="p-5 rounded-xl mb-5"
          style={{ background: "var(--bg-dark)", border: `1px solid ${colors.border}` }}
        >
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">AI Classification</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Service */}
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Service Match</p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{classification.service}</p>
            </div>

            {/* Urgency */}
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Urgency</p>
              <span
                className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                {classification.urgency}
              </span>
            </div>

            {/* Complexity */}
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Project Size</p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {complexityLabel[classification.complexity as keyof typeof complexityLabel] || classification.complexity}
              </p>
            </div>

            {/* Fit Score */}
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Fit Score</p>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: i < classification.fitScore ? "var(--accent)" : "var(--border)",
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-[var(--text-muted)]">{classification.fitScore}/10</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs text-[var(--text-muted)] mb-1">Summary</p>
            <p className="text-sm text-[var(--text-muted)]">{classification.summary}</p>
          </div>
        </div>

        {/* What happens next */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "#C8340608", border: "1px solid #C8340620" }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: "var(--accent)" }}>What happens next</p>
          <p className="text-sm text-[var(--text-muted)]">{classification.nextStep}</p>
        </div>

        {/* Submit another */}
        <button
          onClick={() => {
            setForm({ name: "", email: "", company: "", description: "" });
            setClassification(null);
            setConsent(false);
            setState("idle");
          }}
          className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          ← Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <div
      className="p-8 rounded-2xl text-left"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-5">
        This form is processed by an AI system (Claude) that classifies your
        inquiry to route it — you&apos;ll see the classification below
        immediately, and a human reviews it before following up. See{" "}
        <a href="/trust#ai-use" className="underline hover:text-[var(--text)] transition-colors">
          how we use AI on this site
        </a>
        .
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact-name" className="text-xs text-[var(--text-muted)] mb-1.5 block">Name *</label>
            <input
              id="contact-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-600 outline-none focus:ring-2 focus:ring-[var(--accent)]"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label htmlFor="contact-company" className="text-xs text-[var(--text-muted)] mb-1.5 block">Company</label>
            <input
              id="contact-company"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Acme Corp"
              className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-600 outline-none focus:ring-2 focus:ring-[var(--accent)]"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-email" className="text-xs text-[var(--text-muted)] mb-1.5 block">Email *</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@acme.com"
            required
            className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-600 outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>

        <div>
          <label htmlFor="contact-description" className="text-xs text-[var(--text-muted)] mb-1.5 block">
            Project Description *
            <span className="ml-2 text-[var(--text-muted)] normal-case font-normal">
              — the more detail, the better the classification
            </span>
          </label>
          <textarea
            id="contact-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Tell me what you're trying to build or automate. What systems are involved? What's the business problem?"
            rows={4}
            required
            className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-600 outline-none resize-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>

        {state === "error" && (
          <p role="alert" className="text-sm text-red-400">{errorMsg}</p>
        )}
        <p aria-live="polite" className="sr-only">
          {state === "classifying" ? "Classifying your inquiry…" : ""}
        </p>

        <label className="flex items-start gap-2.5 text-xs text-[var(--text-muted)] leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="mt-0.5 w-3.5 h-3.5 shrink-0 rounded"
            style={{ accentColor: "var(--accent)" }}
          />
          <span>
            I agree to the{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--text)] transition-colors">
              Privacy Policy
            </a>
            . I understand my submission is sent to Claude to classify this
            inquiry and emailed to Tioga AI, where it&apos;s kept in
            the founder&apos;s inbox to respond to and follow up on my
            inquiry — not used to train any model, not sold, not stored in
            any database.
          </span>
        </label>

        <button
          type="submit"
          disabled={state === "classifying" || !consent}
          className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
        >
          {state === "classifying" ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AI is classifying your inquiry...
            </>
          ) : (
            "Send Message"
          )}
        </button>

        <p className="text-xs text-center text-[var(--text-muted)]">
          Powered by <span style={{ color: "var(--accent)" }}>Claude</span> — your inquiry will be instantly classified and routed
        </p>
      </form>
    </div>
  );
}
