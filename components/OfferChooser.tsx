import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";

// Homepage entry-point chooser. The full catalog (sixteen priced
// engagements across three practices, see app/services/page.tsx) is correct
// and stays reachable at /services — it isn't being cut. But two
// independent adversarial design reviews (2026-09-08) found sixteen offers
// is too much for a first-time visitor to compare on first landing. This
// component is the resolution: exactly two entry offers, prominently
// placed, each linking to its own page, with an explicit link to the full
// catalog alongside so it isn't hidden.
const CHOICES = [
  {
    eyebrow: "Not sure yet?",
    name: "The AI Fit Check",
    price: "$1,500",
    duration: "One day · fully remote",
    desc: "A go/no-go on whether you have a real, provisionable use case here — before either side commits a full week.",
    href: "/ai-fit-check",
    ctaLabel: "Start with the AI Fit Check",
    event: "cta_ai_fit_check",
  },
  {
    eyebrow: "Ready to move?",
    name: "The Discovery Sprint",
    price: "$5,000",
    duration: "Five days · scoped to your systems",
    desc: "A working prototype and a delivery plan against your real systems — the $1,500 Fit Check credits in full if you started there.",
    href: "/discovery-sprint",
    ctaLabel: "Book the Discovery Sprint",
    event: "cta_book_discovery_sprint",
  },
];

export default function OfferChooser() {
  return (
    <section className="px-6 pb-16 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Where to start</h2>
        <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto">
          Two entry points, whichever fits your situation. Both credit forward into whatever comes next.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {CHOICES.map((choice) => (
          <div
            key={choice.href}
            className="flex flex-col p-6 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <span
              className="inline-block self-start mb-3 text-xs font-mono px-2 py-0.5 rounded-full"
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
        Or{" "}
        <Link href="/services" className="underline underline-offset-2 transition-colors hover:text-[var(--text)]" style={{ color: "var(--accent)" }}>
          browse all sixteen workflows
        </Link>
        {" "}across automation, ERP, and governance.
      </p>
    </section>
  );
}
