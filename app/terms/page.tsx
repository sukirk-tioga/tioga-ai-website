import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the tioga.ai website and its live AI demos.",
  openGraph: {
    title: "Terms of Service — Tioga AI",
    description: "Terms governing use of the tioga.ai website and its live AI demos.",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-slate-400 leading-relaxed">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "#0A0F1C" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "#00D4FF" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Terms of Service
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-14">Last updated: 2026-07-27</p>

        <Section title="Agreement">
          <p>
            These terms govern your use of tioga.ai, including the live demos,
            chat assistant, and contact form (the &ldquo;Site&rdquo;). By using
            the Site, you agree to them. If you don&apos;t agree, don&apos;t
            use the Site.
          </p>
        </Section>

        <Section title="The demos are illustrative, not advice">
          <p>
            The invoice processing, email triage, document classification,
            migration assessment, and governance ledger demos exist to show
            how Tioga AI builds AI features against real systems. Outputs are
            generated live by an AI model and are provided for evaluation
            purposes only — they are not financial, legal, tax, accounting,
            or compliance advice, and should not be relied on as such for any
            real business decision. Don&apos;t submit information you rely on
            being accurate without independent verification.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree not to use the Site to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Submit unlawful, infringing, or malicious content, including attempts to extract, jailbreak, or abuse the underlying AI models.</li>
            <li>Submit another person&apos;s personal or confidential data without their consent.</li>
            <li>Probe, scan, overload, or otherwise attack the Site or its infrastructure.</li>
            <li>Misrepresent your identity when submitting the contact form.</li>
          </ul>
          <p>
            We rate-limit demo and form endpoints and may block traffic that
            looks abusive.
          </p>
        </Section>

        <Section title="No warranty">
          <p>
            The Site and its demos are provided &ldquo;as is,&rdquo; without
            warranty of any kind. AI-generated output can be wrong. We don&apos;t
            guarantee the Site or demos will be uninterrupted, error-free, or
            fit for any particular purpose.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the maximum extent permitted by law, Tioga AI is not liable for
            any indirect, incidental, or consequential damages arising from
            your use of the Site or reliance on demo output. This Site does
            not create a client, consulting, or advisory relationship — that
            only happens under a separately signed engagement agreement or
            statement of work.
          </p>
        </Section>

        <Section title="Intellectual property">
          <p>
            The Site&apos;s design, copy, and code are Tioga AI&apos;s property
            unless otherwise noted. Content you submit through the contact
            form or demos remains yours; see the{" "}
            <a href="/privacy" className="underline hover:text-slate-300 transition-colors">
              Privacy Policy
            </a>{" "}
            for how it&apos;s handled.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We may update these terms as the Site changes. Continued use after
            an update means you accept the revised terms. Material changes
            will be reflected in the{" "}
            <a href="/changelog" className="underline hover:text-slate-300 transition-colors">
              Build Log
            </a>
            .
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these terms:{" "}
            <a href="mailto:hello@tioga.ai" className="underline hover:text-slate-300 transition-colors">
              hello@tioga.ai
            </a>
            .
          </p>
        </Section>
      </section>
    </main>
  );
}
