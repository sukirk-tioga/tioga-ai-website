// No-WebGL / prefers-reduced-motion / lost-context fallback for "The
// Boundary." Unlike /showcase (which has no other table on the page and so
// builds its own fallback table), this route already renders the real
// 9-row findings table above this section — so the honest fallback here is
// a short pointer to it, not a duplicate table (docs/design/
// 3d-design-standard.md §5.3: "no-WebGL path renders the real table with
// the same numbers" — already true on this page without adding a second one).
export default function BoundaryFallback() {
  return (
    <div
      className="rounded-2xl p-6 text-center"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      data-testid="boundary-fallback"
    >
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Your browser or system settings turned off the 3D scene (no WebGL, reduced motion, or a
        lost graphics context) — the same 9 findings are in the table above, unabridged.
      </p>
    </div>
  );
}
