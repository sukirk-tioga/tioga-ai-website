"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LEDGER, type LedgerRow } from "../../lib/governance-ledger";

// Phase 8 (boundary-push plan, Web Audio sonification): each of the 17
// replay pulses crossing the gate produces a short synthesized tick,
// pitched by that row's real token count -- 17 real rows becoming 17 real
// notes, not a decorative soundtrack. No new dependency (Web Audio API is
// native); no dependency upgrade needed. Requires a user gesture to start
// an AudioContext -- the existing Replay button click is already that
// gesture, so this only ever creates/resumes the context from inside
// playTick(), never on mount.
//
// The plan's own explicit hold recommendation ("I'd hold this until Phases
// 1-6 have shipped and been seen by real prospects") is the specific
// caveat Sukir overrode for this session's work, alongside the general
// Phase-5 prospect gate -- built defensively regardless: default OFF,
// explicit opt-in toggle, state persisted (localStorage), never autoplays.

const STORAGE_KEY = "tioga-showcase-audio-enabled";

const tokenSums = LEDGER.map((r) => r.in + r.out);
const MIN_TOKENS = Math.min(...tokenSums);
const MAX_TOKENS = Math.max(...tokenSums);
const MIN_FREQ = 220; // A3
const MAX_FREQ = 880; // A5

function tokensToFrequency(tokens: number): number {
  const spread = Math.max(MAX_TOKENS - MIN_TOKENS, 1);
  const norm = Math.max(Math.min((tokens - MIN_TOKENS) / spread, 1), 0);
  // Logarithmic (musical) interpolation, not linear -- equal ratios sound
  // like equal pitch steps.
  return MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, norm);
}

export function useReplayChimeEnabled(): [boolean, (next: boolean) => void] {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setEnabled(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage unavailable (private mode, disabled) -- stay off.
    }
  }, []);

  const set = useCallback((next: boolean) => {
    setEnabled(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // Non-fatal -- the toggle still works for this session.
    }
  }, []);

  return [enabled, set];
}

export function useReplayChime(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  const playTick = useCallback(
    (row: LedgerRow) => {
      if (!enabled) return;
      if (typeof window === "undefined") return;
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextCtor) return;

      if (!ctxRef.current) {
        ctxRef.current = new AudioContextCtor();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const freq = tokensToFrequency(row.in + row.out);
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.18, now + 0.008);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      master.connect(ctx.destination);

      // Short feedback delay -- gives the tick a plucked-string character
      // instead of a bare sine beep, same shape as the source technique
      // (short delay, moderate feedback gain), simplified to one tap.
      const delay = ctx.createDelay(0.5);
      delay.delayTime.value = 0.14;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.32;
      delay.connect(feedback);
      feedback.connect(delay);
      master.connect(delay);
      delay.connect(ctx.destination);

      // Three slightly detuned sine oscillators, matching the source
      // technique's own description -- a single sine reads as a beep, a
      // few cents of detune reads as a struck/plucked tone.
      const detunes = [-6, 0, 6];
      detunes.forEach((cents) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.detune.value = cents;
        osc.connect(master);
        osc.start(now);
        osc.stop(now + 0.34);
      });
    },
    [enabled]
  );

  return playTick;
}
