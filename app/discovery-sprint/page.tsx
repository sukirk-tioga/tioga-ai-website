import type { Metadata } from "next";
import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";
import { CAL_LINK } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "The Discovery Sprint",
  description:
    "Five business days. $5,000 flat. One prioritized use case, a current-state system and control map, a fixed-fee pilot plan, and a working prototype — or an honest no-go finding.",
  alternates: { canonical: "/discovery-sprint" },
  openGraph: {
    title: "The Discovery Sprint — Tioga AI",
    description:
      "Five business days. $5,000 flat. Includes a working prototype — proof, not a pitch.",
  },
};

const DELIVERABLES = [
  {
    title: "One prioritized use case",
    desc: "Not a portfolio of them, and a stated reason it beat the alternatives.",
  },
  {
    title: "A current-state system and control map",
    desc: "What systems are involved, what already has evidence behind it, what doesn't.",
  },
  {
    title: "The key risks and integration constraints",
    desc: "Written up as a register, not a paragraph.",
  },
  {
    title: "A proposed architecture with control points",
    desc: "Including who approves what, and how agents (if any) are allowed to delegate work.",
  },
  {
    title: "Measurable pilot success criteria",
    desc: "Agreement rate, cycle time, exception rate, evidence completeness. Never adjectives.",
  },
  {
    title: "A fixed-fee pilot plan",
    desc: "Named deliverables, named exclusions, acceptance criteria, and a price.",
  },
  {
    title: "An honest no-go finding, if that's the accurate read",
    desc: "A Sprint that ends in “you don't need what you think you need” is a success, not a failed sale.",
  },
];

export default function DiscoverySprintPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Entry Point
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight text-balance" style={{ color: "var(--text)" }}>
          The Discovery Sprint
        </h1>
        <p className="text-xl text-[var(--text-muted)] leading-relaxed mb-8">
          Five business days. $5,000 flat. Includes a working prototype.
        </p>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8">
          For a prospect who already has a candidate use case and can
          provision read-only sandbox access within a week, this is where
          Tioga&apos;s scoping work starts. It&apos;s not a sales pitch and
          not a free consultation: the output is a written recommendation
          for which engagement actually fits, and a working prototype that
          proves the recommendation rather than just asserting it.
        </p>

        <div
          className="p-6 rounded-2xl mb-12"
          style={{ background: "linear-gradient(135deg, #C8340610, #A5000010)", border: "1px solid #C8340625" }}
        >
          <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>
            Not sure yet whether you have a real, provisionable use case, or
            whether your organization can clear sandbox access that fast?
          </p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
            Start with the{" "}
            <Link href="/ai-fit-check" style={{ color: "var(--accent)" }} className="hover:text-[var(--text)] transition-colors font-semibold">
              AI Fit Check
            </Link>{" "}
            instead — one day, $1,500, fully remote, no system access needed.
            It exists specifically to answer that question before either
            side commits this Sprint&apos;s full week. The $1,500 credits in
            full toward this Sprint&apos;s fee if the Fit Check&apos;s
            answer is go.
          </p>
          <Link
            href="/ai-fit-check"
            className="inline-block px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: "var(--accent-dark)" }}
          >
            See the AI Fit Check →
          </Link>
        </div>

        <div className="space-y-10">
          {/* What you get */}
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>What you get, in five days</h2>
            <div className="space-y-3">
              {DELIVERABLES.map((d, i) => (
                <div
                  key={d.title}
                  className="flex gap-4 p-5 rounded-2xl"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="text-lg font-bold font-mono shrink-0 w-6 text-center" style={{ color: "var(--accent)" }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>{d.title}</p>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How the five days run */}
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>How the five days run</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Access is provisioned read-only, scoped, and time-boxed before
              day one. Interviews run with the people who do the work, the
              people who own the systems, the people who&apos;d have to
              sign off on a control, and the sponsor. From those, a
              current-state map gets built and three to five candidate use
              cases get scored on value, feasibility, blast radius, and how
              controllable the action actually is — a high-value action
              nobody can control isn&apos;t a candidate for a first pilot.
              One use case gets selected with the sponsor, the control
              points get designed against your real approval process, and
              prototype build starts. By day five: the prototype is
              demonstrated live and recorded, the full report is walked
              through, and the fixed-fee plan for what comes next is on the
              table.
            </p>
            <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="text-xs font-mono uppercase tracking-wide mb-1.5" style={{ color: "var(--accent)" }}>
                Prototype rules, always
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Never run against production — sandbox, test instance, or
                exported sample data only. Never given write access to a
                real system. It demonstrates the control point, not
                end-to-end throughput.
              </p>
            </div>
          </div>

          {/* What happens at the end */}
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>What happens at the end</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              A written decision from you, within a stated window:
            </p>
            <ul className="list-disc pl-4 space-y-3 text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              <li>
                <strong style={{ color: "var(--text)" }}>Go</strong> —
                proceed on the offer the report recommends. The $5,000 (net
                of any AI Fit Check credit already applied, if you started
                there) credits in full against the full engagement price.
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>Redirect</strong> —
                proceed, but on a different offer than either of us first
                guessed. Same credit rule.
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>No-go</strong> —
                either Tioga&apos;s own finding or your call. You keep every
                artifact from the five days either way. There&apos;s no
                obligation to continue, and Tioga doesn&apos;t ask for one.
              </li>
            </ul>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              The credit is valid for 60 days from the readout.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <TrackedCTA
              href={CAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              event="cta_book_call"
              data={{ location: "discovery_sprint_page" }}
              className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
            >
              Book the Discovery Sprint
            </TrackedCTA>
            <Link
              href="/engineering/how-we-deliver"
              className="inline-block px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-[var(--text)]"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              See how Tioga delivers
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
