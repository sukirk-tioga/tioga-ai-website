"use client";

import { useEffect, useState } from "react";

const LIVE_URL = "http://localhost:4003";
const RECORDING_URL = "/present/governed-agent/recording";

type Mode = "live" | "recording";
type LiveStatus = "checking" | "up" | "down";

// Picks Live when the laptop's ledger UI answers, Recording otherwise. The
// presenter can always switch by hand.
export default function PresenterSwitch() {
  const [status, setStatus] = useState<LiveStatus>("checking");
  const [mode, setMode] = useState<Mode>("recording");
  const [touched, setTouched] = useState(false);

  async function probe() {
    setStatus("checking");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    try {
      // no-cors: we only need to know something answered on the port.
      await fetch(LIVE_URL, { mode: "no-cors", signal: ctrl.signal, cache: "no-store" });
      setStatus("up");
      return true;
    } catch {
      setStatus("down");
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  useEffect(() => {
    probe().then((up) => {
      if (!touched) setMode(up ? "live" : "recording");
    });
    // Run once on load; the Re-check button handles later changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(m: Mode) {
    setTouched(true);
    setMode(m);
  }

  const statusText =
    status === "checking"
      ? "Checking for the live demo on this laptop…"
      : status === "up"
        ? "Live demo detected on this laptop."
        : "Live demo not reachable. Use the recording, or start it at home (see runbook).";

  const tab = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => choose(m)}
      aria-pressed={mode === m}
      className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
      style={
        mode === m
          ? { background: "var(--accent)", color: "var(--bg-card)" }
          : { background: "transparent", color: "var(--text)", border: "1px solid var(--border)" }
      }
    >
      {label}
    </button>
  );

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {tab("live", "Live")}
        {tab("recording", "Recording")}
        <span className="text-sm text-[var(--text-muted)]" role="status">
          {statusText}
        </span>
        <button
          type="button"
          onClick={() => probe()}
          className="text-sm underline text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          Re-check
        </button>
      </div>

      {mode === "live" ? (
        <div>
          {status !== "up" && (
            <p className="text-sm mb-3" style={{ color: "var(--warning)" }}>
              The live demo isn&apos;t answering on {LIVE_URL}. At home, start it with the snowflake profile, then press
              Re-check.
            </p>
          )}
          <iframe
            src={LIVE_URL}
            title="Live governed-agent audit ledger"
            className="w-full rounded-lg"
            style={{ height: "80vh", border: "1px solid var(--border)", background: "var(--bg-darker)" }}
          />
          <a
            href={LIVE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-2 text-sm underline text-[var(--text-muted)]"
          >
            Open live ledger in its own tab
          </a>
        </div>
      ) : (
        <div>
          <video
            src={RECORDING_URL}
            controls
            playsInline
            preload="metadata"
            className="w-full rounded-lg"
            style={{ border: "1px solid var(--border)" }}
          />
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Real run against Snowflake, recorded 2026-09-23: auto-approved, escalated to a human, blocked by spend cap,
            blocked by scope, and two rejected by the ERP itself.
          </p>
        </div>
      )}
    </section>
  );
}
