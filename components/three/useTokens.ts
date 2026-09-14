"use client";

import { useEffect, useState } from "react";
import { readCssToken } from "../../lib/site-config";

// Generalized from ShowcaseScene.tsx's own ad-hoc `Tokens` interface +
// `useEffect(() => setTokens({...}), [])` boilerplate (repeated per scene).
// Pass a map of local-name -> CSS custom property name; this reads every
// value once on mount (this site has no theme switching, so a one-time read
// is correct, not a shortcut) and returns a typed object, or null until the
// first render after mount. Zero hex literals in call sites — every color
// still comes from `readCssToken`.
export function useTokens<T extends Record<string, string>>(
  names: T
): { [K in keyof T]: string } | null {
  const [tokens, setTokens] = useState<{ [K in keyof T]: string } | null>(null);

  useEffect(() => {
    const resolved = {} as { [K in keyof T]: string };
    (Object.keys(names) as (keyof T)[]).forEach((key) => {
      resolved[key] = readCssToken(names[key]);
    });
    setTokens(resolved);
    // Intentionally mount-only, matching the pattern being replaced — this
    // site has no runtime theme switching, so re-reading on every prop
    // identity change of `names` would be wasted work, not correctness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return tokens;
}
