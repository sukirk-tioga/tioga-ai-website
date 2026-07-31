import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Built the Email Triage Demo",
  description:
    "Classification, routing, and reply drafting in a single call — and why constraining the model's output to enums matters more than the prompt wording.",
  openGraph: {
    title: "How We Built the Email Triage Demo — Tioga AI",
    description: "Classification, routing, and reply drafting in a single call.",
  },
};

export default function EmailTriageWriteup() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <a href="/engineering" className="text-xs mb-6 inline-block hover:text-white transition-colors" style={{ color: "var(--accent)" }}>
          ← How We Built It
        </a>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ color: "var(--accent)", background: "#00D4FF15", border: "1px solid #00D4FF30" }}>
            Claude Haiku 4.5
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
          How we built the Email Triage demo
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed mb-12">
          Read an inbound email once, and come out the other side with a
          category, an urgency level, who should own it, and a draft reply —
          the four decisions a human triaging a shared inbox actually makes.
        </p>

        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-3">The problem</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              A shared inbox mixes sales inquiries, support tickets,
              complaints, spam, and the occasional legal notice. Triage isn&apos;t
              one decision — it&apos;s classify, prioritize, route, and often
              draft a first response, all before anyone with the right
              context has read the message.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">One call, five decisions</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Rather than chain separate classify → route → draft calls, the
              route asks for one JSON object with all five fields at once:
              category, urgency, sentiment, routing destination, a one-line
              summary, a suggested reply, and extracted key entities. Fewer
              round trips, and the fields stay consistent with each other
              since one call reasons about all of them together.
            </p>
            <div className="p-5 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">Every field is a closed enum, not free text</p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                <p><span style={{ color: "var(--accent)" }}>category</span>: Sales | Support | Complaint | Partnership | Spam | Internal | Invoice | Legal</p>
                <p><span style={{ color: "var(--accent)" }}>urgency</span>: low | medium | high | critical</p>
                <p><span style={{ color: "var(--accent)" }}>sentiment</span>: positive | neutral | negative | frustrated | urgent</p>
                <p><span style={{ color: "var(--accent)" }}>routeTo</span>: Sales | Support | Finance | Legal | Management | Spam | HR</p>
              </div>
            </div>
          </div>

          {/* Design decisions callout */}
          <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC08)", border: "1px solid #00D4FF30" }}>
            <h2 className="text-lg font-bold text-white mb-3">Why enums, not open categories</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              An open-ended <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-dark)", color: "var(--accent)" }}>&quot;category&quot;: string</code> field
              looks more flexible, but it pushes the hard part downstream: whatever
              consumes this output — a routing rule, a dashboard filter, a
              ticketing integration — now has to handle arbitrary strings a
              model might invent. Naming the exact set of allowed values in
              the prompt turns validation into a one-line membership check
              instead of fuzzy string matching against however the model
              phrased something this time. It&apos;s a small constraint that
              removes an entire category of downstream bugs.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <a
            href="/demos"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Try it with your own email →
          </a>
        </div>
      </section>
    </main>
  );
}
