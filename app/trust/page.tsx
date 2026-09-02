import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust & Governance",
  description:
    "How Tioga AI builds NIST AI RMF, ISO 42001, and EU AI Act governance into AI agents from the start — not as documentation added after a pilot succeeds.",
  alternates: { canonical: "/trust" },
  openGraph: {
    title: "Trust & Governance — Tioga AI",
    description:
      "Governance built into the architecture, not bolted on — mapped to NIST AI RMF, ISO 42001, and the EU AI Act.",
  },
};

const FRAMEWORKS = [
  {
    name: "NIST AI RMF",
    tag: "US federal framework",
    body: "The four-function model — Govern, Map, Measure, Manage — that structures how we design every agent's logging, cost controls, and human oversight from day one.",
    offer: "AI Governance Readiness Assessment",
    price: "$20–35K",
    href: "/trust/framework-mapping",
    linkText: "See how it maps to ISO 42001 and the EU AI Act →",
  },
  {
    name: "ISO 42001",
    tag: "International standard",
    body: "The AI management system standard for organizations that need certification-ready documentation, not just internal policy — audit trail structured for a third-party assessor.",
    offer: "ISO 42001 Implementation Sprint",
    price: "$50–120K",
    href: "/trust/framework-mapping",
    linkText: "See how it maps to NIST AI RMF and the EU AI Act →",
  },
  {
    name: "EU AI Act",
    tag: "EU regulation",
    body: "Risk-tiering, conformity documentation, and technical files for organizations with EU exposure — including the Article 50 transparency obligations phasing in through 2026.",
    offer: "EU AI Act Conformity Program",
    price: "$75–200K",
    href: "/trust/eu-ai-act",
    linkText: "What non-compliance costs →",
  },
];

const SUBPROCESSORS = [
  { name: "Anthropic", purpose: "Processes text submitted to demos, the chat widget, and contact-form classification, per Anthropic's own privacy policy." },
  { name: "Google (Gmail SMTP)", purpose: "Delivers contact-form notifications and optional demo-result emails — nothing beyond that." },
  { name: "Vercel", purpose: "Hosts this site and its serverless functions." },
];

const SECURITY_PRACTICES = [
  "Strict Content-Security-Policy on every response — no inline script execution beyond Next.js's own hydration payload, no framing by other sites (frame-ancestors 'none'), no eval in production.",
  "X-Frame-Options: DENY, X-Content-Type-Options: nosniff, and a locked-down Permissions-Policy blocking camera/microphone/geolocation access sitewide.",
  "Per-IP rate limiting on every demo and API endpoint, so no single visitor can exhaust the shared model budget or hammer an endpoint.",
  "No demo or chat submission is retained after the response is generated — see the Privacy Policy for the full breakdown, endpoint by endpoint.",
  "No API keys or secrets ship to the browser — every model call is proxied through a server-side route.",
];

const FUNCTIONS = [
  {
    name: "GOVERN",
    body: "A spend policy and oversight structure set once and enforced automatically on every model call — not a quarterly review that discovers drift after the fact.",
  },
  {
    name: "MAP",
    body: "Every AI action records what was requested and what actually executed it. No call happens without a named model and a named route.",
  },
  {
    name: "MEASURE",
    body: "Token volume, cost, and output quality are recorded on every call — unsampled, not a spot check run once a quarter.",
  },
  {
    name: "MANAGE",
    body: "Spend and risk are checked and reserved before an action executes — the system is architecturally incapable of the failure mode, not just monitored for it.",
  },
];

