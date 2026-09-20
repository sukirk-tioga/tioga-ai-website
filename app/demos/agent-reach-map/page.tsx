import type { Metadata } from "next";
import Link from "next/link";
import TrackedCTA from "../../../components/TrackedCTA";
import AgentReachMapCanvasLoader from "./CanvasLoader";
import { EvidenceTierTag } from "../_lib/evidence-tier";
import { CAL_LINK } from "../../../lib/site-config";
import { STATS, TOTAL_AGENTS, SYSTEMS, UNSUPERVISED_WRITE_COUNT } from "../../../lib/agent-register";

// Pilot page for the $30-75K "Agentic AI Governance Framework" offer
// (working-list.md). Published 2026-09-18 on Sukir's instruction: indexable,
// included in the generated sitemap, and linked from
// /solutions/ai-governance. Not listed on /demos' own featured cards yet.
export const metadata: Metadata = {
  title: "The Reach Map",
  description:
    "An interactive 3D scene rendering Tioga's own 29 scheduled automation jobs against the 12 real systems they're authorized to touch, colored by real authorization tier.",
  alternates: { canonical: "/demos/agent-reach-map" },
  openGraph: {
    title: "The Reach Map — Tioga AI",
    description:
      "What is this agent authorized to do? Tioga's own 29-job automation estate, rendered as a pickable estate — not a live feed, a dated, verifiable excerpt.",
  },
};

export default function AgentReachMapPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent-on-tint)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full" />
          Interactive 3D — Real Agent Authorization Data
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance mb-4" style={{ color: "var(--text)" }}>
          The Reach Map
        </h1>
        <p className="text-xl text-[var(--text-muted)] max-w-xl mb-8">
          What is this agent authorized to do? {TOTAL_AGENTS} of Tioga&apos;s own scheduled
          automations, rendered against the {SYSTEMS.length} real systems they can read or write —
          colored by real authorization tier, not a mockup.
        </p>
        <div className="flex flex-wrap gap-3">
          <TrackedCTA
            href="#scene"
            event="reach_map_hero_view_scene_click"
            className="px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--accent-dark)" }}
          >
            See the scene
          </TrackedCTA>
          <TrackedCTA
            href="/demos/automation-oversight"
            event="reach_map_hero_table_click"
            className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            View as a table
          </TrackedCTA>
        </div>
      </section>

      {/* What you're looking at */}
      <section className="px-6 max-w-3xl mx-auto pb-16">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)" }}>
          What you&apos;re looking at
        </h2>
        <EvidenceTierTag
          tier="internal-operational-excerpt"
          detail="The real 29-job register in lib/agent-register.ts, sourced from Tioga's own home-directory-subsystems.md registry — the same data already live at /demos/automation-oversight."
        />
        <div className="space-y-4 text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            Left column: every one of Tioga&apos;s {TOTAL_AGENTS} real scheduled jobs (
            <code className="font-mono text-xs">com.sukir.*</code>/
            <code className="font-mono text-xs">com.tioga.*</code>/
            <code className="font-mono text-xs">com.jarvis.*</code>), one node each. Right column:
            the {SYSTEMS.length} real systems of record those jobs can read or write — the
            brightest one is Tioga&apos;s own automation code, the single highest-blast-radius
            system in the estate. Every edge between them is a real write surface, colored by its
            real authorization tier: brightest for a write that lands with no approval gate before
            it happens, dimmer for one a named approver must act on first, a thin hairline for a
            write that&apos;s really just an emailed alert.
          </p>
          <p>
            Click or arrow-key through an agent to see exactly what it reads and writes, its named
            approver where one exists, and its real blast radius. Click a system to see how many
            agents can write there and how many of those writes are unsupervised. Flip
            &quot;unsupervised writes only&quot; to collapse the whole estate to the one question a
            table can&apos;t answer as fast: what in here can act with nobody watching?
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted-3)" }}>
            Honesty note: this is a dated excerpt, refreshed periodically — not a live-refreshing
            feed. Same {TOTAL_AGENTS}-job register as{" "}
            <Link href="/demos/automation-oversight" style={{ color: "var(--accent)" }}>
              /demos/automation-oversight
            </Link>
            .
          </p>
        </div>
      </section>

      {/* The interactive scene */}
      <section id="scene" className="px-6 max-w-5xl mx-auto pb-6 scroll-mt-24">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)" }}>
          The scene
        </h2>
        <AgentReachMapCanvasLoader />
      </section>

      {/* Provenance strip */}
      <section className="px-6 max-w-5xl mx-auto py-16">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{ background: "var(--border)" }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
              <div className="text-2xl font-bold mb-1 font-mono" style={{ color: "var(--accent)" }}>
                {s.value}
              </div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{s.label}</div>
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
            <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text)" }}>
              Same data, table view
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Every agent in the scene above, as the same real oversight page it&apos;s built from.
            </p>
          </div>
          <Link
            href="/demos/automation-oversight"
            className="shrink-0 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:border-slate-500 text-center"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            Open the table →
          </Link>
        </div>
      </section>

      {/* How this was built */}
      <section className="px-6 max-w-3xl mx-auto pb-16">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)" }}>
          How this was built
        </h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          React Three Fiber over the same typed{" "}
          <code className="font-mono text-xs">lib/agent-register.ts</code> module{" "}
          <Link href="/demos/automation-oversight" style={{ color: "var(--accent)" }}>
            /demos/automation-oversight
          </Link>{" "}
          imports, so the two views can never drift. {TOTAL_AGENTS} agent nodes render as one
          instanced mesh on the left; the {SYSTEMS.length} systems of record are individual meshes
          on the right, the brightest carrying a slowly rotating scan ring — decorative chrome, not
          tied to any real value, the one thing in this scene guaranteed to always be visibly
          moving. Every edge is real WebGL tube geometry, one per real write edge in the register —
          {" "}
          {UNSUPERVISED_WRITE_COUNT} of them render at full brightness when &quot;unsupervised
          writes only&quot; is on. No 3D text: every label on this page, including the per-agent
          detail panel, is DOM. The agent list beside the canvas is the primary control — arrow
          keys move selection, Enter inspects — so keyboard and screen-reader users get the same
          interaction a mouse click does, and mobile gets a real tap target that isn&apos;t the
          canvas.
        </p>
      </section>

      {/* CTA */}
      <section className="px-6 max-w-3xl mx-auto pb-24">
        <div
          className="p-8 rounded-2xl text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text)" }}>
            Want your own estate mapped like this?
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            A discovery call gets you a scoped assessment from the person who builds these
            governed write-paths — not a form, a conversation.
          </p>
          <TrackedCTA
            href={CAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            event="reach_map_cta_click"
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
