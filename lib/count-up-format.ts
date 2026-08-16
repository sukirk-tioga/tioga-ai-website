// Formats a real, already-published stat-strip value (see
// lib/governance-ledger.ts's STATS) as a function of scroll progress
// t in [0, 1], for the homepage's scrub-driven count-up (Phase 4). Parses
// the three shapes STATS actually contains today -- "$0.000753", "17",
// "2 / 17" -- generically, rather than hardcoding which stat is which, so
// this keeps working if STATS' rows ever change without a matching edit
// here. Never invents a number: t=1 always reproduces the exact source
// string.

export function makeCountUpFormatter(raw: string): (t: number) => string {
  const clamp = (t: number) => Math.max(0, Math.min(1, t));

  const fraction = raw.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    const numerator = parseInt(fraction[1], 10);
    const denominator = fraction[2];
    return (t) => `${Math.round(numerator * clamp(t))} / ${denominator}`;
  }

  const currency = raw.match(/^\$(\d+)\.(\d+)$/);
  if (currency) {
    const target = parseFloat(`${currency[1]}.${currency[2]}`);
    const decimalPlaces = currency[2].length;
    return (t) => `$${(target * clamp(t)).toFixed(decimalPlaces)}`;
  }

  const integer = raw.match(/^(\d+)$/);
  if (integer) {
    const target = parseInt(integer[1], 10);
    return (t) => `${Math.round(target * clamp(t))}`;
  }

  // Unrecognized shape -- don't guess, just show the real value always.
  return () => raw;
}
