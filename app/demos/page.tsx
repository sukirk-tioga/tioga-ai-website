"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";

// ── Types ────────────────────────────────────────────────────────────────────

interface EmailResult {
  category: string;
  urgency: "low" | "medium" | "high" | "critical";
  sentiment: string;
  routeTo: string;
  summary: string;
  suggestedReply: string;
  keyEntities: string[];
}

interface DocResult {
  documentType: string;
  confidence: number;
  summary: string;
  keyEntities: { people: string[]; organizations: string[]; dates: string[]; amounts: string[] };
  suggestedActions: string[];
  riskFlags: string[];
  department: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_EMAILS = [
  {
    label: "Sales Inquiry",
    text: `Hi,

I'm the VP of Operations at Meridian Logistics (500+ employees). We've been struggling with our invoice processing — currently 3 FTEs manually keying data from PDFs into SAP. It's slow, error-prone, and expensive.

I saw you specialize in enterprise AI integrations. Do you have experience with SAP? We'd like to automate this and potentially expand to our PO matching workflow too.

Can we set up a call this week? Budget is approved for the right solution.

Best,
James Whitfield
VP Operations, Meridian Logistics`,
  },
  {
    label: "Complaint",
    text: `This is completely unacceptable. We've been waiting THREE WEEKS for a response on our support ticket #4821. Our production system has been down and your team has been totally unresponsive. 

I've emailed five times, called twice, and left messages. Nobody is picking up. If this isn't resolved by end of day I'm escalating to your CEO and contacting our lawyers.

This is a critical system failure and your SLA clearly states 4-hour response time. You are in breach of contract.

- Rachel Donovan, CTO, Apex Systems`,
  },
  {
    label: "Partnership",
    text: `Hello,

I'm reaching out from Vertex AI Partners. We work with enterprise software companies to expand their distribution through channel partnerships.

We've been following Tioga AI's work and think there could be a great fit. We have relationships with 200+ enterprise clients in manufacturing and logistics who are actively looking for AI implementation partners.

Would you be open to a 30-minute intro call to explore a potential referral arrangement? We typically work on a revenue-share model.

Thanks,
Sarah Chen
Director of Partnerships, Vertex AI Partners`,
  },
  {
    label: "Support Request",
    text: `Hi support team,

We deployed the document classification pipeline last Tuesday and it was working great. Since yesterday morning, we're seeing a ~40% drop in accuracy on invoice documents specifically. Contract classification still seems fine.

I've attached logs. The issue seems to correlate with a batch of invoices from a new vendor (GlobalTech Supply) that have a slightly different format.

Can you take a look? Not urgent but would be good to get resolved before our end-of-month close.

Thanks,
Mike Torres
Data Engineering, Bramble Corp`,
  },
];

const SAMPLE_DOCS = [
  {
    label: "NDA",
    text: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of January 15, 2026, between Tioga AI Inc., a Delaware corporation ("Disclosing Party"), and Meridian Logistics LLC, a Texas limited liability company ("Receiving Party").

1. CONFIDENTIAL INFORMATION. "Confidential Information" means any non-public information disclosed by Disclosing Party to Receiving Party, including but not limited to: business plans, technical specifications, source code, pricing, customer lists, and trade secrets.

2. OBLIGATIONS. Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose to third parties without prior written consent; (c) use only for evaluating a potential business relationship.

3. TERM. This Agreement shall remain in effect for three (3) years from the date of execution.

4. GOVERNING LAW. This Agreement shall be governed by the laws of the State of Delaware.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

Tioga AI Inc.                    Meridian Logistics LLC
By: ___________________          By: ___________________
Name: Sarah Kim                  Name: James Whitfield
Title: CEO                       Title: VP Operations
Date: January 15, 2026           Date: January 15, 2026`,
  },
  {
    label: "Invoice",
    text: `INVOICE

From: CloudStack Infrastructure Ltd.
      42 Tech Park Drive, Austin TX 78701
      billing@cloudstack.io

To:   Tioga AI Inc.
      Attn: Finance Department
      San Francisco, CA

Invoice #: CS-2026-0892
Invoice Date: February 1, 2026
Due Date: March 3, 2026
PO Number: PO-TGA-441

Services Rendered - January 2026:

  Cloud Infrastructure (Production)     $4,200.00
  Cloud Infrastructure (Staging)        $1,100.00
  Data Transfer & Egress                  $340.00
  Support Contract (Enterprise Tier)    $2,500.00
  ─────────────────────────────────────────────
  Subtotal                              $8,140.00
  Tax (8.5%)                              $691.90
  ─────────────────────────────────────────────
  TOTAL DUE                             $8,831.90

Payment Terms: Net 30
Wire Transfer: Routing 021000021 | Account 4892017733
ACH: Same routing/account

Late payments subject to 1.5% monthly interest.`,
  },
  {
    label: "Resume",
    text: `ALEX MORGAN
alex.morgan@email.com | LinkedIn: /in/alexmorgan | San Francisco, CA

SUMMARY
Machine Learning Engineer with 6 years of experience building production AI systems. Specialized in NLP, LLM fine-tuning, and enterprise AI integrations. Led teams of 4-8 engineers at Series B and enterprise companies.

EXPERIENCE

Senior ML Engineer — DataBridge AI (2023–Present)
• Led development of document processing pipeline handling 2M+ documents/month
• Fine-tuned LLaMA models for domain-specific classification (92% accuracy)
• Reduced inference costs 60% through model distillation and caching strategies
• Managed team of 5 ML engineers across two time zones

ML Engineer — Stripe (2021–2023)
• Built fraud detection models processing $50B+ in annual transactions
• Developed real-time feature pipeline using Kafka and Flink
• Improved model precision from 87% to 94% while reducing false positives 40%

EDUCATION
M.S. Computer Science (ML Specialization) — Stanford University, 2020
B.S. Mathematics & Computer Science — UC Berkeley, 2018

SKILLS
Python, PyTorch, TensorFlow, Kubernetes, AWS, LLM fine-tuning, RAG, MLOps`,
  },
];

// ── Shared UI ────────────────────────────────────────────────────────────────

const urgencyColors: Record<string, { bg: string; border: string; text: string }> = {
  low: { bg: "#00D4FF10", border: "#00D4FF40", text: "#00D4FF" },
  medium: { bg: "#F59E0B10", border: "#F59E0B40", text: "#F59E0B" },
  high: { bg: "#EF444410", border: "#EF444440", text: "#EF4444" },
  critical: { bg: "#EF444420", border: "#EF4444", text: "#FF6B6B" },
};

function Badge({ label, color = "#00D4FF" }: { label: string; color?: string }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
}

function ResultCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-5 rounded-xl mt-4"
      style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}
    >
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-slate-400">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-sm">Analyzing with Claude...</span>
    </div>
  );
}

// ── Demo A: Invoice Processing ────────────────────────────────────────────────

const SAMPLE_INVOICE = `INVOICE #INV-2026-0447

Vendor: Apex Software Solutions
123 Business Park, Chicago IL 60601
ap@apexsoftware.com

Bill To: Tioga AI Inc., San Francisco CA
Date: February 15, 2026
Due: March 17, 2026
PO Number: PO-4821

Line Items:
  Enterprise License (Annual)     $24,000.00
  Implementation Services (40h)    $8,000.00
  Premium Support Package          $3,600.00
  ──────────────────────────────────────────
  Subtotal                        $35,600.00
  Tax (8.5%)                       $3,026.00
  ──────────────────────────────────────────
  TOTAL DUE                       $38,626.00

Payment: Wire transfer to routing 021000021, account 7734920011`;

interface InvoiceData {
  vendor: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  lineItems: Array<{ description: string; amount: string }>;
  subtotal: string;
  tax: string;
  total: string;
  paymentInstructions: string;
  confidence: number;
}

function InvoiceDemo() {
  const [input, setInput] = useState(SAMPLE_INVOICE);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [data, setData] = useState<InvoiceData | null>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/invoice-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.result);
      setState("done");
    } catch (e: unknown) {
      setError((e as Error).message ?? "Analysis failed.");
      setState("error");
    }
  };

  return (
    <div>
      <p className="text-sm text-slate-400 mb-4">
        Upload an invoice file or paste text below. Claude will extract all structured fields instantly.
      </p>
      <FileUpload onTextExtracted={(text, name) => { setInput(text); setState("idle"); setData(null); console.log("Loaded:", name); }} />
      <p className="text-xs text-slate-600 text-center mb-2">— or paste text directly —</p>
      <textarea
        value={input}
        onChange={(e) => { setInput(e.target.value); setState("idle"); setData(null); }}
        rows={10}
        className="w-full px-4 py-3 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none resize-none font-mono"
        style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}
        placeholder="Paste invoice text here..."
      />
      <button
        onClick={analyze}
        disabled={state === "loading" || !input.trim()}
        className="mt-3 w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
      >
        {state === "loading" ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Extracting...
          </>
        ) : "Extract Invoice Data"}
      </button>

      {state === "error" && <p className="text-red-400 text-sm mt-2">{error}</p>}

      {state === "done" && data && (
        <ResultCard>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Extracted Data</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 rounded-full overflow-hidden" style={{ background: "#1E2D4A" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${data.confidence}%`, background: "linear-gradient(90deg, #00D4FF, #0066CC)" }}
                />
              </div>
              <span className="text-xs text-slate-400">{data.confidence}% confidence</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Vendor", value: data.vendor },
              { label: "Invoice #", value: data.invoiceNumber },
              { label: "Invoice Date", value: data.invoiceDate },
              { label: "Due Date", value: data.dueDate },
              { label: "PO Number", value: data.poNumber },
              { label: "Total Due", value: data.total },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-slate-500 mb-0.5">{f.label}</p>
                <p className="text-sm font-medium text-white">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 mb-3" style={{ borderColor: "#1E2D4A" }}>
            <p className="text-xs text-slate-500 mb-2">Line Items</p>
            <div className="space-y-1">
              {data.lineItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-300">{item.description}</span>
                  <span className="text-white font-medium font-mono">{item.amount}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between text-sm font-semibold" style={{ borderColor: "#1E2D4A" }}>
                <span style={{ color: "#00D4FF" }}>Total Due</span>
                <span className="text-white font-mono">{data.total}</span>
              </div>
            </div>
          </div>

          <div style={{ background: "#00D4FF08", border: "1px solid #00D4FF20", borderRadius: 8, padding: "10px 12px" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "#00D4FF" }}>→ Ready to route to AP team</p>
            <p className="text-xs text-slate-400">{data.paymentInstructions}</p>
          </div>
        </ResultCard>
      )}
    </div>
  );
}

