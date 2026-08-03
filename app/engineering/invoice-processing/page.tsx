import type { Metadata } from "next";
import BenchmarkCard from "@/components/BenchmarkCard";

export const metadata: Metadata = {
  title: "How We Built the Invoice Processing Demo",
  description:
    "The extraction pipeline behind the invoice processing demo: format-agnostic file parsing, a structured-JSON prompt, and why a small, fast model was the right call.",
  openGraph: {
    title: "How We Built the Invoice Processing Demo — Tioga AI",
    description: "Format-agnostic parsing, a structured-JSON prompt, and why a small model was the right call.",
  },
};

export default function InvoiceProcessingWriteup() {
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
          How we built the Invoice Processing demo
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed mb-12">
          Pull structured data — vendor, line items, totals, due date — out of
          an invoice in any format a finance team actually receives one in.
          Not a formatted sample PDF; whatever gets forwarded to AP.
        </p>

        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-3">The problem</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Invoices arrive as PDFs, scanned images saved as PDFs, Word
              docs, or plain email text pasted into a form. Most invoice-AI
              demos quietly assume the first case. Real AP inboxes get all of
              them, plus the occasional file that isn&apos;t actually an invoice
              at all.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">The pipeline</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              File upload hits a shared <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)", color: "var(--accent)" }}>/api/extract-text</code> route
              before the invoice-specific logic ever runs:
            </p>
            <ol className="space-y-3">
              {[
                "Detect file type by extension, not MIME type — browsers report MIME types inconsistently across OS/browser combinations, extensions don't.",
                "PDF → unpdf (serverless-compatible; pdf-parse and pdfjs-dist both hit Node API assumptions that break under Vercel's runtime — this took two failed attempts to learn).",
                "DOCX → mammoth, extracting raw text only.",
                "TXT/MD/CSV → read directly, no parsing needed.",
                "Text truncated to a 10,000-character ceiling before it ever reaches a model call.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                  <span className="font-mono text-xs shrink-0 pt-0.5" style={{ color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">The extraction call</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              The prompt asks for one JSON object — vendor, invoice number,
              dates, PO number, line items, subtotal, tax, total, payment
              instructions, and a self-reported confidence score — and
              nothing else. The response is regex-matched for the outermost
              <code className="text-xs px-1.5 py-0.5 rounded mx-1" style={{ background: "var(--bg-card)", color: "var(--accent)" }}>{"{...}"}</code>
              block before <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)", color: "var(--accent)" }}>JSON.parse</code>, since
              models occasionally wrap output in a sentence even when told not to.
            </p>
          </div>

          {/* Design decisions callout */}
          <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC08)", border: "1px solid #00D4FF30" }}>
            <h2 className="text-lg font-bold text-white mb-3">Why Haiku, not Sonnet</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              This is field extraction against text that&apos;s already been
              parsed out of the source file — there&apos;s no multi-step
              reasoning, no judgment call, no ambiguity to weigh. Claude
              Haiku 4.5 handles it at a fraction of the latency and cost of a
              larger model. The Migration Assessment demo, which does
              require judgment, runs on Sonnet 5 instead — matching model
              size to the actual reasoning load is a cost decision we apply
              to client work, not just this site.
            </p>
          </div>

          <BenchmarkCard
            data={{
              date: "2026-08-02",
              model: "Claude Haiku 4.5 (claude-haiku-4-5-20251001)",
              dataSource:
                "8 hand-authored synthetic invoices (clean, messy, multilingual, non-invoice, credit-memo formats) run live against the production endpoint at tioga.ai — not a cached or pre-recorded result.",
              sampleSize: "8 synthetic invoices, 21 scored fields",
              metrics: [
                { label: "Field-match rate (vendor / invoice # / total)", value: "21/21 fields (100%)" },
                { label: "Successful extractions", value: "8/8 (HTTP 200)" },
                { label: "Average latency", value: "~1.7s" },
                { label: "Non-invoice input", value: "Correctly flagged, confidence 5/100, no fabricated fields" },
              ],
              limitations: [
                "Sample size is small (8 cases) and hand-authored, not drawn from a real-world invoice corpus — a production engagement would validate against your actual invoice formats before go-live.",
                "Field-match scoring used fuzzy substring matching, not strict equality — an exact-match check would likely show a lower, more conservative number.",
                "Only 3 fields (vendor, invoice number, total) were scored; line-item and date-field accuracy weren't measured in this run.",
              ],
            }}
          />
        </div>

        <div className="mt-16 text-center">
          <a
            href="/demos"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Try it with your own invoice →
          </a>
        </div>
      </section>
    </main>
  );
}
