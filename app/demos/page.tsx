"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import { DemoActivityProvider, useSetDemoActivity } from "./_lib/demo-activity-context";
import DemoParticleCanvasLoader from "./_lib/DemoParticleCanvasLoader";

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
  low: { bg: "#C8340610", border: "#C8340640", text: "var(--accent)" },
  medium: { bg: "#F59E0B10", border: "#F59E0B40", text: "var(--warning)" },
  high: { bg: "#EF444410", border: "#EF444440", text: "var(--error)" },
  critical: { bg: "#EF444420", border: "var(--error)", text: "var(--error-light)" },
};

function Badge({ label, color = "var(--accent)" }: { label: string; color?: string }) {
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
      style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
    >
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-[var(--text-muted)]">
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
  const setDemoActivity = useSetDemoActivity();

  const analyze = async () => {
    setState("loading");
    setError("");
    setDemoActivity({ status: "pending", confidence: null });
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
      setDemoActivity({ status: "done", confidence: json.result?.confidence ?? null });
    } catch (e: unknown) {
      setError((e as Error).message ?? "Analysis failed.");
      setState("error");
      setDemoActivity({ status: "error", confidence: null });
    }
  };

  return (
    <div>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Upload an invoice file or paste text below. Claude will extract all structured fields instantly.
      </p>
      <FileUpload onTextExtracted={(text, name) => { setInput(text); setState("idle"); setData(null); console.log("Loaded:", name); }} />
      <p className="text-xs text-[var(--text-muted)] text-center mb-2">— or paste text directly —</p>
      <textarea
        value={input}
        onChange={(e) => { setInput(e.target.value); setState("idle"); setData(null); }}
        rows={10}
        className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-muted)] placeholder-slate-600 outline-none resize-none font-mono"
        style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
        placeholder="Paste invoice text here..."
      />
      <button
        onClick={analyze}
        disabled={state === "loading" || !input.trim()}
        className="mt-3 w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
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
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Extracted Data</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${data.confidence}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-dark))" }}
                />
              </div>
              <span className="text-xs text-[var(--text-muted)]">{data.confidence}% confidence</span>
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
                <p className="text-xs text-[var(--text-muted)] mb-0.5">{f.label}</p>
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{f.value}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 mb-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs text-[var(--text-muted)] mb-2">Line Items</p>
            <div className="space-y-1">
              {data.lineItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{item.description}</span>
                  <span className="font-medium font-mono" style={{ color: "var(--text)" }}>{item.amount}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between text-sm font-semibold" style={{ borderColor: "var(--border)" }}>
                <span style={{ color: "var(--accent)" }}>Total Due</span>
                <span className="font-mono" style={{ color: "var(--text)" }}>{data.total}</span>
              </div>
            </div>
          </div>

          <div style={{ background: "#C8340608", border: "1px solid #C8340620", borderRadius: 8, padding: "10px 12px" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--accent)" }}>→ Ready to route to AP team</p>
            <p className="text-xs text-[var(--text-muted)]">{data.paymentInstructions}</p>
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
  const setDemoActivity = useSetDemoActivity();

  const analyze = async (text: string) => {
    setInput(text);
    setState("loading");
    setResult(null);
    setError("");
    setDemoActivity({ status: "pending", confidence: null });
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
      // EmailResult carries no confidence field -- pass null, not a
      // guessed number, per demo-activity-context.tsx's honesty rule.
      setDemoActivity({ status: "done", confidence: null });
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed");
      setState("error");
      setDemoActivity({ status: "error", confidence: null });
    }
  };

  const colors = result ? urgencyColors[result.urgency] ?? urgencyColors.low : urgencyColors.low;

  return (
    <div>
      <p className="text-sm text-[var(--text-muted)] mb-3">
        Upload an email file, pick a sample, or paste your own. Claude will classify, route, and draft a reply.
      </p>
      <FileUpload onTextExtracted={(text) => analyze(text)} />
      <p className="text-xs text-[var(--text-muted)] text-center mb-2">— or pick a sample —</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {SAMPLE_EMAILS.map((s) => (
          <button
            key={s.label}
            onClick={() => analyze(s.text)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:border-slate-500"
            style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => { setInput(e.target.value); setState("idle"); setResult(null); }}
        rows={8}
        className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-muted)] placeholder-slate-600 outline-none resize-none"
        style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
        placeholder="Or paste an email here..."
      />
      <button
        onClick={() => analyze(input)}
        disabled={state === "loading" || !input.trim()}
        className="mt-3 w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
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
              <p className="text-xs text-[var(--text-muted)] mb-1">Category</p>
              <Badge label={result.category} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Urgency</p>
              <Badge label={result.urgency.toUpperCase()} color={colors.text} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Sentiment</p>
              <p className="text-sm capitalize" style={{ color: "var(--text)" }}>{result.sentiment}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Route To</p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{result.routeTo}</p>
            </div>
          </div>

          <div className="border-t pt-3 mb-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs text-[var(--text-muted)] mb-1">Summary</p>
            <p className="text-sm text-[var(--text-muted)]">{result.summary}</p>
          </div>

          {result.keyEntities.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-[var(--text-muted)] mb-2">Key Entities</p>
              <div className="flex flex-wrap gap-1.5">
                {result.keyEntities.map((e) => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--border)", color: "var(--text-muted)" }}>{e}</span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--accent)" }}>✦ Draft Reply</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed italic">&ldquo;{result.suggestedReply}&rdquo;</p>
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
  const setDemoActivity = useSetDemoActivity();

  const analyze = async (text: string) => {
    setInput(text);
    setState("loading");
    setResult(null);
    setError("");
    setDemoActivity({ status: "pending", confidence: null });
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
      setDemoActivity({ status: "done", confidence: json.result?.confidence ?? null });
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed");
      setState("error");
      setDemoActivity({ status: "error", confidence: null });
    }
  };

  return (
    <div>
      <p className="text-sm text-[var(--text-muted)] mb-3">
        Upload a document, pick a sample, or paste text. Claude will classify, extract entities, and recommend actions.
      </p>
      <FileUpload onTextExtracted={(text) => analyze(text)} />
      <p className="text-xs text-[var(--text-muted)] text-center mb-2">— or pick a sample —</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {SAMPLE_DOCS.map((s) => (
          <button
            key={s.label}
            onClick={() => analyze(s.text)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:border-slate-500"
            style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => { setInput(e.target.value); setState("idle"); setResult(null); }}
        rows={8}
        className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-muted)] placeholder-slate-600 outline-none resize-none"
        style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
        placeholder="Or paste document text here..."
      />
      <button
        onClick={() => analyze(input)}
        disabled={state === "loading" || !input.trim()}
        className="mt-3 w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
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
              <p className="text-xs text-[var(--text-muted)] mb-1">Document Type</p>
              <p className="text-lg font-bold" style={{ color: "var(--text)" }}>{result.documentType}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-muted)] mb-1">Confidence</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full" style={{ width: `${result.confidence}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-dark))" }} />
                </div>
                <span className="text-sm font-mono" style={{ color: "var(--text)" }}>{result.confidence}%</span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs text-[var(--text-muted)] mb-1">Summary</p>
            <p className="text-sm text-[var(--text-muted)]">{result.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {Object.entries(result.keyEntities).map(([type, items]) =>
              items.length > 0 ? (
                <div key={type}>
                  <p className="text-xs text-[var(--text-muted)] mb-1 capitalize">{type}</p>
                  <div className="flex flex-wrap gap-1">
                    {items.map((item: string) => (
                      <span key={item} className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--border)", color: "var(--text-muted)" }}>{item}</span>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>

          <div className="border-t pt-3 mb-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--accent)" }}>Suggested Actions</p>
            <ul className="space-y-1">
              {result.suggestedActions.map((a, i) => (
                <li key={i} className="text-sm text-[var(--text-muted)] flex gap-2">
                  <span style={{ color: "var(--accent)" }}>→</span> {a}
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
            <span className="text-xs text-[var(--text-muted)]">Owner Department</span>
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
    engineeringHref: "/engineering/invoice-processing",
  },
  {
    id: "email",
    icon: "📧",
    title: "Email Triage",
    subtitle: "Classify, route & draft replies automatically",
    component: <EmailTriageDemo />,
    engineeringHref: "/engineering/email-triage",
  },
  {
    id: "document",
    icon: "🗂",
    title: "Document Classification",
    subtitle: "Identify, extract & act on any document",
    component: <DocumentDemo />,
  },
];

function DemosPageInner() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = DEMOS.some((d) => d.id === tabParam) ? (tabParam as string) : "invoice";
  const [active, setActive] = useState(initialTab);

  const activeDemo = DEMOS.find((d) => d.id === active)!;

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>

      <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent)" }}
          >
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
            Live AI Demos — Powered by Claude
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--text)" }}>See Our AI In Action</h1>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto mb-3">
            These run on real infrastructure — the same governance controls we deploy for clients, not a sandbox.
            Try them with your own data.
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-xl mx-auto">
            Files and text you submit here are sent to Claude to generate the result shown and are not stored by Tioga AI or used to train any model. See our{" "}
            <Link href="/privacy" className="underline hover:text-[var(--text)] transition-colors">Privacy Policy →</Link>
          </p>
        </div>

        {/* Featured: Migration Assessment */}
        <Link
          href="/demos/migration-assessment"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-2 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <ellipse cx="7" cy="6" rx="4" ry="2" />
              <path d="M3 6v6c0 1.1 1.8 2 4 2s4-.9 4-2V6" />
              <path strokeLinecap="round" d="M13.5 12H18m0 0l-2.5-2.5M18 12l-2.5 2.5" />
              <ellipse cx="17" cy="18" rx="4" ry="2" transform="translate(0 -2)" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>Migration Assessment</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent)" }}
              >
                Flagship
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Get a sample EBS → SAP migration readiness assessment in 60 seconds.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            Try it live →
          </span>
        </Link>
        <div className="text-right mb-8">
          <Link href="/engineering/migration-assessment" className="text-xs hover:text-[var(--text)] transition-colors" style={{ color: "var(--accent)" }}>
            How we built this →
          </Link>
        </div>

        {/* Featured: Governance Ledger */}
        <Link
          href="/demos/governance-ledger"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-8 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>Governance Ledger</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#4ADE8015", border: "1px solid #4ADE8040", color: "var(--success)" }}
              >
                Real Data
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Every AI call our own infrastructure makes — logged, costed, budget-capped, and
              mapped to NIST AI RMF. Not a mockup.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            View the ledger →
          </span>
        </Link>

        {/* Featured: Standing Watch */}
        <Link
          href="/demos/standing-watch"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-8 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>Standing Watch</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#4ADE8015", border: "1px solid #4ADE8040", color: "var(--success)" }}
              >
                Real Data
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Real, dated excerpts from Tioga&apos;s own router-watch and security-watch
              automations — a propose-only finding, and a same-day fix sequence that knows what
              it can&apos;t safely do itself.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            View the findings →
          </span>
        </Link>

        {/* Featured: Automation Oversight */}
        <Link
          href="/demos/automation-oversight"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-8 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0H9v0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>Automation Oversight</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#4ADE8015", border: "1px solid #4ADE8040", color: "var(--success)" }}
              >
                Real Data
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              The ongoing propose-and-approve record across Tioga&apos;s whole automation estate —
              what a daily review found, and what a human approved before anything changed.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            View the record →
          </span>
        </Link>

        {/* Featured: AP Exception Workflow */}
        <Link
          href="/demos/ap-exception-workflow"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-8 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>Governed AP Exception Workflow</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent)" }}
              >
                Interactive
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Propose a fix to an invoice that failed three-way match — watch it auto-execute,
              escalate, get blocked, or roll back through a governed write-path.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            Try it live →
          </span>
        </Link>

        {/* Featured: Capital Equipment Order Booking */}
        <Link
          href="/demos/capital-equipment-order"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-8 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>Governed Capital Equipment Order Booking</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent)" }}
              >
                Interactive
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Book a sales order against a placeholder material before the final configuration is
              known — a real SAP fit-gap pattern from configure-to-order capital equipment sales.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            Try it live →
          </span>
        </Link>

        {/* Featured: Field Service Billable Classification */}
        <Link
          href="/demos/field-service-classification"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-8 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15h5.5L21 8.5a1.5 1.5 0 00-3-3L11.5 12v3.5z" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>Governed Field Service Billable Classification</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent)" }}
              >
                Interactive
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Classify a completed field-service call as contract-covered or billable T&amp;M — a
              governance shape about interpretation risk, not a dollar threshold.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            Try it live →
          </span>
        </Link>

        {/* Featured: ERP Reporting Copilot */}
        <Link
          href="/demos/erp-reporting-copilot"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-8 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19a8 8 0 100-16 8 8 0 000 16zm8 2l-4.35-4.35" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>ERP Reporting Copilot</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent)" }}
              >
                Interactive
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Ask a plain-English question about expiring quotes, pricing changes, or aging
              quotations — watch it decompose into SAP-style tables and reporting gaps standard
              SAP leaves to a custom query.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            Try it live →
          </span>
        </Link>

        {/* Featured: Agent Autonomy Tier Mapper */}
        <Link
          href="/demos/agent-autonomy-mapper"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-8 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M3 9h6m0 0l7-6m-7 6l7 6M15 3v18m0-6h6m-6 0l-6-6m6 6l-6 6" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>Agent Autonomy Tier Mapper</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent)" }}
              >
                Interactive
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Map an AI-agent use case to Gartner&apos;s four-tier autonomy framework and see how it lines
              up with Tioga&apos;s own Safe/Ask-first/Never governance tiers — independently arrived at,
              not copied from each other.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            Try it live →
          </span>
        </Link>

        {/* Featured: SAP Joule Capability Gate Map */}
        <Link
          href="/demos/joule-capability-gate-map"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-8 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>SAP Joule Capability Gate Map</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent)" }}
              >
                Interactive
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              SAP says 200+ agents automate your business. See what&apos;s actually
              documented to write versus view-and-hand-off, by area — plus one real
              worked example of the gates a capability sits behind.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            Try it live →
          </span>
        </Link>

        {/* Featured: Composed Evidence */}
        <Link
          href="/demos/composed-evidence"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-8 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h1m16 0h1" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>Composed Evidence</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent)" }}
              >
                Interactive
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              A universal AI assistant logs the conversation, an ERP&apos;s own execution agent logs the
              transaction — neither composes the other&apos;s half. Try answering a real audit question from
              each log alone, then see what only a composed record can prove.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            Try it live →
          </span>
        </Link>

        {/* Featured: Marble World-Generation Audit */}
        <Link
          href="/demos/marble-world-audit"
          className="group flex items-center gap-5 p-6 rounded-2xl mb-8 transition-all hover:border-slate-500"
          style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
            border: "1px solid #C8340640",
            boxShadow: "0 0 30px #C834060A",
          }}
        >
          <span
            className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#C8340615", border: "1px solid #C8340630" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>Marble World-Generation Audit</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent)" }}
              >
                Real Trial Data
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              A vendor claims their AI-generated 3D world is commercially usable and dimensionally
              accurate. We ran the actual trial — real generations, a byte-level provenance scan, a real
              physical measurement — and found a real 19% scale error.
            </p>
          </div>
          <span className="flex-none text-sm font-medium hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
            Try it live →
          </span>
        </Link>

        {/* Demo selector */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {DEMOS.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActive(demo.id)}
              aria-pressed={active === demo.id}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background: active === demo.id ? "var(--bg-card)" : "transparent",
                border: `1px solid ${active === demo.id ? "#C8340640" : "var(--border)"}`,
                boxShadow: active === demo.id ? "0 0 20px #C8340610" : "none",
              }}
            >
              <div className="text-2xl mb-2">{demo.icon}</div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{demo.title}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{demo.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Active demo */}
        <div
          className="p-6 rounded-2xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">{activeDemo.icon}</span>
            <div>
              <h2 className="font-semibold" style={{ color: "var(--text)" }}>{activeDemo.title}</h2>
              <p className="text-sm text-[var(--text-muted)]">{activeDemo.subtitle}</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {activeDemo.engineeringHref && (
                <Link href={activeDemo.engineeringHref} className="text-xs hover:text-[var(--text)] transition-colors" style={{ color: "var(--accent)" }}>
                  How we built this →
                </Link>
              )}
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-xs text-[var(--text-muted)]">Live</span>
              </div>
            </div>
          </div>
          {activeDemo.component}
        </div>

        {/* Live particle field -- reacts only to the real fetch state of
            whichever demo above is in flight/resolved; see
            _lib/demo-activity-context.tsx and _lib/DemoParticleField.tsx.
            Persistent across tab switches (mounted here, outside
            activeDemo.component), hidden on mobile/no-WebGL/reduced-motion
            -- the 2D result cards above already carry the same real data. */}
        <div className="mt-6">
          <DemoParticleCanvasLoader />
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-[var(--text-muted)] mb-4">Want these capabilities in your enterprise systems?</p>
          <Link
            href="/contact"
            className="inline-flex px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Let&apos;s Build Together
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function DemosPage() {
  return (
    <Suspense fallback={null}>
      <DemoActivityProvider>
        <DemosPageInner />
      </DemoActivityProvider>
    </Suspense>
  );
}