// ── Demo B: Email Triage ──────────────────────────────────────────────────────

function EmailTriageDemo() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<EmailResult | null>(null);
  const [error, setError] = useState("");

  const analyze = async (text: string) => {
    setInput(text);
    setState("loading");
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/demo-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json.result);
      setState("done");
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed");
      setState("error");
    }
  };

  const colors = result ? urgencyColors[result.urgency] ?? urgencyColors.low : urgencyColors.low;

  return (
    <div>
      <p className="text-sm text-slate-400 mb-3">
        Upload an email file, pick a sample, or paste your own. Claude will classify, route, and draft a reply.
      </p>
      <FileUpload onTextExtracted={(text) => analyze(text)} />
      <p className="text-xs text-slate-600 text-center mb-2">— or pick a sample —</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {SAMPLE_EMAILS.map((s) => (
          <button
            key={s.label}
            onClick={() => analyze(s.text)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:border-slate-500"
            style={{ background: "#0A0F1C", border: "1px solid #1E2D4A", color: "#94a3b8" }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => { setInput(e.target.value); setState("idle"); setResult(null); }}
        rows={8}
        className="w-full px-4 py-3 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none resize-none"
        style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}
        placeholder="Or paste an email here..."
      />
      <button
        onClick={() => analyze(input)}
        disabled={state === "loading" || !input.trim()}
        className="mt-3 w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
      >
        {state === "loading" ? (
          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Analyzing...</>
        ) : "Triage Email"}
      </button>

      {state === "error" && <p className="text-red-400 text-sm mt-2">{error}</p>}

      {state === "loading" && <Spinner />}

      {state === "done" && result && (
        <ResultCard>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Category</p>
              <Badge label={result.category} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Urgency</p>
              <Badge label={result.urgency.toUpperCase()} color={colors.text} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Sentiment</p>
              <p className="text-sm text-white capitalize">{result.sentiment}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Route To</p>
              <p className="text-sm text-white font-medium">{result.routeTo}</p>
            </div>
          </div>

          <div className="border-t pt-3 mb-3" style={{ borderColor: "#1E2D4A" }}>
            <p className="text-xs text-slate-500 mb-1">Summary</p>
            <p className="text-sm text-slate-300">{result.summary}</p>
          </div>

          {result.keyEntities.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-2">Key Entities</p>
              <div className="flex flex-wrap gap-1.5">
                {result.keyEntities.map((e) => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded-md" style={{ background: "#1E2D4A", color: "#94a3b8" }}>{e}</span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-3" style={{ borderColor: "#1E2D4A" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "#00D4FF" }}>✦ Draft Reply</p>
            <p className="text-sm text-slate-300 leading-relaxed italic">&ldquo;{result.suggestedReply}&rdquo;</p>
          </div>
        </ResultCard>
      )}
    </div>
  );
}

// ── Demo C: Document Classification ──────────────────────────────────────────

function DocumentDemo() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<DocResult | null>(null);
  const [error, setError] = useState("");

  const analyze = async (text: string) => {
    setInput(text);
    setState("loading");
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/demo-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json.result);
      setState("done");
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed");
      setState("error");
    }
  };

  return (
    <div>
      <p className="text-sm text-slate-400 mb-3">
        Upload a document, pick a sample, or paste text. Claude will classify, extract entities, and recommend actions.
      </p>
      <FileUpload onTextExtracted={(text) => analyze(text)} />
      <p className="text-xs text-slate-600 text-center mb-2">— or pick a sample —</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {SAMPLE_DOCS.map((s) => (
          <button
            key={s.label}
            onClick={() => analyze(s.text)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:border-slate-500"
            style={{ background: "#0A0F1C", border: "1px solid #1E2D4A", color: "#94a3b8" }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => { setInput(e.target.value); setState("idle"); setResult(null); }}
        rows={8}
        className="w-full px-4 py-3 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none resize-none"
        style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}
        placeholder="Or paste document text here..."
      />
      <button
        onClick={() => analyze(input)}
        disabled={state === "loading" || !input.trim()}
        className="mt-3 w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
      >
        {state === "loading" ? (
          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Classifying...</>
        ) : "Classify Document"}
      </button>

      {state === "error" && <p className="text-red-400 text-sm mt-2">{error}</p>}

      {state === "loading" && <Spinner />}

      {state === "done" && result && (
        <ResultCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Document Type</p>
              <p className="text-lg font-bold text-white">{result.documentType}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Confidence</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: "#1E2D4A" }}>
                  <div className="h-full rounded-full" style={{ width: `${result.confidence}%`, background: "linear-gradient(90deg, #00D4FF, #0066CC)" }} />
                </div>
                <span className="text-sm font-mono text-white">{result.confidence}%</span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs text-slate-500 mb-1">Summary</p>
            <p className="text-sm text-slate-300">{result.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {Object.entries(result.keyEntities).map(([type, items]) =>
              items.length > 0 ? (
                <div key={type}>
                  <p className="text-xs text-slate-500 mb-1 capitalize">{type}</p>
                  <div className="flex flex-wrap gap-1">
                    {items.map((item: string) => (
                      <span key={item} className="text-xs px-2 py-0.5 rounded-md" style={{ background: "#1E2D4A", color: "#94a3b8" }}>{item}</span>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>

          <div className="border-t pt-3 mb-3" style={{ borderColor: "#1E2D4A" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "#00D4FF" }}>Suggested Actions</p>
            <ul className="space-y-1">
              {result.suggestedActions.map((a, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span style={{ color: "#00D4FF" }}>→</span> {a}
                </li>
              ))}
            </ul>
          </div>

          {result.riskFlags.length > 0 && (
            <div className="rounded-lg p-3" style={{ background: "#EF444410", border: "1px solid #EF444430" }}>
              <p className="text-xs font-medium mb-1 text-red-400">⚠ Risk Flags</p>
              {result.riskFlags.map((f, i) => (
                <p key={i} className="text-sm text-red-300">{f}</p>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Owner Department</span>
            <Badge label={result.department} />
          </div>
        </ResultCard>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const DEMOS = [
  {
    id: "invoice",
    icon: "📄",
    title: "Invoice Processing",
    subtitle: "Extract structured data from any invoice",
    component: <InvoiceDemo />,
  },
  {
    id: "email",
    icon: "📧",
    title: "Email Triage",
    subtitle: "Classify, route & draft replies automatically",
    component: <EmailTriageDemo />,
  },
  {
    id: "document",
    icon: "🗂",
    title: "Document Classification",
    subtitle: "Identify, extract & act on any document",
    component: <DocumentDemo />,
  },
];

export default function DemosPage() {
  const [active, setActive] = useState("invoice");

  const activeDemo = DEMOS.find((d) => d.id === active)!;

  return (
    <main className="min-h-screen text-slate-200" style={{ background: "#0A0F1C" }}>
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(10,15,28,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1E2D4A" }}
      >
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}>T</div>
          <span className="font-semibold text-white text-lg tracking-tight">tioga.ai</span>
        </a>
        <a href="/#contact" className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}>
          Work With Us
        </a>
      </nav>

      <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "#00D4FF" }}
          >
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
            Live AI Demos — Powered by Claude
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">See Our AI In Action</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            These are real AI features — the same capabilities we build into enterprise systems.
            Try them with your own data.
          </p>
        </div>

        {/* Demo selector */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {DEMOS.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActive(demo.id)}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background: active === demo.id ? "#0D1526" : "transparent",
                border: `1px solid ${active === demo.id ? "#00D4FF40" : "#1E2D4A"}`,
                boxShadow: active === demo.id ? "0 0 20px #00D4FF10" : "none",
              }}
            >
              <div className="text-2xl mb-2">{demo.icon}</div>
              <p className="text-sm font-semibold text-white">{demo.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{demo.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Active demo */}
        <div
          className="p-6 rounded-2xl"
          style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">{activeDemo.icon}</span>
            <div>
              <h2 className="font-semibold text-white">{activeDemo.title}</h2>
              <p className="text-sm text-slate-400">{activeDemo.subtitle}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
          </div>
          {activeDemo.component}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 mb-4">Want these capabilities in your enterprise systems?</p>
          <a
            href="/#contact"
            className="inline-flex px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            Let&apos;s Build Together
          </a>
        </div>
      </div>
    </main>
  );
}
