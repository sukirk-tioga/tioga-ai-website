import type { Metadata } from "next";
import SmartContactForm from "@/components/SmartContactForm";
import TrackedCTA from "@/components/TrackedCTA";

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

const CAL_LINK = "https://cal.com/sukir-kumaresan-rfgb7k/introduction-chat";

export default function ContactPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight text-balance">
            Start a conversation
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Two ways in — book time directly, or send a project inquiry and let the same AI routing behind every Tioga AI engagement take the first pass.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Book a call */}
          <div className="p-8 rounded-2xl h-fit" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-bold text-white mb-2">Book a call</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Skip the form — grab a 20-minute slot on my calendar directly. No pitch deck, just a conversation about what you&apos;re trying to build.
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
            <p className="text-xs text-slate-400 mt-4 text-center">
              Prefer email? <a href="mailto:hello@tioga.ai" className="underline hover:text-white transition-colors">hello@tioga.ai</a>
            </p>
          </div>

          {/* Send a message */}
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Send a message</h2>
            <p className="text-slate-400 mb-2 text-sm leading-relaxed">
              Tell me about your project. My AI instantly classifies your inquiry so it reaches me with the right context. Response within one business day — or email{" "}
              <a href="mailto:hello@tioga.ai" className="underline hover:text-white transition-colors">hello@tioga.ai</a> directly.
            </p>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 mt-2"
              style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
            >
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
              AI-powered routing — live demo of our email triage service
            </div>
            <SmartContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
