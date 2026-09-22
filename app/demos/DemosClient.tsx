"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { tint } from "@/lib/tint";
import { scrollBehavior } from "@/lib/motion";
import FileUpload from "@/components/FileUpload";
import { DemoActivityProvider, useSetDemoActivity } from "./_lib/demo-activity-context";
import DemoParticleCanvasLoader from "./_lib/DemoParticleCanvasLoader";
import { EvidenceTierTag, EVIDENCE_TIERS, type EvidenceTier } from "./_lib/evidence-tier";

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
      style={{ background: tint(color, 8), color, border: `1px solid ${tint(color, 25)}` }}
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
        aria-label="Invoice text"
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

      <p role="status" aria-live="polite" className="sr-only">
        {state === "loading" ? "Analyzing…" : state === "done" ? "Result ready below." : ""}
      </p>
      {state === "error" && <p role="alert" className="text-[var(--error)] text-sm mt-2">{error}</p>}

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

          {data.confidence >= 40 && data.vendor !== "N/A" && data.total !== "N/A" ? (
            <div style={{ background: "#C8340608", border: "1px solid #C8340620", borderRadius: 8, padding: "10px 12px" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--accent-on-tint)" }}>→ Ready to route to AP team</p>
              <p className="text-xs text-[var(--text-muted)]">{data.paymentInstructions}</p>
            </div>
          ) : (
            <div style={{ background: "#A8681E10", border: "1px solid #A8681E30", borderRadius: 8, padding: "10px 12px" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--warning)" }}>⚠ Not recognized as an invoice — needs manual review</p>
              <p className="text-xs text-[var(--text-muted)]">Required fields are missing or the input doesn&apos;t match invoice structure. Nothing was routed.</p>
            </div>
          )}
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
        aria-label="Email text"
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

      <p role="status" aria-live="polite" className="sr-only">
        {state === "loading" ? "Analyzing…" : state === "done" ? "Result ready below." : ""}
      </p>
      {state === "error" && <p role="alert" className="text-[var(--error)] text-sm mt-2">{error}</p>}

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
        aria-label="Document text"
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

      <p role="status" aria-live="polite" className="sr-only">
        {state === "loading" ? "Analyzing…" : state === "done" ? "Result ready below." : ""}
      </p>
      {state === "error" && <p role="alert" className="text-[var(--error)] text-sm mt-2">{error}</p>}

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
              <p className="text-xs font-medium mb-1 text-[var(--error)]">⚠ Risk Flags</p>
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

// ── Featured-demo cards ──────────────────────────────────────────────────────
// 2026-09-22 design pass (v1): replaced a stack of full-width horizontal rows
// with a real card grid -- see design.md's "Card container" pattern.
//
// 2026-09-22 revision (v2), after an independent Astra/gpt-6-astra critique
// (full text quoted in this change's PR description): 17 undifferentiated
// cards left visitors unsure where to start, and the old badge slot
// (Flagship/Real Data/Interactive/Free·5min) mixed four incompatible signal
// types -- priority, data-type, interaction-type, and cost -- into one pill.
// Fix, per Sukir's decision on the critique:
//   1. A "Start Here" section (4 cards Sukir picked) now carries the
//      priority signal via placement/heading, not a "Flagship" pill.
//   2. The badge is now exactly one signal -- the demo's real evidence type,
//      reusing the same four-way EvidenceTier classification already shown
//      on every individual demo page (see ./_lib/evidence-tier.tsx) instead
//      of ad hoc per-card wording. Tint follows the one meaningful
//      distinction visitors care about: dated, real internal evidence
//      (success/green) vs. everything else (accent).
//   3. The one demo with a genuine duration/cost note ("Free · 5 min", the
//      rules-based write-path check -- pre-existing copy, see its own
//      `badge` prop on app/demos/agent-write-path-exposure-check/page.tsx)
//      keeps that signal, but as separate small text next to its CTA, not
//      crammed into the evidence-type pill.
//   4. The remaining 13 cards are grouped under the site's own, already-
//      published five practice families (app/solutions/SolutionsHub.tsx's
//      `families` array/copy) rather than left as one flat 13-card block or
//      split into a new, invented taxonomy.

type BadgeTint = "accent" | "success";

const BADGE_STYLE: Record<BadgeTint, React.CSSProperties> = {
  accent: { background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent-on-tint)" },
  success: { background: "#4ADE8015", border: "1px solid #4ADE8040", color: "var(--success)" },
};

// The one meaningful color distinction for a visitor scanning the grid:
// dated, real evidence from Tioga's own infrastructure vs. every other
// evidence type (a live model call or a browser-only simulation).
function tintForTier(tier: EvidenceTier): BadgeTint {
  return tier === "internal-operational-excerpt" ? "success" : "accent";
}

interface FeaturedDemo {
  href: string;
  title: string;
  desc: string;
  cta: string;
  evidenceTier: EvidenceTier;
  icon: React.ReactNode;
  engineeringHref?: string;
  /** Secondary cost/duration signal -- only set where a demo genuinely has
   * one (see comment above); rendered separately from the evidence-type
   * badge, never merged into it. */
  note?: string;
}

const FUSION_READINESS: FeaturedDemo = {
  href: "/demos/fusion-ai-readiness-assessment",
  title: "Fusion Cloud AI-Readiness Assessment",
  desc: "Get a sample Oracle Fusion Cloud ERP AI-agent-readiness assessment in 60 seconds.",
  cta: "Try it live →",
  evidenceTier: "model-demonstration",
  engineeringHref: "/engineering/fusion-ai-readiness-assessment",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <ellipse cx="7" cy="6" rx="4" ry="2" />
      <path d="M3 6v6c0 1.1 1.8 2 4 2s4-.9 4-2V6" />
      <path strokeLinecap="round" d="M13.5 12H18m0 0l-2.5-2.5M18 12l-2.5 2.5" />
      <ellipse cx="17" cy="18" rx="4" ry="2" transform="translate(0 -2)" />
    </svg>
  ),
};

const GOVERNANCE_LEDGER: FeaturedDemo = {
  href: "/demos/governance-ledger",
  title: "Governance Ledger",
  desc: "Every AI call my own infrastructure makes — logged, costed, budget-capped, and mapped to NIST AI RMF. Not a mockup.",
  cta: "View the ledger →",
  evidenceTier: "internal-operational-excerpt",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
    </svg>
  ),
};