export default function TrustPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#EC6D3D15", border: "1px solid #EC6D3D30", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Trust &amp; Governance
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Governance built in.<br />
          <span style={{ color: "var(--accent)" }}>Not bolted on.</span>
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-16">
          Most AI vendors treat governance as documentation written after a
          pilot works. We design the logging, cost controls, and human
          oversight into the architecture first — so the compliance artifact
          is a byproduct of how the system runs, not a separate deliverable
          bolted on afterward.
        </p>

        {/* Framework cards */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-2">The three frameworks we build against</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-2xl">
            Each maps to a productized offer — a concrete deliverable and
            timeline, not an open-ended retainer.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {FRAMEWORKS.map((f) => (
              <div key={f.name} className="p-6 rounded-2xl flex flex-col" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">{f.tag}</p>
                <h3 className="text-lg font-bold text-white mb-3">{f.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5 flex-1">{f.body}</p>
                <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                  <p className="text-xs text-slate-400 mb-0.5">Mapped offer</p>
                  <p className="text-sm font-semibold text-white">{f.offer}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--accent)" }}>{f.price}</p>
                  {f.href && (
                    <Link href={f.href} className="inline-block text-xs mt-3 hover:text-white transition-colors" style={{ color: "var(--accent)" }}>
                      {f.linkText}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAP/MEASURE/MANAGE/GOVERN */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-2">How this shows up in the architecture</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-2xl">
            The NIST AI RMF&apos;s four functions, expressed as engineering
            requirements rather than compliance checklist items.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {FUNCTIONS.map((f) => (
              <div key={f.name} className="p-5 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-bold tracking-wide mb-1.5" style={{ color: "var(--accent)" }}>{f.name}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live proof */}
        <div
          className="rounded-2xl p-8 mb-16"
          style={{ background: "linear-gradient(135deg, #EC6D3D08, #C8340608)", border: "1px solid #EC6D3D30" }}
        >
          <h2 className="text-xl font-bold text-white mb-3">Don&apos;t take this on faith</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-5 max-w-2xl">
            The Governance Ledger demo isn&apos;t a mockup. It&apos;s a real,
            unedited excerpt of the AI routing gateway this business runs its
            own infrastructure on — every call logged, costed, and mapped to
            the four functions above. Real operational data, refreshed
            periodically — not a live-refreshing feed.
          </p>
          <Link
            href="/demos/governance-ledger"
            className="inline-flex px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            See the live ledger →
          </Link>
        </div>

        {/* Compliance & certification status */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-2">Compliance &amp; certification status</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mb-4">
            The three frameworks above are engagements we build for clients —
            not certifications Tioga AI itself currently holds. Said plainly,
            not implied:
          </p>
          <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400 leading-relaxed">
              <li>
                Our own infrastructure&apos;s security controls — role-based
                access, audit logging, architecture aligned to SOC 2 Trust
                Services Criteria — are real and demonstrated live in the{" "}
                <Link href="/demos/governance-ledger" className="underline hover:text-white transition-colors">Governance Ledger demo</Link>.
                No independent SOC 2 report exists yet.
              </li>
              <li>
                We are not ISO 42001 certified. The ISO 42001 Implementation
                Sprint helps a client&apos;s AI management system reach that
                bar — it is a delivery engagement, not a badge we display.
              </li>
              <li>
                NIST AI RMF is a voluntary framework with no certification to
                hold; ISO 42001 and EU AI Act obligations attach to the
                systems we help build, not to Tioga AI as a vendor.
              </li>
            </ul>
          </div>
        </div>

        {/* AI use & disclosure */}
        <div id="ai-use" className="mb-16 scroll-mt-24">
          <h2 className="text-xl font-bold text-white mb-2">AI use &amp; disclosure</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mb-6">
            Required reading under the EU AI Act&apos;s Article 50 transparency
            obligations, and good practice regardless of where you&apos;re
            reading from: here&apos;s exactly where AI touches this site, and
            what it does.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold text-white mb-1.5">Contact form classifier</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you submit the contact form, Anthropic&apos;s Claude reads
                your message and classifies it (service match, urgency,
                complexity, fit) to help route it. You see that
                classification immediately on screen, and it&apos;s emailed to
                the founder — a human reviews it before anyone follows up
                with you. It doesn&apos;t talk back to you and it&apos;s not a
                chatbot.
              </p>
            </div>
            <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold text-white mb-1.5">Chat widget</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                The chat bubble in the corner of the site is Anthropic&apos;s
                Claude, streaming replies to you live. Nobody reviews its
                messages before you see them — that&apos;s the nature of a
                real-time chat. It says so at the start of every
                conversation, not just here.
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Nothing on this site publishes AI-generated content to anyone else
            or takes an action on your behalf without a human in the loop.
            Both surfaces run on Anthropic&apos;s Claude — see the
            sub-processor table below for what happens to your data. Prefer a
            human at any point? Email{" "}
            <a href="mailto:hello@tioga.ai" className="underline hover:text-white transition-colors">hello@tioga.ai</a>{" "}
            or{" "}
            <Link href="/contact" className="underline hover:text-white transition-colors">book a call</Link>.
          </p>
        </div>

        {/* Data handling & sub-processors */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-2">Data handling &amp; sub-processors</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mb-6">
            Tioga AI is a solo-run practice — no marketing database, no ad
            tracking, no resale of anything you submit. The full breakdown,
            endpoint by endpoint, is in the{" "}
            <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
            Exactly three external parties ever touch your data:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {SUBPROCESSORS.map((s) => (
              <div key={s.name} className="p-5 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="text-sm font-semibold text-white mb-1.5">{s.name}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{s.purpose}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security practices */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-2">Security practices</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mb-6">
            What&apos;s actually enforced on this site today, not a generic
            checklist:
          </p>
          <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <ul className="list-disc pl-5 space-y-2.5 text-sm text-slate-400 leading-relaxed">
              {SECURITY_PRACTICES.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Availability & incident response */}
        <div className="mb-16 grid sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-bold text-white mb-2">Availability</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hosted on Vercel&apos;s global edge network. As a pre-launch,
              solo-founder practice, there is no formal uptime SLA published
              yet — that&apos;s a real gap, not hidden. If tioga.ai is down,
              there is currently no separate status page; check the site
              directly or email us.
            </p>
          </div>
          <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-bold text-white mb-2">Incident response</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              No dedicated security team — the founder personally reviews and
              responds to anything reported. What that means in practice: a
              fast, direct response from the person who built the system,
              not a ticket queue.
            </p>
          </div>
        </div>

        {/* Security contact / responsible disclosure */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-2">Report a security issue</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mb-2">
            Found a vulnerability? There is no formal bug bounty program yet
            — but every report is read and acted on personally. Email{" "}
            <a href="mailto:hello@tioga.ai?subject=Security" className="underline hover:text-white transition-colors">
              hello@tioga.ai
            </a>{" "}
            with subject line &ldquo;Security&rdquo; and what you found.
          </p>
        </div>

        {/* All offers */}
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-4">
            Ten of Tioga AI&apos;s fifteen engagements are governance-focused.
          </p>
          <Link
            href="/services"
            className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-white inline-block"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            See all fifteen offers →
          </Link>
        </div>
      </section>
    </main>
  );
}
