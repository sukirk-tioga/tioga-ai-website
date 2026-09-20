import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";
import { EvidenceTierTag, type EvidenceTier } from "@/app/demos/_lib/evidence-tier";

interface ProofPoint {
  label: string;
  /** ReactNode (not string) so a proof point can carry an in-page link. */
  detail: React.ReactNode;
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

interface WhyNotPlatformContent {
  heading: string;
  paragraphs: string[];
}

interface InputsAndSystemsItem {
  label: string;
  detail: string;
}

interface WorkflowStep {
  step: string;
  title: string;
  detail: string;
}

interface RunRecordRow {
  check: string;
  result: string;
}

/** A dated, honestly-labelled record of one real run, rendered between Proof
    and "why not platform". Optional -- only pages that carry such a record
    supply it. */
interface RunRecordContent {
  /** In-page anchor id (the Proof section links here). */
  id: string;
  heading: string;
  /** Prominent short label, e.g. "Real system, synthetic data". */
  label: string;
  evidenceTier: EvidenceTier;
  evidenceDetail: string;
  whatThisIs: string;
  /** Text after a bold "Label:" lead-in. */
  labelNote: string;
  setup: string[];
  resultsHeading: string;
  results: RunRecordRow[];
  resultsNote: string;
  reverified: { lead: string; text: string };
  doesNotHaveHeading: string;
  doesNotHave: { lead?: string; text: string }[];
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
  /** Optional "why not just use what you already pay for" section, rendered
      between Proof and Offers. See G-36 in the 2026-09-02 business-readiness
      audit — the site had no direct answer to the platform-native-governance
      objection (ServiceNow Action Fabric / AI Control Tower, SAP Agent Hub,
      Salesforce hosted MCP servers). Optional so pages that don't need it
      (most solution pages) are unaffected. */
  whyNotPlatform?: WhyNotPlatformContent;
  /** Optional dated run record, rendered between Proof and whyNotPlatform. */
  runRecord?: RunRecordContent;
  /** Sections 2 and 3 of the six-section solution-page template from the
      2026-09-08 design review (~/Downloads/tioga-final-visual-and-ai-
      showcase-review.pdf, "05 / Solutions and detail templates"): "Inputs
      and systems" (what comes in, systems in scope, prerequisite access,
      sandbox vs. production) and "The workflow" (input > proposed action >
      policy/approval > execution boundary > verified result). Both
      optional and rendered only when a page's content supplies them, per
      the 2026-09-08 decision to apply the template to exactly one
      currently-thin solution page, not roll it out to every page. */
  inputsAndSystems?: InputsAndSystemsItem[];
  workflowSteps?: WorkflowStep[];
}

export default function SolutionPage({ content }: { content: SolutionContent }) {
  return (
    <main className="min-h-screen text-[var(--text)]">
      {/* Hero -- deliberately no opaque background here (Phase 4): this
          band is transparent so the persistent, mood-tweened
          <SolutionsFieldLoader> mounted in app/solutions/layout.tsx shows
          through as the "shared abstract space" backdrop. Everything from
          Buyer+Outcome down sits in its own opaque wrapper below. */}
      <section className="pt-36 pb-16 px-6 max-w-4xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent-on-tint)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          {content.eyebrow}
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 tracking-tight" style={{ color: "var(--text-on-dark)" }}>
          {content.title}
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: "var(--text-muted-on-dark)" }}>{content.problem}</p>
        <div className="flex flex-col items-center sm:flex-row gap-4 justify-center">
          <TrackedCTA
            href="/contact"
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
              className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:opacity-90"
              style={{ border: "1px solid var(--text-muted-on-dark)", color: "var(--text-on-dark)" }}
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
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{content.buyer}</p>
          </div>
          <div className="md:pl-8" style={{ borderLeft: "1px solid var(--border)" }}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--accent)" }}>What you get</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{content.outcome}</p>
          </div>
        </div>
      </section>

      {/* Optional visual (e.g. an estate diagram) */}
      {content.visual && (
        <section className="px-6 pb-16 max-w-4xl mx-auto">{content.visual}</section>
      )}

      {/* Inputs and systems (optional, section 2 of the six-section template) */}
      {content.inputsAndSystems && (
        <section className="px-6 pb-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text)" }}>Inputs and systems</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {content.inputsAndSystems.map((item) => (
              <div
                key={item.label}
                className="p-5 rounded-xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <p className="text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>{item.label}</p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* The workflow (optional, section 3 of the six-section template) */}
      {content.workflowSteps && (
        <section className="px-6 pb-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text)" }}>The workflow</h2>
          <div className="space-y-3">
            {content.workflowSteps.map((s, i) => (
              <div key={s.step} className="flex gap-5 p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="text-xl font-bold font-mono shrink-0 mt-0.5" style={{ color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>{s.step}: {s.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Proof */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text)" }}>Why this is real, not a pitch deck</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {content.proof.map((p) => (
            <div
              key={p.label}
              className="p-5 rounded-xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>{p.label}</p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dated run record (optional) */}
      {content.runRecord && (
        <section id={content.runRecord.id} className="px-6 pb-16 max-w-4xl mx-auto scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text)" }}>{content.runRecord.heading}</h2>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent-on-tint)" }}
          >
            <span className="w-1.5 h-1.5 bg-current rounded-full" />
            {content.runRecord.label}
          </div>
          <div>
            <EvidenceTierTag tier={content.runRecord.evidenceTier} detail={content.runRecord.evidenceDetail} />
          </div>
          <div
            className="p-8 rounded-2xl space-y-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div>
              <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>What this is</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">{content.runRecord.whatThisIs}</p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                <strong style={{ color: "var(--text)" }}>Label:</strong> {content.runRecord.labelNote}
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>What was set up</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--text-muted)] leading-relaxed">
                {content.runRecord.setup.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>{content.runRecord.resultsHeading}</h3>
              <div className="overflow-x-auto rounded-2xl mb-4" style={{ border: "1px solid var(--border)" }}>
                <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-card)" }}>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Check</th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent)" }}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.runRecord.results.map((r, i) => (
                      <tr key={r.check} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 1 ? "var(--bg-dark)" : "transparent" }}>
                        <td className="p-4 font-medium text-[var(--text)] leading-relaxed align-top">{r.check}</td>
                        <td className="p-4 text-[var(--text-muted)] leading-relaxed align-top">{r.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">{content.runRecord.resultsNote}</p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                <strong style={{ color: "var(--text)" }}>{content.runRecord.reverified.lead}</strong> {content.runRecord.reverified.text}
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>{content.runRecord.doesNotHaveHeading}</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--text-muted)] leading-relaxed">
                {content.runRecord.doesNotHave.map((item) => (
                  <li key={item.text}>
                    {item.lead && <strong style={{ color: "var(--text)" }}>{item.lead}</strong>}
                    {item.lead ? " " : ""}
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Why not just use what you already pay for (optional) */}
      {content.whyNotPlatform && (
        <section className="px-6 pb-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text)" }}>{content.whyNotPlatform.heading}</h2>
          <div
            className="p-8 rounded-2xl space-y-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {content.whyNotPlatform.paragraphs.map((para, i) => (
              <p key={i} className="text-sm text-[var(--text-muted)] leading-relaxed">{para}</p>
            ))}
          </div>
        </section>
      )}

      {/* Offers */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Engagements</h2>
        <p className="text-sm text-[var(--text-muted)] mb-3 max-w-2xl">
          Every engagement starts with a 5-day Discovery Sprint ($5,000 flat, prototype included) that scopes the work before any larger commitment — credited toward the price below if you move forward.
        </p>
        <TrackedCTA
          href="/samples/erp-agent-readiness-checklist.html"
          target="_blank"
          rel="noopener noreferrer"
          event="lead_asset_download"
          data={{ asset: "erp-agent-readiness-checklist", location: `solutions_${content.slug}` }}
          className="inline-block text-sm underline underline-offset-2 mb-6 transition-colors hover:text-[var(--text)]"
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
                  <h3 className="text-base font-semibold mb-1.5" style={{ color: "var(--text)" }}>{offer.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{offer.desc}</p>
                </div>
                <div className="shrink-0 text-right md:pl-6">
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{offer.price}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{offer.duration}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text)" }}>Questions</h2>
        <div className="space-y-3">
          {content.faq.map((item) => (
            <details
              key={item.q}
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <summary className="px-5 py-4 text-sm font-medium cursor-pointer list-none flex items-center justify-between gap-3" style={{ color: "var(--text)" }}>
                {item.q}
                <span className="text-[var(--text-muted)] shrink-0">+</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-[var(--text-muted)] leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related + CTA */}
      <section className="px-6 pb-24 max-w-4xl mx-auto text-center">
        <TrackedCTA
          href="/contact"
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
              className="underline underline-offset-2 transition-colors hover:text-[var(--text)]"
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