const STANDING_WATCH: FeaturedDemo = {
  href: "/demos/standing-watch",
  title: "Standing Watch",
  desc: "Real, dated excerpts from Tioga's own router-watch and security-watch automations — a propose-only finding, and a same-day fix sequence that knows what it can't safely do itself.",
  cta: "View the findings →",
  evidenceTier: "internal-operational-excerpt",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
};

const AUTOMATION_OVERSIGHT: FeaturedDemo = {
  href: "/demos/automation-oversight",
  title: "Automation Oversight",
  desc: "The ongoing propose-and-approve record across Tioga's whole automation estate — what a daily review found, and what a human approved before anything changed.",
  cta: "View the record →",
  evidenceTier: "internal-operational-excerpt",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0H9v0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
};

const AP_EXCEPTION_WORKFLOW: FeaturedDemo = {
  href: "/demos/ap-exception-workflow",
  title: "Governed AP Exception Workflow",
  desc: "Propose a fix to an invoice that failed three-way match — watch it auto-execute, escalate, get blocked, or roll back through a governed write-path.",
  cta: "Try it live →",
  evidenceTier: "browser-simulation",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
};

const QUICKBOOKS_BILL_APPROVAL: FeaturedDemo = {
  href: "/demos/quickbooks-bill-approval",
  title: "Governed QuickBooks Bill Approval",
  desc: "Propose a QuickBooks bill for approval — watch it get checked against vendor status and duplicate-bill history, then auto-execute, escalate, or get blocked through a governed write-path.",
  cta: "Try it live →",
  evidenceTier: "browser-simulation",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
};

const CAPITAL_EQUIPMENT_ORDER: FeaturedDemo = {
  href: "/demos/capital-equipment-order",
  title: "Governed Capital Equipment Order Booking",
  desc: "Book a sales order against a placeholder material before the final configuration is known — a real SAP fit-gap pattern from configure-to-order capital equipment sales.",
  cta: "Try it live →",
  evidenceTier: "browser-simulation",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
};

