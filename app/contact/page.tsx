import type { Metadata } from "next";
import SmartContactForm from "@/components/SmartContactForm";
import TrackedCTA from "@/components/TrackedCTA";
import { CAL_LINK } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a 20-minute fit call or send a project inquiry — classified instantly by the same AI routing behind every Tioga AI engagement.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Tioga AI",
    description:
      "Book a 20-minute fit call or send a project inquiry — classified instantly by the same AI routing behind every Tioga AI engagement.",
  },
};


export default function ContactPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-balance" style={{ color: "var(--text)" }}>
            Start a conversation
          </h1>
          <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto">
            Two ways in — book time directly, or send a project inquiry and let the same AI routing behind every Tioga AI engagement take the first pass.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Book a call */}
          <div className="p-8 rounded-2xl h-fit" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Book a call</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
              Skip the form — grab 20 minutes directly on my calendar. No pitch deck, no discovery script. Bring the problem and I&apos;ll look at it with you.
            </p>
            <TrackedCTA
              href={CAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              event="cta_book_call"
              data={{ location: "contact_page" }}
              className="block text-center w-full px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
              style={{ background: "var(--accent-dark)" }}
            >
              Book a 20-minute fit call →
            </TrackedCTA>
            <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
              Prefer email? <a href="mailto:hello@tioga.ai" className="underline hover:text-[var(--text)] transition-colors">hello@tioga.ai</a>
            </p>
          </div>

          {/* Send a message */}
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Send a message</h2>
            <p className="text-[var(--text-muted)] mb-2 text-sm leading-relaxed">
              Tell me about your project. My AI instantly classifies your inquiry so it reaches me with the right context. Response within one business day — or email{" "}
              <a href="mailto:hello@tioga.ai" className="underline hover:text-[var(--text)] transition-colors">hello@tioga.ai</a> directly.
            </p>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 mt-2 max-w-[260px] sm:max-w-none"
              style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent)" }}
            >
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse shrink-0" />
              {/* max-w-[260px] on mobile only (sm:max-w-none) keeps this pill
                  narrow enough that its right edge never reaches the fixed
                  chat button's column (bottom-6 right-6, 56px), regardless
                  of where it lands vertically -- shifting spacing instead
                  would only fix today's exact scroll position, not the next
                  content change above it. Confirmed empirically: badge was
                  x:[24,366] y:[776,822] vs. button x:[310,366] y:[764,820]
                  on a live 390x844 check before this fix. */}
              AI-powered routing — live demo of our email triage service
            </div>
            <SmartContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
