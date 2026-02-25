"use client";

import { useState } from "react";

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
  low: { bg: "#00D4FF10", border: "#00D4FF30", text: "#00D4FF" },
  medium: { bg: "#F59E0B10", border: "#F59E0B30", text: "#F59E0B" },
  high: { bg: "#EF444410", border: "#EF444430", text: "#EF4444" },
  critical: { bg: "#EF444420", border: "#EF4444", text: "#EF4444" },
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
  const [state, setState] = useState<"idle" | "classifying" | "done" | "error">("idle");
  const [classification, setClassification] = useState<Classification | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.description) return;

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
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  const colors = classification ? urgencyColors[classification.urgency] : urgencyColors.low;

  if (state === "done" && classification) {
    return (
      <div
        className="p-8 rounded-2xl text-left"
        style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}
      >
        {/* Success header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            ✓
          </div>
          <div>
            <p className="font-semibold text-white">Inquiry Received & Classified</p>
            <p className="text-sm text-slate-400">We'll be in touch {classification.responseTime}</p>
          </div>
        </div>

        {/* Classification result */}
        <div
          className="p-5 rounded-xl mb-5"
          style={{ background: "#0A0F1C", border: `1px solid ${colors.border}` }}
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">AI Classification</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Service */}
            <div>
              <p className="text-xs text-slate-500 mb-1">Service Match</p>
              <p className="text-sm font-medium text-white">{classification.service}</p>
            </div>

            {/* Urgency */}
            <div>
              <p className="text-xs text-slate-500 mb-1">Urgency</p>
              <span
                className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                {classification.urgency}
              </span>
            </div>

            {/* Complexity */}
            <div>
              <p className="text-xs text-slate-500 mb-1">Project Size</p>
              <p className="text-sm font-medium text-white">
                {complexityLabel[classification.complexity as keyof typeof complexityLabel] || classification.complexity}
              </p>
            </div>

            {/* Fit Score */}
            <div>
              <p className="text-xs text-slate-500 mb-1">Fit Score</p>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: i < classification.fitScore ? "#00D4FF" : "#1E2D4A",
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400">{classification.fitScore}/10</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-3" style={{ borderColor: "#1E2D4A" }}>
            <p className="text-xs text-slate-500 mb-1">Summary</p>
            <p className="text-sm text-slate-300">{classification.summary}</p>
          </div>
        </div>

        {/* What happens next */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "#00D4FF08", border: "1px solid #00D4FF20" }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: "#00D4FF" }}>What happens next</p>
          <p className="text-sm text-slate-300">{classification.nextStep}</p>
        </div>

        {/* Submit another */}
        <button
          onClick={() => {
            setForm({ name: "", email: "", company: "", description: "" });
            setClassification(null);
            setState("idle");
          }}
          className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <div
      className="p-8 rounded-2xl text-left"
      style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 outline-none focus:ring-1"
              style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Company</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Acme Corp"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 outline-none"
              style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">Email *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@acme.com"
            required
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 outline-none"
            style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">
            Project Description *
            <span className="ml-2 text-slate-600 normal-case font-normal">
              — the more detail, the better the classification
            </span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Tell us what you're trying to build or automate. What systems are involved? What's the business problem?"
            rows={4}
            required
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 outline-none resize-none"
            style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}
          />
        </div>

        {state === "error" && (
          <p className="text-sm text-red-400">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={state === "classifying"}
          className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
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

        <p className="text-xs text-center text-slate-600">
          Powered by <span style={{ color: "#00D4FF" }}>Claude</span> — your inquiry will be instantly classified and routed
        </p>
      </form>
    </div>
  );
}