const FIELD_SERVICE_CLASSIFICATION: FeaturedDemo = {
  href: "/demos/field-service-classification",
  title: "Governed Field Service Billable Classification",
  desc: "Classify a completed field-service call as contract-covered or billable T&M — a governance shape about interpretation risk, not a dollar threshold.",
  cta: "Try it live →",
  evidenceTier: "browser-simulation",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15h5.5L21 8.5a1.5 1.5 0 00-3-3L11.5 12v3.5z" />
    </svg>
  ),
};

const ERP_REPORTING_COPILOT: FeaturedDemo = {
  href: "/demos/erp-reporting-copilot",
  title: "ERP Reporting Copilot",
  desc: "Ask a plain-English question about expiring quotes, pricing changes, or aging quotations — watch it decompose into SAP-style tables and reporting gaps standard SAP leaves to a custom query.",
  cta: "Try it live →",
  evidenceTier: "browser-simulation",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19a8 8 0 100-16 8 8 0 000 16zm8 2l-4.35-4.35" />
    </svg>
  ),
};

const AGENT_WRITE_PATH_EXPOSURE_CHECK: FeaturedDemo = {
  href: "/demos/agent-write-path-exposure-check",
  title: "Agent Write-Path Exposure Check",
  desc: "Twelve control points on one agent write into an ERP or CRM — identity, application-logic path, attribution, approval, verification, rollback, evidence. Scored for exposure, with unknowns kept separate from gaps. Runs in your browser.",
  cta: "Take the check →",
  evidenceTier: "browser-simulation",
  note: "Free · 5 min",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
};

const AGENT_AUTONOMY_MAPPER: FeaturedDemo = {
  href: "/demos/agent-autonomy-mapper",
  title: "Agent Autonomy Tier Mapper",
  desc: "Map an AI-agent use case to Gartner's four-tier autonomy framework and see how it lines up with Tioga's own Safe/Ask-first/Never governance tiers — independently arrived at, not copied from each other.",
  cta: "Try it live →",
  evidenceTier: "browser-simulation",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M3 9h6m0 0l7-6m-7 6l7 6M15 3v18m0-6h6m-6 0l-6-6m6 6l-6 6" />
    </svg>
  ),
};

const JOULE_CAPABILITY_GATE_MAP: FeaturedDemo = {
  href: "/demos/joule-capability-gate-map",
  title: "SAP Joule Capability Gate Map",
  desc: "SAP says 200+ agents automate your business. See what's actually documented to write versus view-and-hand-off, by area — plus one real worked example of the gates a capability sits behind.",
  cta: "Try it live →",
  evidenceTier: "browser-simulation",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  ),
};

const COMPOSED_EVIDENCE: FeaturedDemo = {
  href: "/demos/composed-evidence",
  title: "Composed Evidence",
  desc: "A universal AI assistant logs the conversation, an ERP's own execution agent logs the transaction — neither composes the other's half. Try answering a real audit question from each log alone, then see what only a composed record can prove.",
  cta: "Try it live →",
  evidenceTier: "browser-simulation",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h1m16 0h1" />
    </svg>
  ),
};

const MARBLE_WORLD_AUDIT: FeaturedDemo = {
  href: "/demos/marble-world-audit",
  title: "Marble World-Generation Audit",
  desc: "A vendor claims their AI-generated 3D world is commercially usable and dimensionally accurate. I ran the actual trial — real generations, a byte-level provenance scan, a real physical measurement — and found a real 19% scale error.",
  cta: "Try it live →",
  evidenceTier: "internal-operational-excerpt",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  ),
};

const CONTEXT_WINDOW_DATA_MINIMIZATION: FeaturedDemo = {
  href: "/demos/context-window-data-minimization",
  title: "Context-Window Data Minimization",
  desc: "The same HR question, answered two ways — a naive agent that pulls whole employee records into context, and a governed agent enforcing a field-level allowlist. See exactly which fields entered each agent's prompt.",
  cta: "Try it live →",
  evidenceTier: "browser-simulation",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v2" />
    </svg>
  ),
};

