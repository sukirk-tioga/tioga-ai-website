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
      <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-slate-400 leading-relaxed">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Privacy Policy
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-14">Last updated: 2026-07-27</p>

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
            <strong className="text-white">Contact form.</strong> When you
            submit the form on the homepage (name, company, email, project
            description), that text is sent to Anthropic&apos;s Claude API to
            classify the inquiry (urgency, service fit, suggested next step),
            and the submission plus that classification is emailed to Tioga
            AI&apos;s founder so we can respond to you. It is not written to a
            database on our side — the email inbox is the record.
          </p>
          <p>
            <strong className="text-white">Live demos.</strong> Text or files
            you paste or upload into the invoice processing, email triage,
            document classification, or migration assessment demos are sent
            to Claude to generate the result shown on screen, and are not
            stored anywhere afterward — not in a database, not in a log, not
            emailed to us. Once the response is returned to your browser, we
            have no further copy of what you submitted.
          </p>
          <p>
            <strong className="text-white">
              &ldquo;Send me a copy&rdquo; on the migration assessment.
            </strong>{" "}
            If you optionally enter an email address on that demo, it is used
            once, in memory, to send that one assessment to you by email — it
            is not logged, written to a database, or sent to us. See Third
            Parties below for the mail provider that transmits it.
          </p>
          <p>
            <strong className="text-white">Chat widget.</strong> Messages you
            send to the chat assistant are sent to Claude to generate a reply
            and are not stored after your browser session ends.
          </p>
          <p>
            <strong className="text-white">Basic request metadata.</strong> To
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
              <strong className="text-white">Anthropic</strong> (Claude API) —
              processes the text you submit to generate classifications, demo
              outputs, and chat replies, per{" "}
              <a
                href="https://www.anthropic.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-300 transition-colors"
              >
                Anthropic&apos;s own privacy policy
              </a>
              .
            </li>
            <li>
              <strong className="text-white">Google (Gmail SMTP)</strong> —
              delivers the contact-form notification email to Tioga AI&apos;s
              inbox, and delivers your copy of the migration assessment
              directly to you if you request one.
            </li>
            <li>
              <strong className="text-white">Vercel</strong> — hosts this
              site and its serverless functions.
            </li>
          </ul>
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
            <a href="mailto:hello@tioga.ai" className="underline hover:text-slate-300 transition-colors">
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
            <Link href="/changelog" className="underline hover:text-slate-300 transition-colors">
              Build Log
            </Link>
            .
          </p>
        </Section>

        <Section title="Questions">
          <p>
            Email{" "}
            <a href="mailto:hello@tioga.ai" className="underline hover:text-slate-300 transition-colors">
              hello@tioga.ai
            </a>{" "}
            with anything not covered here.
          </p>
        </Section>
      </section>
    </main>
  );
}
