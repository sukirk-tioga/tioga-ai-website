import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";

// Homepage entry-point chooser: three starting routes framed by the buyer's
// situation, not by our catalog. The full catalog (sixteen priced
// engagements across three practices, see app/services/page.tsx) is correct
// and stays reachable at /services — it isn't being cut. Two independent
// adversarial design reviews (2026-09-08) found sixteen offers is too much
// for a first-time visitor to compare on landing, and the 2026-09-19 review
// found the homepage answered "where do I start?" twice — two routes here,
// three offers further down. This is now the only "where to start" on the
// page: one block, three routes (decision recorded 2026-09-19).
const CHOICES = [
  {
    eyebrow: "Is this workflow worth automating?",
    name: "The AI Fit Check",
    price: "$1,500",
    duration: "One day · fully remote",
    desc: "Start with a 20-minute intro conversation — not a paid reservation. When a decision needs qualifying, the Fit Check returns a written proceed / revise / stop call, the constraints, and a proposed next scope.",
    href: "/ai-fit-check",
    ctaLabel: "Start with the AI Fit Check",
    event: "cta_ai_fit_check",
  },
  {
    eyebrow: "We have a bounded workflow and access",
    name: "The Discovery Sprint",
    price: "$5,000",
    duration: "Five days · scoped to your systems",
    desc: "A working prototype on a read-only sandbox or scoped sample data shaped like your systems, plus a delivery plan — the $1,500 Fit Check credits in full if you started there.",
    href: "/discovery-sprint",
    ctaLabel: "Book the Discovery Sprint",
    event: "cta_book_discovery_sprint",
  },
  {
    eyebrow: "We already run agents and need proof",
    name: "Standing Watch Assessment",
    price: "$15–35K",
    duration: "3–4 weeks · scoped to your estate",
    desc: "Reconciles the agent inventory you already have, then adds independent behavioral verification, a spend baseline across platforms, and a findings ledger you keep — with owners and practical remediation priorities.",
    href: "/solutions/standing-watch",
    ctaLabel: "See the Standing Watch ladder",
    event: "cta_standing_watch_assessment",
  },
];

export default function OfferChooser() {
  return (
    <section className="px-6 pb-16 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Where to start</h2>
        <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto">
          Three starting routes, chosen by your situation, with prices published up front. The Fit Check credits in full toward the Sprint, and the Sprint toward whichever engagement follows.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {CHOICES.map((choice) => (
          <div
            key={choice.href}
            className="flex flex-col p-6 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <span
              className="inline-block self-start mb-3 text-xs font-mono px-2 py-0.5 rounded-full max-w-full text-left"
              style={{ color: "var(--accent)", background: "#C8340610", border: "1px solid #C8340625" }}
            >
              {choice.eyebrow}
            </span>
            <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text)" }}>{choice.name}</h3>
            <p className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>
              {choice.price} · {choice.duration}
            </p>
            <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: "var(--text-muted)" }}>
              {choice.desc}
            </p>
            <TrackedCTA
              href={choice.href}
              event={choice.event}
              data={{ location: "offer_chooser" }}
              className="px-6 py-3 rounded-xl text-white font-semibold text-sm text-center transition-all hover:opacity-90"
              style={{ background: "var(--accent-dark)" }}
            >
              {choice.ctaLabel} →
            </TrackedCTA>
          </div>
        ))}
      </div>
      <p className="text-center mt-6 text-sm" style={{ color: "var(--text-muted-2)" }}>
        Not sure which route fits? Take the free{" "}
        <Link href="/demos/agent-write-path-exposure-check" className="underline underline-offset-2 transition-colors hover:text-[var(--text)]" style={{ color: "var(--accent)" }}>
          write-path exposure check
        </Link>
        {" "}— five minutes, runs in your browser. Or{" "}
        <Link href="/services" className="underline underline-offset-2 transition-colors hover:text-[var(--text)]" style={{ color: "var(--accent)" }}>
          browse all sixteen engagements
        </Link>
        {" "}across automation, ERP, and governance.
      </p>
    </section>
  );
}