const TIMECARD_EXCEPTION_SHADOW_MODE: FeaturedDemo = {
  href: "/demos/timecard-exception-shadow-mode",
  title: "Timecard Exception Agent, Shadow-Mode",
  desc: "An agent proposes corrections for missed punches, unapproved overtime, and PTO requests — never auto-executing — citing the named payroll-cycle control and FLSA/state rule behind each one. See the how a simulated agreement rate moves against seeded reviewer decisions in a synthetic shadow-mode window.",
  cta: "Try it live →",
  evidenceTier: "browser-simulation",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const HEADCOUNT_FORECAST_DRAFT_PROVENANCE: FeaturedDemo = {
  href: "/demos/headcount-forecast-draft-provenance",
  title: "Headcount Forecast Draft, Per-Cell Provenance",
  desc: "An agent drafts headcount/comp/burden changes into a draft version only — never the locked budget — with every line tagged to its source data, its stated assumption, and whether it feeds a goodwill-impairment, going-concern, or deferred-tax forecast. A human reviewer approves or rejects each line before the diff is final.",
  cta: "Try it live →",
  evidenceTier: "browser-simulation",
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6M6 21h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

// Sukir's pick, in his stated order -- the four demos that show the most
// range in one pass: one live model call, two dated internal-evidence
// tools, and one governed write-path decision.
const START_HERE_DEMOS: FeaturedDemo[] = [
  STANDING_WATCH,
  GOVERNANCE_LEDGER,
  AP_EXCEPTION_WORKFLOW,
  FUSION_READINESS,
];

// The remaining 13, grouped under the site's own already-published five
// practice families (names/order copied verbatim from the `families` array
// in app/solutions/SolutionsHub.tsx -- not duplicated as an import, since
// that module also pulls in its own page-scoped stylesheet; kept as a
// literal string here with this comment as the sync note). Every remaining
// demo maps to a family that already names its exact workflow in that
// file's `purpose` text; nothing here is a new, invented category.
const EXPLORE_FAMILIES: { name: string; demos: FeaturedDemo[] }[] = [
  {
    name: "Finance & Purchasing Operations",
    demos: [QUICKBOOKS_BILL_APPROVAL, CAPITAL_EQUIPMENT_ORDER],
  },
  {
    name: "Service & Operational Workflows",
    demos: [FIELD_SERVICE_CLASSIFICATION, TIMECARD_EXCEPTION_SHADOW_MODE, HEADCOUNT_FORECAST_DRAFT_PROVENANCE],
  },
  {
    name: "Reporting & Business Information",
    demos: [ERP_REPORTING_COPILOT],
  },
  {
    name: "Systems Integration & Modernization",
    demos: [JOULE_CAPABILITY_GATE_MAP, AGENT_WRITE_PATH_EXPOSURE_CHECK],
  },
  {
    name: "AI Oversight & Governance",
    demos: [AUTOMATION_OVERSIGHT, AGENT_AUTONOMY_MAPPER, COMPOSED_EVIDENCE, CONTEXT_WINDOW_DATA_MINIMIZATION, MARBLE_WORLD_AUDIT],
  },
];

// Card is a plain <div> (not itself a Link) with a stretched, invisible
// full-card anchor as its first child. That anchor paints on top of the
// card's other in-flow content (per CSS stacking rules for a position:absolute,
// z-index:auto element vs. non-positioned siblings), making the whole card
// clickable without nesting a second <a> inside it. The one card with a
// secondary link ("How I built this") lifts that link into the same
// stacking bucket via `relative`, so it paints after -- on top of -- the
// stretched overlay and stays independently clickable.
function FeaturedDemoCard({ demo }: { demo: FeaturedDemo }) {
  return (
    <div
      className="relative flex flex-col p-6 rounded-2xl transition-all hover:border-slate-500"
      style={{
        background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)",
        border: "1px solid #C8340640",
        boxShadow: "0 0 30px #C834060A",
      }}
    >
      <Link href={demo.href} className="absolute inset-0 rounded-2xl" aria-label={demo.title} />
      <div className="flex items-start justify-between gap-3 mb-4">
        <span
          className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "#C8340615", border: "1px solid #C8340630" }}
        >
          {demo.icon}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide text-right"
          style={BADGE_STYLE[tintForTier(demo.evidenceTier)]}
        >
          {EVIDENCE_TIERS[demo.evidenceTier].label}
        </span>
      </div>
      <p className="font-semibold mb-1.5" style={{ color: "var(--text)" }}>{demo.title}</p>
      <p className="text-sm text-[var(--text-muted)] flex-1">{demo.desc}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>{demo.cta}</span>
        {demo.engineeringHref && (
          <Link
            href={demo.engineeringHref}
            className="relative text-xs hover:text-[var(--text)] transition-colors"
            style={{ color: "var(--accent)" }}
          >
            How I built this →
          </Link>
        )}
        {demo.note && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{demo.note}</span>
        )}
      </div>
    </div>
  );
}

