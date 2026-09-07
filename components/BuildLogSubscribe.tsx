"use client";

import { useState } from "react";

// Low-friction email capture for the build log — closes the business-
// readiness audit's G-42 finding ("nothing accumulates: no capture, no
// list, no return path"). Deliberately the "low-friction subscribe" option
// the audit named as an alternative to gating a specific asset (e.g. the
// ERP checklist) behind an email wall — no gate, no download, just an
// opt-in for people already reading what's shipped. See
// app/api/subscribe/route.ts and lib/subscriber-log.ts for what happens
// server-side (no ESP is wired up; this notifies the founder directly).
export default function BuildLogSubscribe() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting" || state === "done") return;
    setState("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("done");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <div
        className="p-5 rounded-2xl text-sm"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
      >
        <p style={{ color: "var(--accent)" }} className="font-semibold mb-1">You&apos;re in.</p>
        <p className="text-[var(--text-muted)]">
          I&apos;ll email you when something real ships — no newsletter, no drip sequence.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>
          Get an email when the build log updates
        </p>
        <p className="text-xs text-[var(--text-muted)]">No spam, no schedule — just what actually ships.</p>
      </div>
      <div className="flex gap-2">
        <label htmlFor="build-log-email" className="sr-only">Email</label>
        <input
          id="build-log-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@acme.com"
          required
          disabled={state === "submitting"}
          className="px-3 py-2.5 rounded-lg text-sm placeholder-slate-600 outline-none focus:ring-2 focus:ring-[var(--accent)] w-48"
          style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
          style={{ background: "var(--accent-dark)" }}
        >
          {state === "submitting" ? "Subscribing…" : "Notify me"}
        </button>
      </div>
      {state === "error" && (
        <p role="alert" className="text-xs text-red-400 sm:basis-full">{errorMsg}</p>
      )}
    </form>
  );
}
