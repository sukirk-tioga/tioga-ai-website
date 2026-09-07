import type { Metadata } from "next";
import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";
import { CAL_LINK } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "The AI Fit Check",
  description:
    "One day. $1,500 flat. Fully remote, no system or sandbox access required. A go/no-go on proceeding to a Discovery Sprint, before either side commits a full week.",
  alternates: { canonical: "/ai-fit-check" },
  openGraph: {
    title: "The AI Fit Check — Tioga AI",
    description:
      "One day. $1,500 flat. The cheap way to find out whether you're ready for a Discovery Sprint before committing a full week.",
  },
};

const DELIVERABLES = [
  {
    title: "A go / no-go on proceeding to a Discovery Sprint",
    desc: "With the specific reason, not a generic “yes, let's talk more.”",
  },
  {
    title: "A first-pass candidate use case",
    desc: "Named and scoped from what came up in the interviews and whatever documentation (process docs, system inventories, prior audit findings) the prospect can hand over without needing new system access — not yet validated the way the Sprint would validate it, but concrete enough to name.",
  },
  {
    title: "A readiness read on the three things that actually block a Discovery Sprint from running well",
    desc: "Is there a real executive sponsor who can approve sandbox access in the Sprint's own five-day window; does at least one system in scope have a real sandbox/test instance to provision (not just production); and is there a realistic decision-maker available for the daily check-ins the Sprint needs.",
  },
  {
    title: "If the answer is go: a scoped recommendation for what the Discovery Sprint should actually target",
    desc: "So the Sprint's own five days start pointed at the right system and use case instead of spending day one re-deriving what the Fit Check already found.",
  },
  {
    title: "If the answer is no-go: an honest, written reason",
    desc: "The same “a Sprint that ends in 'you don't need what you think you need' is a success, not a failed sale” principle the Discovery Sprint itself runs on, just one rung earlier and at a tenth of the cost.",
  },
];

export default function AiFitCheckPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <Link href="/discovery-sprint" className="text-xs mb-6 inline-block hover:text-[var(--text)] transition-colors" style={{ color: "var(--accent)" }}>
          ← The Discovery Sprint
        </Link>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          First rung, not a replacement
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight text-balance" style={{ color: "var(--text)" }}>
          The AI Fit Check
        </h1>
        <p className="text-xl text-[var(--text-muted)] leading-relaxed mb-8">
          One day. $1,500 flat. Fully remote — no system or sandbox access
          required.
        </p>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-12">
          The new first rung of the ladder, sitting in front of the{" "}
          <Link href="/discovery-sprint" style={{ color: "var(--accent)" }} className="hover:text-[var(--text)] transition-colors">
            Discovery Sprint
          </Link>
          , not replacing it. Where the Discovery Sprint needs read-only
          sandbox access provisioned before day one (most mid-market IT
          groups can&apos;t clear that in under a week) and consumes a full
          week of Tioga&apos;s only delivery capacity, the Fit Check needs
          neither — it&apos;s interviews and document review only, and it
          exists specifically to answer one question cheaply before either
          side commits a week: <strong style={{ color: "var(--text)" }}>is there a real, scoped candidate use case here, and is this organization actually ready for a Discovery Sprint right now?</strong>
        </p>

        <div className="space-y-10">
          {/* What you get */}
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>What you get, in one day</h2>
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

          {/* How the one day runs */}
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>How the one day runs</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              A single remote session (or a small number of shorter calls
              across one day, whichever fits the prospect&apos;s calendar)
              with the sponsor and one or two people who actually do the
              work in the candidate area. No system access, no sandbox
              provisioning, no data export — if a prospect can&apos;t
              produce a sponsor and a working-level contact for even one
              day without IT involvement, that itself is a real finding
              about whether they&apos;re ready for a five-day Sprint that
              needs far more from them.
            </p>
          </div>

          {/* What happens at the end */}
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>What happens at the end</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              A short written readout (1-2 pages, not the Sprint&apos;s full
              report) within 2 business days:
            </p>
            <ul className="list-disc pl-4 space-y-3 text-sm text-[var(--text-muted)] leading-relaxed">
              <li>
                <strong style={{ color: "var(--text)" }}>Go — proceed to a Discovery Sprint.</strong>{" "}
                The $1,500 credits in full against the Sprint&apos;s $5,000
                fee, so the full ladder costs exactly what the Sprint alone
                costs today if the prospect proceeds — the point is
                qualification economics, not an extra fee. Credit valid for
                60 days from the Fit Check readout.
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>No-go, or not yet.</strong> The
                prospect keeps the readout and the named use case either
                way. No obligation to proceed, and Tioga doesn&apos;t ask
                for one — same principle as the Sprint&apos;s own no-go
                outcome.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <TrackedCTA
              href={CAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              event="cta_book_call"
              data={{ location: "ai_fit_check_page" }}
              className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
            >
              Book the AI Fit Check
            </TrackedCTA>
            <Link
              href="/discovery-sprint"
              className="inline-block px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-[var(--text)]"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              See the Discovery Sprint
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
