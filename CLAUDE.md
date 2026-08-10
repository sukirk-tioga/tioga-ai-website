# tioga-ai-website

## Design system — always use it, never hardcode

Every color in this site must reference a CSS custom property from
`app/globals.css`'s `:root` block (`var(--accent)`, `var(--bg-card)`,
`var(--error)`, etc.) — never a raw hex literal (`#00D4FF`, `#EF4444`, ...).

To see the current token set, don't trust a list here — it will drift.
Run `grep -A 30 "^:root" app/globals.css` (or open the file directly) to
get the live set.

If a new color is genuinely needed, add it as a new named token in
`globals.css`'s `:root` block first, then reference it via `var()` — don't
inline a new hex value into a component.

**Exception**: 8-digit hex with an alpha suffix (e.g. `#00D4FF15` for a
15%-opacity tint) is fine as a raw literal — `var()` can't be
alpha-suffixed inline, and this is the established pattern already used
throughout the codebase for translucent backgrounds/borders.

**Also exception**: `app/opengraph-image.tsx` cannot use CSS custom
properties at all (Next.js's OG-image renderer/Satori doesn't support
`var()`) — literal hex values are required there, not a violation of this
rule.

**Why:** the entire site was hardcoding ~480 hex literals directly until
2026-07-31, making every rebrand or color-scheme tweak a find-and-replace
across dozens of files instead of a one-line token edit. Don't reintroduce
that.

For everything this section doesn't cover (typography scale, border-radius
conventions, card/button/badge component shapes, and a real gotcha about
`tailwind.config.ts`'s unused `brand.*` colors), see `design.md` —
reverse-engineered from actual component usage, same "verify against live
code, don't trust a stale list" discipline as this section.