function DemosPageInner() {
  // The ?tab= deep link is read from window.location in the mount effect
  // below rather than via useSearchParams(). useSearchParams() forced this
  // whole page to bail out of static prerendering to client-only rendering
  // (the Suspense fallback is null), so the server HTML held no page body:
  // the header/cards appeared only after hydration, pushing the footer down
  // (CLS 0.293 on mobile) and delaying LCP. Now the default ("invoice") tab
  // is prerendered, and a deep link switches tab once on mount.
  const [active, setActive] = useState("invoice");

  const activeDemo = DEMOS.find((d) => d.id === active)!;

  // A ?tab= deep link (e.g. the homepage's "Run it yourself" link into
  // /demos?tab=invoice) previously landed the visitor at the top of the
  // page with the selected tool's input ~2,800px down, past several
  // featured-demo cards. Scroll straight to it on arrival, once, only when
  // the tab actually came from the URL (not from clicking a tab locally).
  const activeDemoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tabParam = new URLSearchParams(window.location.search).get("tab");
    if (tabParam && DEMOS.some((d) => d.id === tabParam)) {
      setActive(tabParam);
      activeDemoRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    }
  }, []);

  return (
    <main id="main-content" className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>

      <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent-on-tint)" }}
          >
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
            Live AI Demos — Powered by Claude
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--text)" }}>See My AI In Action</h1>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto mb-3">
            Each demo below is labeled with its evidence type — a live model call on data you
            provide, a browser simulation, or a dated operational excerpt. Try the model
            demonstrations with your own data.
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-xl mx-auto">
            Files and text you submit here are sent to Claude to generate the result shown and are not stored by Tioga AI or used to train any model. See my{" "}
            <Link href="/privacy" className="underline hover:text-[var(--text)] transition-colors">Privacy Policy →</Link>
          </p>
          <div className="flex justify-center">
            <EvidenceTierTag
              tier="model-demonstration"
              detail="Claude processes the real file or text you submit below; the result is generated live, not pre-scripted."
            />
          </div>
        </div>

        {/* Start Here -- see START_HERE_DEMOS above. Priority is signaled by
            this section/heading, not by a per-card "Flagship" badge. */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-1.5" style={{ color: "var(--text)" }}>Start Here</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Four demos that show the range in one pass — a live model call, two dated internal-evidence
            excerpts, and a governed write-path decision.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {START_HERE_DEMOS.map((demo) => (
              <FeaturedDemoCard key={demo.href} demo={demo} />
            ))}
          </div>
        </div>

        {/* Explore more -- see EXPLORE_FAMILIES above (grouped by the same
            five practice families used on /solutions). */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-1.5" style={{ color: "var(--text)" }}>Explore More</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Thirteen more, grouped by practice area.
          </p>
          <div className="space-y-8">
            {EXPLORE_FAMILIES.map((family) => (
              <div key={family.name}>
                <h3
                  className="text-xs font-semibold uppercase tracking-wide mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  {family.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {family.demos.map((demo) => (
                    <FeaturedDemoCard key={demo.href} demo={demo} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo selector */}
        <div className="grid grid-cols-3 gap-3 mb-8" style={{ scrollMarginTop: "110px" }} ref={activeDemoRef}>
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
                  How I built this →
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

// No <Suspense> wrapper here on purpose: it existed only for useSearchParams()
// (removed above). Left in place, React outlines this ~30KB boundary out of
// the initial HTML and reveals it via a throttled $RC swap after first paint,
// so the footer painted first and then jumped down ~5,000px (the CLS).
export default function DemosClient() {
  return (
    <DemoActivityProvider>
      <DemosPageInner />
    </DemoActivityProvider>
  );
}
