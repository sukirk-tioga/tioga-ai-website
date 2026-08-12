import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TrackedCTA from "../../components/TrackedCTA";
import ShowcaseCanvasLoader from "./ShowcaseCanvasLoader";
import ShowcaseLegend from "./ShowcaseLegend";
import {
  TOTAL_CALLS,
  TOTAL_SPEND,
  BUDGET_CAP,
  BACKEND_ROUTES,
  PAID_COUNT,
  FREE_ZERO_COST_PCT,
} from "../../lib/governance-ledger";

// Phase 1 MVP — see
// ~/SecondBrain/TiogaAI/projects/3d-website-showcase-plan-2026-08-11.md.
// noindex until Phase 2 sign-off (plan §1, §5): this page is linked from
// /demos/governance-ledger and /engineering starting in this phase, so
// crawlers could otherwise find an unapproved page before Sukir has seen
// it. title is a short string, not the full "— Tioga AI" suffix: /showcase
// is a direct child of the root layout (no intermediate
// app/showcase/layout.tsx), so root layout.tsx's title.template applies
// here, same convention as other root-level pages (/about, /services).
export const metadata: Metadata = {
  title: "The Oversight Plane",
  description:
    "An interactive 3D control-plane scene rendering the same real governance-ledger excerpt as the /demos/governance-ledger table — the budget aperture, free-pool bypass, and requested→served execution nodes.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/showcase" },
  openGraph: {
    title: "The Oversight Plane — Tioga AI",
    description:
      "The same real governance-ledger excerpt, rendered spatially: budget aperture, free-pool bypass, requested→served execution nodes. Not a live feed — a dated, verifiable excerpt.",
  },
};

const PROVENANCE = [
  { label: "Spend vs. cap", value: `$${TOTAL_SPEND.toFixed(6)}`, sub: `of $${BUDGET_CAP.toFixed(2)}` },
  { label: "Calls in this scene", value: String(TOTAL_CALLS), sub: "every row, not a sample" },
  { label: "Backends", value: String(BACKEND_ROUTES.length), sub: "local free-tier → Google → OpenRouter" },
  { label: "Paid / total", value: `${PAID_COUNT} / ${TOTAL_CALLS}`, sub: `${FREE_ZERO_COST_PCT}% settle at exactly $0` },
];

export default function ShowcasePage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
            >
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
              Interactive 3D — Real Governance Data
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance text-white mb-4">
              The Oversight Plane
            </h1>
            <p className="text-xl text-slate-400 max-w-xl mb-8">
              The same {TOTAL_CALLS}-row governance ledger, rendered as a control plane instead
              of a table — a budget aperture, a free-pool bypass, and real backends lighting up
              as calls land.
            </p>
            <div className="flex flex-wrap gap-3">
              <TrackedCTA
                href="#scene"
                event="showcase_hero_view_scene_click"
                className="px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--accent-dark)" }}
              >
                See the scene
              </TrackedCTA>
              <TrackedCTA
                href="/demos/governance-ledger"
                event="showcase_hero_table_click"
                className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                View as a table
              </TrackedCTA>
            </div>
          </div>

          {/* Hero image: a captured still of the real scene below, not an
              AI-generated poster (plan §2, corrected in Fable's review —
              the Phase 1 hero must be real, since the real scene exists by
              the end of this phase). The full motion-loop WebM/MP4 capture
              is Phase 2 scope; this still is Phase 1's honest substitute.
              priority + explicit dimensions so this, not the canvas, is the
              page's LCP element. */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <Image
              src="/showcase/hero-poster.png"
              alt="A captured still of the Oversight Plane 3D scene — the request, policy, and execution planes rendering Tioga AI's real governance ledger"
              width={974}
              height={558}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* What you're looking at */}
      <section className="px-6 max-w-3xl mx-auto pb-16">
        <h2 className="text-lg font-bold text-white mb-4">What you&apos;re looking at</h2>
        <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <p>
            Three stacked planes — request, policy, execution — carrying the same {TOTAL_CALLS}{" "}
            real rows already live at{" "}
            <Link href="/demos/governance-ledger" style={{ color: "var(--accent)" }}>
              /demos/governance-ledger
            </Link>
            . Every particle in the scene is one real call from Tioga&apos;s own AI routing
            gateway, captured Jul 17–25, 2026 — nothing here was written for this page.
          </p>
          <p>
            The policy plane is the governance layer made physical: a budget aperture reserves
            against the real ${BUDGET_CAP.toFixed(2)} / 30-day cap, and free-pool calls bypass it
            in a side lane while paid calls pass through its center. There is deliberately no
            approval-gate mechanic — the ledger has no write/read-path field and no approval
            events in these {TOTAL_CALLS} rows, so animating a gate none of them ever passed
            through would contradict the whole point of this page: flip to the table and verify
            every particle.
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted-3)" }}>
            Honesty note: this is a dated excerpt, refreshed periodically — not a live-refreshing
            feed. Same caveat as the table view it&apos;s built from.
          </p>
        </div>
      </section>

      {/* The interactive scene */}
      <section id="scene" className="px-6 max-w-5xl mx-auto pb-6 scroll-mt-24">
        <h2 className="text-lg font-bold text-white mb-4">The scene</h2>
        <ShowcaseCanvasLoader />
        <ShowcaseLegend />
      </section>

      {/* Provenance strip */}
      <section className="px-6 max-w-5xl mx-auto py-16">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{ background: "var(--border)" }}
        >
          {PROVENANCE.map((s) => (
            <div key={s.label} className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
              <div className="text-2xl font-bold mb-1 font-mono" style={{ color: "var(--accent)" }}>
                {s.value}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">{s.label}</div>
              <div className="text-[11px] text-slate-500 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Same data, table view */}
      <section className="px-6 max-w-3xl mx-auto pb-16">
        <div
          className="p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Same data, table view</h2>
            <p className="text-sm text-slate-400">
              Every row in the scene above, as the same HTML table it&apos;s built from.
            </p>
          </div>
          <Link
            href="/demos/governance-ledger"
            className="shrink-0 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:border-slate-500 text-center"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            Open the table →
          </Link>
        </div>
      </section>

      {/* How this was built */}
      <section className="px-6 max-w-3xl mx-auto pb-16">
        <h2 className="text-lg font-bold text-white mb-4">How this was built</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          React Three Fiber (pinned to the v8 line — v9 requires React 19, which this site
          doesn&apos;t run yet) over the same typed <code className="font-mono text-xs">lib/governance-ledger.ts</code>{" "}
          module the table page imports, so the two views can never drift. The scene, budget
          aperture, and execution nodes are real WebGL, generated from that data. The hero image
          above is a captured still of this actual scene — not an AI-generated mockup; a full
          motion loop is planned for a later phase. No 3D text: every label on this page is DOM,
          not canvas.
        </p>
      </section>

      {/* CTA */}
      <section className="px-6 max-w-3xl mx-auto pb-24">
        <div
          className="p-8 rounded-2xl text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-xl font-semibold text-white mb-2">
            Want this pattern built into your systems?
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            A discovery call gets you a scoped assessment from the team that builds these
            governed write-paths — not a form, a conversation.
          </p>
          <TrackedCTA
            href="/#contact"
            event="showcase_cta_click"
            className="inline-flex px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Book a discovery call
          </TrackedCTA>
        </div>
      </section>
    </main>
  );
}
