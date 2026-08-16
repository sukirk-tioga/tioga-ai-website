import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";

interface ProofPoint {
  label: string;
  detail: string;
}

interface OfferRef {
  name: string;
  price: string;
  duration: string;
  desc: string;
}

interface FAQItem {
  q: string;
  a: string;
}

interface RelatedLink {
  href: string;
  label: string;
}

export interface SolutionContent {
  slug: string;
  eyebrow: string;
  title: React.ReactNode;
  buyer: string;
  problem: string;
  outcome: string;
  proof: ProofPoint[];
  offers: OfferRef[];
  faq: FAQItem[];
  related: RelatedLink[];
  demoLink?: { href: string; label: string };
  visual?: React.ReactNode;
}

export default function SolutionPage({ content }: { content: SolutionContent }) {
  return (
    <main className="min-h-screen text-slate-200">
      {/* Hero -- deliberately no opaque background here (Phase 4): this
          band is transparent so the persistent, mood-tweened
          <SolutionsFieldLoader> mounted in app/solutions/layout.tsx shows
          through as the "shared abstract space" backdrop. Everything from
          Buyer+Outcome down sits in its own opaque wrapper below. */}
      <section className="pt-36 pb-16 px-6 max-w-4xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          {content.eyebrow}
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
          {content.title}
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">{content.problem}</p>
        <div className="flex flex-col items-center sm:flex-row gap-4 justify-center">
          <TrackedCTA
            href="/#contact"
            event="cta_book_call"
            data={{ location: `solutions_${content.slug}` }}
            className="px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Start a conversation
          </TrackedCTA>
          {content.demoLink && (
            <TrackedCTA
              href={content.demoLink.href}
              event="cta_view_demo"
              data={{ location: `solutions_${content.slug}` }}
              className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-white"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              {content.demoLink.label}
            </TrackedCTA>
          )}
        </div>
      </section>

      {/* Opaque wrapper -- everything below the transparent hero band gets
          the normal solid page background back. */}
      <div style={{ background: "var(--bg-dark)" }}>
      {/* Buyer + Outcome */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div
          className="p-8 rounded-2xl grid md:grid-cols-2 gap-8"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--accent)" }}>Who this is for</p>
            <p className="text-sm text-slate-300 leading-relaxed">{content.buyer}</p>
          </div>
          <div className="md:pl-8" style={{ borderLeft: "1px solid var(--border)" }}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--accent)" }}>What you get</p>
            <p className="text-sm text-slate-300 leading-relaxed">{content.outcome}</p>
          </div>
        </div>
      </section>

      {/* Optional visual (e.g. an estate diagram) */}
      {content.visual && (
        <section className="px-6 pb-16 max-w-4xl mx-auto">{content.visual}</section>
      )}

      {/* Proof */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Why this is real, not a pitch deck</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {content.proof.map((p) => (
            <div
              key={p.label}
              className="p-5 rounded-xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-semibold text-white mb-1.5">{p.label}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Engagements</h2>
        <p className="text-sm text-slate-400 mb-3 max-w-2xl">
          Every engagement starts with a 5-day Discovery Sprint ($5,000 flat, prototype included) that scopes the work before any larger commitment — credited toward the price below if you move forward.
        </p>
        <TrackedCTA
          href="/samples/erp-agent-readiness-checklist.html"
          target="_blank"
          rel="noopener noreferrer"
          event="lead_asset_download"
          data={{ asset: "erp-agent-readiness-checklist", location: `solutions_${content.slug}` }}
          className="inline-block text-sm underline underline-offset-2 mb-6 transition-colors hover:text-white"
          style={{ color: "var(--accent)" }}
        >
          Not ready to scope an engagement? Free ERP Agent-Readiness Checklist →
        </TrackedCTA>
        <div className="space-y-4">
          {content.offers.map((offer) => (
            <div
              key={offer.name}
              className="p-6 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white mb-1.5">{offer.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{offer.desc}</p>
                </div>
                <div className="shrink-0 text-right md:pl-6">
                  <p className="text-sm font-semibold text-white">{offer.price}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{offer.duration}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Questions</h2>
        <div className="space-y-3">
          {content.faq.map((item) => (
            <details
              key={item.q}
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <summary className="px-5 py-4 text-sm font-medium text-white cursor-pointer list-none flex items-center justify-between gap-3">
                {item.q}
                <span className="text-slate-400 shrink-0">+</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related + CTA */}
      <section className="px-6 pb-24 max-w-4xl mx-auto text-center">
        <TrackedCTA
          href="/#contact"
          event="cta_book_call"
          data={{ location: `solutions_${content.slug}_footer` }}
          className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
        >
          Start a conversation
        </TrackedCTA>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm">
          {content.related.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="underline underline-offset-2 transition-colors hover:text-white"
              style={{ color: "var(--accent)" }}
            >
              {r.label} →
            </Link>
          ))}
        </div>
      </section>
      </div>
    </main>
  );
}
