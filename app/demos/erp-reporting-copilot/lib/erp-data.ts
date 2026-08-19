// Illustrative composite quote/order dataset for the ERP reporting-copilot
// demo — a semiconductor capital-equipment manufacturer, same composite
// framing used by the capital-equipment-order and ap-exception-workflow
// demos. Not real client or company data; every quote, price, and date
// below is invented to be realistic for the industry. Grounded in the
// "read-side reporting gaps" finding from
// ~/SecondBrain/TiogaAI/strategy/2026-08-18-sap-fitgap-notes-case-study-analysis.md
// — standard SAP SD reporting doesn't ship a single view for questions like
// "which quotes expire soon and haven't converted," "what changed on open
// quotes' pricing this month," or "which quotes are aging without a
// follow-up" — each needs a query that joins fields standard transactions
// don't join on their own.

// Reference date this dataset is written "as of" — deliberately a fixed
// constant, not `Date.now()`, so every filter below (expiring-soon, aging,
// this-month pricing changes) produces the same illustrative result no
// matter when the demo is loaded or tested.
export const AS_OF_DATE = "2026-08-18";

export interface PriceChange {
  date: string; // ISO date the condition record changed
  from: number;
  to: number;
  reason: string;
}

export interface QuoteRecord {
  id: string; // conceptually a VBAK quotation document number (doc type QT)
  customer: string;
  configuration: string; // conceptually the VBAP line-item material/config text
  currentPrice: number;
  quoteDate: string; // ISO date — VBAK.ERDAT (creation date)
  validUntil: string; // ISO date — VBAK.BNDDT (quotation binding/valid-to date)
  status: "open" | "converted" | "expired";
  orderId?: string; // set once a VBFA document-flow link exists to a sales order
  lastFollowUp?: string; // ISO date of the last logged sales-activity touch, if any
  priceHistory: PriceChange[]; // condition-record (KONV/PRCD_ELEMENTS-style) changes
}

export const SEED_QUOTES: QuoteRecord[] = [
  {
    id: "QT-8801",
    customer: "Fab Customer H",
    configuration: "Etch system, 5-chamber config",
    currentPrice: 2380000,
    quoteDate: "2026-06-30",
    validUntil: "2026-08-30",
    status: "open",
    priceHistory: [],
  },
  {
    id: "QT-8802",
    customer: "Fab Customer I",
    configuration: "Deposition system, standard config",
    currentPrice: 3180000,
    quoteDate: "2026-07-25",
    validUntil: "2026-09-20",
    status: "open",
    lastFollowUp: "2026-08-12",
    priceHistory: [{ date: "2026-08-10", from: 3050000, to: 3180000, reason: "engineering added an RF power module to the configuration" }],
  },
  {
    id: "QT-8803",
    customer: "Fab Customer J",
    configuration: "Etch system, 3-chamber config",
    currentPrice: 1950000,
    quoteDate: "2026-05-01",
    validUntil: "2026-08-01",
    status: "expired",
    priceHistory: [],
  },
  {
    id: "QT-8804",
    customer: "Fab Customer K",
    configuration: "Metrology system",
    currentPrice: 890000,
    quoteDate: "2026-08-01",
    validUntil: "2026-08-25",
    status: "open",
    lastFollowUp: "2026-08-14",
    priceHistory: [],
  },
  {
    id: "QT-8805",
    customer: "Fab Customer L",
    configuration: "Deposition system, compact config",
    currentPrice: 1940000,
    quoteDate: "2026-07-10",
    validUntil: "2026-09-10",
    status: "open",
    priceHistory: [{ date: "2026-08-05", from: 1890000, to: 1940000, reason: "raw-material cost pass-through" }],
  },
  {
    id: "QT-8806",
    customer: "Fab Customer M",
    configuration: "Etch system, 5-chamber config",
    currentPrice: 2600000,
    quoteDate: "2026-07-01",
    validUntil: "2026-09-01",
    status: "converted",
    orderId: "SO-7742",
    lastFollowUp: "2026-07-20",
    priceHistory: [],
  },
  {
    id: "QT-8807",
    customer: "Fab Customer N",
    configuration: "Wafer-handling module upgrade",
    currentPrice: 410000,
    quoteDate: "2026-08-15",
    validUntil: "2026-09-01",
    status: "open",
    lastFollowUp: "2026-08-16",
    priceHistory: [],
  },
  {
    id: "QT-8808",
    customer: "Fab Customer H",
    configuration: "Chamber liner spares package",
    currentPrice: 210000,
    quoteDate: "2026-08-16",
    validUntil: "2026-10-15",
    status: "open",
    lastFollowUp: "2026-08-17",
    priceHistory: [],
  },
  {
    id: "QT-8809",
    customer: "Fab Customer O",
    configuration: "Etch system, 4-chamber config",
    currentPrice: 2150000,
    quoteDate: "2026-06-15",
    validUntil: "2026-08-20",
    status: "open",
    priceHistory: [{ date: "2026-07-28", from: 2050000, to: 2150000, reason: "customer requested an additional process chamber" }],
  },
  {
    id: "QT-8810",
    customer: "Fab Customer P",
    configuration: "Deposition system, standard config",
    currentPrice: 3400000,
    quoteDate: "2026-08-12",
    validUntil: "2026-11-12",
    status: "converted",
    orderId: "SO-7745",
    lastFollowUp: "2026-08-12",
    priceHistory: [],
  },
];

export function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00Z`).getTime();
  const to = new Date(`${toISO}T00:00:00Z`).getTime();
  return Math.round((to - from) / 86400000);
}

export function fmtUsd(n: number): string {
  return `$${n.toLocaleString()}`;
}

export function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
