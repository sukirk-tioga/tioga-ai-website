// Read-side query logic for the ERP reporting-copilot demo. This is
// deliberately NOT a governed write-path decision engine like the
// capital-equipment-order or ap-exception-workflow demos' policy.ts — a
// question here never proposes or commits a transaction, so it needs none
// of the auto/escalate/block machinery those demos build. What it does
// need, per the source finding, is to show *how* it's answering: which
// SAP-style objects it's conceptually reading, and where standard SAP
// reporting doesn't already ship the join being asked for (a custom query
// or enhancement, in the source material's own words). See
// ~/SecondBrain/TiogaAI/strategy/2026-08-18-sap-fitgap-notes-case-study-analysis.md,
// "A separate opportunity: read-side reporting gaps."
//
// Every answer below is computed from the illustrative SEED_QUOTES dataset
// in erp-data.ts, not hand-typed per question — real filter/sort logic
// running against canned, composite data, not a live SAP connection.

import { AS_OF_DATE, SEED_QUOTES, daysBetween, fmtDate, fmtUsd, type QuoteRecord } from "./erp-data";

export interface TraceStep {
  label: string;
  detail: string;
  sapRef?: string;
  // Marks a step where the trace is naming a real reporting gap: something
  // standard SAP transactions/reports don't join on their own, requiring a
  // custom query or enhancement — not a routine lookup.
  gap?: boolean;
}

export interface QueryAnswer {
  id: string;
  question: string;
  trace: TraceStep[];
  columns: string[];
  rows: string[][];
  summary: string;
}

export interface PresetQuestion {
  id: string;
  question: string;
  keywords: string[];
}

export const PRESET_QUESTIONS: PresetQuestion[] = [
  {
    id: "expiring-unconverted",
    question: "Which quotes expire in the next two weeks and haven't converted to an order?",
    keywords: ["expire", "expiring", "expires", "two week", "2 week", "convert", "unconverted"],
  },
  {
    id: "pricing-changes",
    question: "Show pricing changes on open quotes this month.",
    keywords: ["pricing", "price change", "price changes", "repriced", "this month"],
  },
  {
    id: "aging-quotes",
    question: "Which open quotes are aging past 30 days without a follow-up?",
    keywords: ["aging", "age", "30 days", "follow-up", "follow up", "stale"],
  },
];

// Simple keyword-overlap match against the three supported preset
// questions — enough to let a typed-in variant of a supported question
// still resolve, without pretending this demo can answer arbitrary
// free-form ERP questions against a real backend.
export function matchQuestion(input: string): string | null {
  const norm = input.trim().toLowerCase();
  if (!norm) return null;
  let best: { id: string; score: number } | null = null;
  for (const preset of PRESET_QUESTIONS) {
    const score = preset.keywords.filter((k) => norm.includes(k)).length;
    if (score > 0 && (!best || score > best.score)) best = { id: preset.id, score };
  }
  return best?.id ?? null;
}

const WINDOW_DAYS = 14;
const AGING_THRESHOLD_DAYS = 30;

function asOfMonth(): string {
  return AS_OF_DATE.slice(0, 7); // "YYYY-MM"
}

function buildExpiringUnconverted(): QueryAnswer {
  const matches = SEED_QUOTES
    .filter((q) => q.status === "open")
    .map((q) => ({ q, daysToExpiration: daysBetween(AS_OF_DATE, q.validUntil) }))
    .filter(({ daysToExpiration }) => daysToExpiration >= 0 && daysToExpiration <= WINDOW_DAYS)
    .sort((a, b) => a.daysToExpiration - b.daysToExpiration);

  const trace: TraceStep[] = [
    {
      label: "parse",
      detail: `Question maps to: entity = sales quotation, filters = [valid-to date within ${WINDOW_DAYS} days of ${fmtDate(AS_OF_DATE)}] AND [no linked sales order].`,
    },
    {
      label: "source objects",
      detail: "Quotation header/lines: doc type QT. Valid-to date is the quotation's binding date. Whether a quotation converted to an order lives in the sales-document flow, not on the quotation record itself.",
      sapRef: "VBAK / VBAP / VBFA",
    },
    {
      label: "reporting gap",
      detail: "Standard SD quotation lists don't ship a single view that joins \"expiring soon\" against \"not yet converted\" — this is exactly the kind of join the source fit-gap notes flag as needing a custom query or enhancement, not something standard SAP reporting covers out of the box.",
      gap: true,
    },
    {
      label: "filter",
      detail: `Keep quotations with status = open, valid-to date between ${fmtDate(AS_OF_DATE)} and ${fmtDate(addDaysIso(AS_OF_DATE, WINDOW_DAYS))}, and no downstream sales-order link.`,
    },
    { label: "sort", detail: "Ascending by days remaining, so the most time-sensitive quote surfaces first." },
    { label: "result", detail: `${matches.length} quotation(s) matched.` },
  ];

  return {
    id: "expiring-unconverted",
    question: PRESET_QUESTIONS[0].question,
    trace,
    columns: ["Quote #", "Customer", "Configuration", "Quoted Price", "Valid Until", "Days to Expiration", "Order Status"],
    rows: matches.map(({ q, daysToExpiration }) => [
      q.id,
      q.customer,
      q.configuration,
      fmtUsd(q.currentPrice),
      fmtDate(q.validUntil),
      `${daysToExpiration} day${daysToExpiration === 1 ? "" : "s"}`,
      "not converted",
    ]),
    summary: matches.length
      ? `${matches.length} open quotation(s) expire within the next ${WINDOW_DAYS} days and have no linked sales order, as of ${fmtDate(AS_OF_DATE)}.`
      : `No open, unconverted quotations expire within the next ${WINDOW_DAYS} days as of ${fmtDate(AS_OF_DATE)}.`,
  };
}

