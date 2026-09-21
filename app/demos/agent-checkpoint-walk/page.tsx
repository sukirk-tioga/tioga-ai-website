import type { Metadata } from "next";
import Link from "next/link";
import TrackedCTA from "../../../components/TrackedCTA";
import AgentCheckpointWalkCanvasLoader from "./CanvasLoader";
import { EvidenceTierTag } from "../_lib/evidence-tier";
import { CAL_LINK } from "../../../lib/site-config";
import { DISPOSITIONS, TOTAL_AGENTS } from "../../../lib/agent-register";

// Pilot page for the $30-75K "Agentic AI Governance Framework" offer
// (working-list.md). Published 2026-09-18 on Sukir's instruction: indexable,
// included in the generated sitemap, and linked from
// /solutions/ai-governance. Not listed on /demos' own featured cards yet.
export const metadata: Metadata = {
  title: "The Checkpoint Walk",
  description:
    "Pick any one of Tioga's own 29 scheduled agents, trigger a real write edge, and watch what actually happens when it crosses (or doesn't cross) the approval gate.",
  alternates: { canonical: "/demos/agent-checkpoint-walk" },
  openGraph: {
    title: "The Checkpoint Walk — Tioga AI",
    description:
      "What happens when this agent's write crosses the gate? Tioga's own real authorization tiers, walked one edge at a time — not a composite scenario.",
  },
};

export default function AgentCheckpointWalkPage() {
  return (
    <main id="main-content" className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
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
          The Checkpoint Walk
        </h1>
        <p className="text-xl text-[var(--text-muted)] max-w-xl mb-8">
          Pick any one of Tioga&apos;s own {TOTAL_AGENTS} scheduled agents. Trigger one of its real write edges.
          Watch what actually happens at the gate — crosses automatically, pauses for a named approver, or never had
          a gate to cross in the first place.
        </p>
        <div className="flex flex-wrap gap-3">
          <TrackedCTA
            href="#scene"
            event="checkpoint_walk_hero_view_scene_click"
            className="px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--accent-dark)" }}
          >
            See the scene
          </TrackedCTA>
          <TrackedCTA
            href="/demos/agent-reach-map"
            event="checkpoint_walk_hero_reach_map_click"
            className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            See the whole estate
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
          detail="The real 29-job register in lib/agent-register.ts and its 7 real dated DISPOSITIONS — the same data already live at /demos/agent-reach-map and /demos/automation-oversight."
        />
        <div className="space-y-4 text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            Every agent in the list is one of Tioga&apos;s real scheduled jobs. Pick one, then pick one of its real
            write edges — most agents have one, a couple (like check-automations) have two, and some (like
            mission-control) have none at all. Trigger a walk and a pulse travels from the agent, toward the same
            checkpoint gate every edge in the register passes through:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong style={{ color: "var(--text)" }}>Agent-owned</strong> writes cross the gate with no stop — the
              write lands with nobody in the loop before it happens.
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>Human-supervised</strong> writes stop inside the gate. You see
              the real named approver and the real reason this edge needs one, then choose Approve (what approval
              looks like for this already-established review requirement) or Let it time out (the write never
              lands).
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>Human-owned</strong> writes don&apos;t animate at all —
              they&apos;re advisory-only (an emailed alert), so there&apos;s nothing to authorize.
            </li>
          </ul>
          <p>
            Separately, &quot;Replay real findings&quot; plays all {DISPOSITIONS.length} real, dated findings from
            Tioga&apos;s own automation-review cycle through the same gate, in the order they actually happened.
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted-3)" }}>
            Honesty note: this is a dated excerpt, not a live-refreshing feed, and every duration you see in an
            animation (how long a walk takes, how long the replay is spaced) is a declared UI pacing choice, not a
            claim about a real elapsed time. Same {TOTAL_AGENTS}-agent register as{" "}
            <Link href="/demos/agent-reach-map" className="underline underline-offset-2" style={{ color: "var(--accent)" }}>
              /demos/agent-reach-map
            </Link>{" "}
            and{" "}
            <Link href="/demos/automation-oversight" className="underline underline-offset-2" style={{ color: "var(--accent)" }}>
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
        <AgentCheckpointWalkCanvasLoader />
      </section>

      {/* How this was built */}
      <section className="px-6 max-w-3xl mx-auto py-16">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)" }}>
          How this was built
        </h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          React Three Fiber over the same typed{" "}
          <code className="font-mono text-xs">lib/agent-register.ts</code> module{" "}
          <Link href="/demos/agent-reach-map" className="underline underline-offset-2" style={{ color: "var(--accent)" }}>
            /demos/agent-reach-map
          </Link>{" "}
          imports, so the two scenes can never drift. Reuses the corridor Gate metaphor from{" "}
          <Link href="/showcase" className="underline underline-offset-2" style={{ color: "var(--accent)" }}>
            /showcase
          </Link>
          &apos;s Gateway Corridor — a breathing halo and a slowly rotating scan ring, both decorative chrome tied to
          no real value, the two independent motion sources that keep the scene visibly alive at rest. No composite
          or illustrative data: every write edge, approver name, and note is read directly from the register, and
          every replayed finding is one of the 7 real, dated entries in{" "}
          <code className="font-mono text-xs">DISPOSITIONS</code>. No 3D text — every label, including the agent
          list and write-edge detail panel, is DOM, so keyboard and screen-reader users get the same interaction a
          mouse click does. No drag anywhere: every interaction is a real tap target, including on mobile.
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
            A discovery call gets you a scoped assessment from the person who builds these governed write-paths —
            not a form, a conversation.
          </p>
          <TrackedCTA
            href={CAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            event="checkpoint_walk_cta_click"
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
