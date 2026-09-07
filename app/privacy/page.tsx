import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Tioga AI handles the data you submit through the contact form and the live demos on this site.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — Tioga AI",
    description:
      "How Tioga AI handles the data you submit through the contact form and the live demos on this site.",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>{title}</h2>
      <div className="space-y-3 text-sm text-[var(--text-muted)] leading-relaxed">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Privacy Policy
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>Privacy Policy</h1>
        <p className="text-sm text-[var(--text-muted)] mb-14">Last updated: 2026-09-06</p>

        {/* Added 2026-09-06 per the 2026-09-02 business-readiness audit,
            G-32: this page had no data-controller identity, no Article 6
            lawful basis, no Article 27 EU representative section, no
            international-transfer disclosure, and no CCPA section, despite
            /trust/eu-ai-act/calculator actively targeting EU-exposed
            organizations. Bracketed placeholders follow the same convention
            as ~/SecondBrain/TiogaAI/legal/templates/msa-template.md for
            facts only Sukir/counsel can confirm. This section makes the
            page structurally complete and honest about what's real vs.
            still open — it is not a GDPR/CCPA compliance claim. */}
        <Section title="Data controller">
          <p>
            The data controller for information collected through this Site
            is{" "}
            <strong style={{ color: "var(--text)" }}>
              [TIOGA AI, LLC / EXACT LEGAL NAME]
            </strong>
            , with a registered address at{" "}
            <strong style={{ color: "var(--text)" }}>[REGISTERED ADDRESS]</strong>
            . Contact:{" "}
            <a href="mailto:hello@tioga.ai" className="underline hover:text-[var(--text)] transition-colors">
              hello@tioga.ai
            </a>
            .
          </p>
        </Section>

        <Section title="The short version">
          <p>
            This page describes, plainly, what actually happens to data you
            submit on tioga.ai — the contact form and the live AI demos. Tioga
            AI is a solo-run practice; there is no marketing database, no ad
            tracking, and no resale of your data to anyone. What we collect,
            we collect to respond to you or to run the demo you asked to see.
          </p>
        </Section>

        <Section title="What we collect and why">
          <p>
            <strong style={{ color: "var(--text)" }}>Contact form.</strong> When you
            submit the form on the homepage (name, company, email, project
            description), that text is sent to Anthropic&apos;s Claude API to
            classify the inquiry (urgency, service fit, suggested next step),
            and the submission plus that classification is emailed to Tioga
            AI&apos;s founder so we can respond to you. It is not written to a
            database on our side — the email inbox is the record.
          </p>
          <p>
            <strong style={{ color: "var(--text)" }}>Live demos.</strong> Text or files
            you paste or upload into the invoice processing, email triage,
            document classification, or migration assessment demos are sent
            to Claude to generate the result shown on screen, and are not
            stored anywhere afterward — not in a database, not in a log, not
            emailed to us. Once the response is returned to your browser, we
            have no further copy of what you submitted.
          </p>
          <p>
            <strong style={{ color: "var(--text)" }}>
              &ldquo;Send me a copy&rdquo; on the migration assessment.
            </strong>{" "}
            If you optionally enter an email address on that demo, it is used
            once, in memory, to send that one assessment to you by email — it
            is not logged, written to a database, or sent to us. See Third
            Parties below for the mail provider that transmits it.
          </p>
          <p>
            <strong style={{ color: "var(--text)" }}>Chat widget.</strong> Messages you
            send to the chat assistant are sent to Claude to generate a reply
            and are not stored after your browser session ends.
          </p>
          <p>
            <strong style={{ color: "var(--text)" }}>Basic request metadata.</strong> To
            prevent abuse of the contact form and demo endpoints, we
            rate-limit by IP address. That count is held in server memory
            temporarily and is not linked to your name or email.
          </p>
        </Section>

        <Section title="What we don't do">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>We do not use anything you submit to train any AI model.</li>
            <li>We do not sell or share your data with advertisers or data brokers.</li>
            <li>We do not run ad-tracking or third-party analytics scripts on this site.</li>
            <li>We do not retain demo submissions after the response is generated.</li>
          </ul>
        </Section>

        <Section title="Third parties who process your data">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong style={{ color: "var(--text)" }}>Anthropic</strong> (Claude API) —
              processes the text you submit to generate classifications, demo
              outputs, and chat replies, per{" "}
              <a
                href="https://www.anthropic.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[var(--text)] transition-colors"
              >
                Anthropic&apos;s own privacy policy
              </a>
              .
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>Google (Gmail SMTP)</strong> —
              delivers the contact-form notification email to Tioga AI&apos;s
              inbox, and delivers your copy of the migration assessment
              directly to you if you request one.
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>Vercel</strong> — hosts this
              site and its serverless functions.
            </li>
          </ul>
        </Section>

        <Section title="Legal basis for processing (EEA, UK, Switzerland)">
          <p>
            If you&apos;re located in the European Economic Area, the UK, or
            Switzerland, our legal basis for processing under Article 6 of
            the GDPR depends on what you submit:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong style={{ color: "var(--text)" }}>Contact form</strong> —
              processed under Article 6(1)(b) (steps taken at your request
              toward a possible engagement) and Article 6(1)(f) (our
              legitimate interest in responding to a business inquiry you
              initiated).
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>
                Live demos and chat messages
              </strong>{" "}
              — processed under Article 6(1)(a) (your consent, given by
              choosing to submit content into a tool you know is not
              retained afterward).
            </li>
          </ul>
        </Section>

        <Section title="EU representative (Article 27)">
          <p>
            Article 27 of the GDPR requires organizations outside the EU that
            offer goods or services to, or monitor, individuals in the EU to
            designate an EU representative.{" "}
            <strong style={{ color: "var(--text)" }}>
              Tioga AI is a US-based sole practice and has not yet appointed
              an Article 27 EU representative.
            </strong>{" "}
            Stated plainly, as a real open gap rather than something glossed
            over: [TIOGA AI TO CONFIRM WHETHER ARTICLE 27 APPLIES GIVEN
            CURRENT EU-FACING TRAFFIC VOLUME, AND TO APPOINT A REPRESENTATIVE
            IF SO — NOT YET DONE AS OF THIS PAGE&apos;S LAST-UPDATED DATE
            ABOVE]. Until a representative is appointed, EU data-subject
            requests can be sent directly to{" "}
            <a href="mailto:hello@tioga.ai" className="underline hover:text-[var(--text)] transition-colors">
              hello@tioga.ai
            </a>
            .
          </p>
        </Section>

        <Section title="International data transfers">
          <p>
            The subprocessors listed above (Anthropic, Google, Vercel) are
            US-based, and data you submit from the EEA, UK, or Switzerland is
            processed there.{" "}
            <strong style={{ color: "var(--text)" }}>
              No Standard Contractual Clauses, adequacy decision, or other
              Article 46 transfer mechanism is currently confirmed in place
              between Tioga AI and its subprocessors for this purpose.
            </strong>{" "}
            [COUNSEL TO CONFIRM EACH SUBPROCESSOR&apos;S OWN DPA/SCC STATUS
            AND WHETHER AN ADDITIONAL TRANSFER MECHANISM IS NEEDED ON TIOGA
            AI&apos;S SIDE.] This is stated here as a real, currently open
            gap given that /trust/eu-ai-act/calculator actively targets
            EU-exposed organizations — not a claim that a transfer mechanism
            is already in place.
          </p>
        </Section>

        <Section title="California residents (CCPA/CPRA)">
          <p>
            If you&apos;re a California resident, you have the right to know
            what personal information we&apos;ve collected about you, the
            right to request deletion of it, the right to correct inaccurate
            information, and the right to opt out of the sale or sharing of
            your personal information.{" "}
            <strong style={{ color: "var(--text)" }}>
              Tioga AI does not sell or share personal information, as
              defined under the CCPA, with any third party
            </strong>{" "}
            — see What We Don&apos;t Do above. To exercise any of these
            rights, email{" "}
            <a href="mailto:hello@tioga.ai" className="underline hover:text-[var(--text)] transition-colors">
              hello@tioga.ai
            </a>
            .
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            Contact-form submissions live in the founder&apos;s email inbox for
            as long as needed to respond to and follow up on your inquiry.
            Demo and chat submissions are not retained at all — see above.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can ask us what we hold about you, or ask us to delete a
            contact-form submission from our inbox, at any time by emailing{" "}
            <a href="mailto:hello@tioga.ai" className="underline hover:text-[var(--text)] transition-colors">
              hello@tioga.ai
            </a>
            . Since demo submissions aren&apos;t retained, there&apos;s nothing
            to delete there by the time you&apos;d ask.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If how this site handles data changes, this page will be updated
            and the date at the top will change. Material changes will be
            reflected in the{" "}
            <Link href="/changelog" className="underline hover:text-[var(--text)] transition-colors">
              Build Log
            </Link>
            .
          </p>
        </Section>

        <Section title="Questions">
          <p>
            Email{" "}
            <a href="mailto:hello@tioga.ai" className="underline hover:text-[var(--text)] transition-colors">
              hello@tioga.ai
            </a>{" "}
            with anything not covered here.
          </p>
        </Section>
      </section>
    </main>
  );
}
