# Visual system reference — reverse-engineered from what's actually shipped

Do Soon/Backlog item 5 from the practitioner backlog
(`~/SecondBrain/TiogaAI/projects/practitioner-backlog-2026-08-09.md`),
"Awesome Design reverse-engineered design.md" pattern: this doc describes
the visual conventions actually in use across `app/`/`components/` as of
2026-08-09, extracted by grepping real usage, not by re-deriving from
`tailwind.config.ts` in isolation — see the color-application gotcha below
for why that distinction matters.

**Colors are governed by `CLAUDE.md`, not repeated here** — that file
already establishes "always `var(--token)`, never a hex literal" and
deliberately doesn't list the tokens statically ("it will drift... grep
the live file"). Same logic applies below: this doc covers structural
conventions (type, spacing, radius, component shape) that don't have an
enforcement mechanism yet, not colors, which already do.

## Gotcha: `tailwind.config.ts`'s `brand.*` colors are effectively dead

`tailwind.config.ts` defines `colors.brand.{primary,primaryDark,dark,card,
border}` — but grepping actual usage across `app/`+`components/` turns up
**zero** uses of `bg-brand-*`/`text-brand-*`/`border-brand-*` classes.
Every real component applies brand colors via inline
`style={{ background: "var(--accent)" }}` (or `color`/`border`), reading
straight from `globals.css`'s `:root` block — matching `CLAUDE.md`'s rule.
The Tailwind config's `brand` colors are stale scaffolding from before that
rule was established (2026-07-31) and were never removed. **Don't use the
`bg-brand-*` Tailwind classes on new components** — they'll technically
compile but produce a component using a *different, unmaintained* copy of
the palette that silently drifts from the real one in `globals.css`. Use
`style={{ ... : "var(--token)" }}` like everything else does.

## Typography

- **Body font:** Inter (`next/font/google`, CSS var `--font-inter`), applied
  site-wide via `body` in `globals.css`.
- **Mono font:** JetBrains Mono / Fira Code (`font-mono` Tailwind utility,
  configured in `tailwind.config.ts`) — used for code-like content: stat
  labels, small pill badges (see Card patterns below), the flagship demo's
  ledger/data displays. Not the default; opt in with `font-mono`.
- **Scale in practice** (not an exhaustive Tailwind reference, just what's
  actually used where):
  - Hero H1: `text-4xl lg:text-6xl font-bold tracking-tight text-balance`
  - Section/subhead paragraph: `text-xl` (lede) down to `text-sm`/`text-xs`
    (supporting copy, disclaimers)
  - Card/section titles: `text-lg font-bold`
  - Small caps labels (e.g. "Model", "Sample size" above a stat):
    `text-xs uppercase tracking-wide`, usually colored `var(--accent)`
  - Stat numbers: `text-2xl font-bold`, colored `var(--accent)`

## Border radius — pick by role, not by feel

Grepped frequency across the whole codebase (89/87/67/33/3 occurrences):
- **`rounded-full`** — pills, badges, small circular elements. Most common
  single radius in the codebase.
- **`rounded-xl`** — buttons/CTAs (`px-8 py-3.5 rounded-xl font-semibold`
  is the standard primary/secondary CTA shape, see Buttons below).
- **`rounded-2xl`** — cards and card-like containers (`p-6 rounded-2xl`
  is the standard card shape).
- **`rounded-lg`** — used, but far less common than xl/2xl; not the
  default choice for a new card or button.
- **`rounded-md`** — essentially unused (3 occurrences site-wide). Don't
  reach for this on new components.

## Component patterns (copy these shapes, not just the tokens)

**Primary CTA button:**
```tsx
<TrackedCTA
  href={...} event="..." data={{...}}
  className="px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
  style={{ background: "var(--accent-dark)" }}
>
  ...
</TrackedCTA>
```

**Secondary/outline CTA button** (same shape, border instead of fill):
```tsx
className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-white"
style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
```

**Card container:**
```tsx
className="p-6 rounded-2xl"
style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
```

**Small mono pill/badge** (e.g. a status or count label inside a card
header):
```tsx
className="text-xs font-mono px-2 py-0.5 rounded-full"
style={{ color: "var(--text-muted)", background: "var(--bg-dark)", border: "1px solid var(--border)" }}
```

**Stat strip** (grid of numbers with hairline dividers, homepage pattern):
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ background: "var(--border)" }}>
  {/* each cell: */}
  <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
    <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>{value}</div>
    <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
  </div>
</div>
```
The `gap-px` + colored-background-behind-cells trick is how hairline
dividers are done between grid cells — not individual `border` classes.

## Grays: Tailwind's built-in `slate-*` scale, not a custom token

Body/muted text sometimes uses the CSS-var text tokens (`var(--text)`,
`var(--text-muted)`, etc. — see `CLAUDE.md`) and sometimes plain Tailwind
`text-slate-200`/`text-slate-300`/`text-slate-400`. Both exist in real
usage; there's no hard rule dividing when to use which observed in the
current codebase — treat the CSS-var tokens as the source of truth for
anything brand-specific (accent, backgrounds, borders, semantic
error/warning/success) and `slate-*` as acceptable for generic body-text
gray levels, matching what's already there.

## Verifying this doc hasn't drifted

Same caveat `CLAUDE.md` gives for colors applies structurally here too —
this was written 2026-08-09 from a real grep pass, not from memory or the
config file's stated intent. If a future session is about to build a new
component, a quick sanity check (`grep -rohE "rounded-[a-z0-9]+"
app components | sort | uniq -c | sort -rn`) against this doc's radius
claims takes seconds and confirms nothing's shifted since.