function buildPricingChanges(): QueryAnswer {
  const month = asOfMonth();
  type Row = { q: QuoteRecord; date: string; from: number; to: number; reason: string };
  const rows: Row[] = [];
  for (const q of SEED_QUOTES) {
    if (q.status !== "open") continue;
    for (const change of q.priceHistory) {
      if (change.date.slice(0, 7) === month) rows.push({ q, date: change.date, from: change.from, to: change.to, reason: change.reason });
    }
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));

  const trace: TraceStep[] = [
    {
      label: "parse",
      detail: `Question maps to: entity = pricing condition change, filters = [quotation status = open] AND [change date within ${fmtDate(`${month}-01`)} to ${fmtDate(AS_OF_DATE)}].`,
    },
    {
      label: "source objects",
      detail: "Quotation pricing lives in condition records attached to each quotation line, not on the quotation header — a price edit shows up as a new condition record, not a header field changing.",
      sapRef: "VBAP / condition records (KONV / PRCD_ELEMENTS)",
    },
    {
      label: "reporting gap",
      detail: "Standard condition-record reporting shows the current price, not a change history — reconstructing \"what changed this month\" requires tracking condition-record deltas over time, which the source notes call out as needing a custom query rather than a standard transaction.",
      gap: true,
    },
    { label: "filter", detail: `Keep only quotations with status = open, then keep only price-history entries whose change date falls in ${month}.` },
    { label: "sort", detail: "Ascending by change date." },
    { label: "result", detail: `${rows.length} price change(s) matched.` },
  ];

  return {
    id: "pricing-changes",
    question: PRESET_QUESTIONS[1].question,
    trace,
    columns: ["Quote #", "Customer", "Previous Price", "New Price", "Change", "Change Date", "Reason"],
    rows: rows.map((r) => [
      r.q.id,
      r.q.customer,
      fmtUsd(r.from),
      fmtUsd(r.to),
      `${r.to > r.from ? "+" : ""}${fmtUsd(r.to - r.from)}`,
      fmtDate(r.date),
      r.reason,
    ]),
    summary: rows.length
      ? `${rows.length} pricing change(s) recorded on open quotations this month.`
      : "No pricing changes recorded on open quotations this month.",
  };
}

function buildAgingQuotes(): QueryAnswer {
  const matches = SEED_QUOTES
    .filter((q) => q.status === "open")
    .map((q) => ({ q, daysOpen: daysBetween(q.quoteDate, AS_OF_DATE) }))
    .filter(({ q, daysOpen }) => daysOpen > AGING_THRESHOLD_DAYS && !q.lastFollowUp)
    .sort((a, b) => b.daysOpen - a.daysOpen);

  const trace: TraceStep[] = [
    {
      label: "parse",
      detail: `Question maps to: entity = sales quotation, filters = [status = open] AND [days since quote creation > ${AGING_THRESHOLD_DAYS}] AND [no logged follow-up].`,
    },
    {
      label: "source objects",
      detail: "Quotation creation date comes from the quotation header. Whether and when someone last followed up isn't a quotation field at all — it's a sales-activity/contact log, typically CRM-side or a custom Z-table, not native to the SD quotation object.",
      sapRef: "VBAK (ERDAT) + sales-activity log",
    },
    {
      label: "reporting gap",
      detail: "This is the clearest custom-query case of the three: \"days since creation\" and \"last follow-up logged\" live in two different systems of record, so a combined aging-without-follow-up view isn't something standard SAP quotation reporting produces on its own.",
      gap: true,
    },
    { label: "filter", detail: `Keep quotations with status = open, (${fmtDate(AS_OF_DATE)} − quote date) > ${AGING_THRESHOLD_DAYS} days, and no follow-up entry on record.` },
    { label: "sort", detail: "Descending by days open, so the longest-neglected quote surfaces first." },
    { label: "result", detail: `${matches.length} quotation(s) matched.` },
  ];

  return {
    id: "aging-quotes",
    question: PRESET_QUESTIONS[2].question,
    trace,
    columns: ["Quote #", "Customer", "Quote Date", "Days Open", "Last Follow-Up", "Status"],
    rows: matches.map(({ q, daysOpen }) => [q.id, q.customer, fmtDate(q.quoteDate), `${daysOpen} days`, "none recorded", "open"]),
    summary: matches.length
      ? `${matches.length} open quotation(s) have been open more than ${AGING_THRESHOLD_DAYS} days with no follow-up logged, as of ${fmtDate(AS_OF_DATE)}.`
      : `No open quotations are aging past ${AGING_THRESHOLD_DAYS} days without a follow-up as of ${fmtDate(AS_OF_DATE)}.`,
  };
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function answerQuery(id: string): QueryAnswer | null {
  switch (id) {
    case "expiring-unconverted":
      return buildExpiringUnconverted();
    case "pricing-changes":
      return buildPricingChanges();
    case "aging-quotes":
      return buildAgingQuotes();
    default:
      return null;
  }
}
