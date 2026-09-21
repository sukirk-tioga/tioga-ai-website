/**
 * Translucent tint of any CSS color, including `var(--token)` values.
 *
 * `${color}15` only works when `color` is a hex literal; with a `var(--x)`
 * token it produces `var(--x)15`, which is invalid CSS -- the browser drops the
 * whole declaration (no background, and for a `border` shorthand no border).
 * `color-mix` takes the token as-is. Percentages mirror the hex-alpha suffixes
 * the site already uses: 08 ~ 3%, 15 ~ 8%, 30 ~ 19%, 40 ~ 25%.
 */
export function tint(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/**
 * Text colour for a label sitting on `tint(color, ...)` over the darker card
 * surface: the token itself lands at ~4.1:1 there (WCAG AA needs 4.5:1), so
 * pull it 25% toward the body text colour (~5.4:1), same hue family.
 */
export function onTint(color: string): string {
  return `color-mix(in srgb, ${color} 75%, var(--text))`;
}
