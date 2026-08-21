// Deterministic, data-driven — not a model call. Same discipline as the
// Agent Autonomy Tier Mapper (app/demos/agent-autonomy-mapper/lib/tiers.ts):
// authored data extracted from a published, first-party source, rendered
// entirely in the browser, no server round-trip.
//
// Source: SAP's own Joule Capabilities Guide (help.sap.com), extracted and
// Fable-5-adversarially-verified 2026-08-17, re-verified live 2026-08-20.
// See ~/SecondBrain/TiogaAI/research/sap-oracle-core-ai-capabilities-2026-08-17.md
// §A1/§A2 for the full research and sourcing notes.
//
// HONESTY BOUNDARY (load-bearing — do not extend without re-verifying):
// the write-capable capability LIST below (§A1) is a verbatim TOC extraction
// covering all of SAP's own S/4HANA Cloud "Transactional Capabilities"
// pages — that part is a real inventory, not an example. The GATE DETAIL
// (scope item / business catalog / caps / confirmation) is verified this
// deeply for exactly ONE agent — Production Planning and Operations (§A2).
// An earlier draft of Tioga's own LinkedIn content overclaimed that every
// capability was gated this same specific way and was corrected after
// independent review found only one agent's gates were actually checked
// this closely (see strategy/2026-08-20-linkedin-sap-joule-capability-gap-drafts.md).
// Don't repeat that mistake here: this demo shows ONE real worked gate
// example, not a fabricated gate for every capability.

export type S4Area =
  | "finance_ap"
  | "cash"
  | "procurement"
  | "sales"
  | "supply_chain"
  | "manufacturing"
  | "service"
  | "master_data";

export interface AreaInfo {
  id: S4Area;
  label: string;
}

export const AREAS: AreaInfo[] = [
  { id: "finance_ap", label: "Finance / AP" },
  { id: "cash", label: "Cash" },
  { id: "procurement", label: "Procurement" },
  { id: "sales", label: "Sales" },
  { id: "supply_chain", label: "Supply Chain / Warehouse" },
  { id: "manufacturing", label: "Manufacturing" },
  { id: "service", label: "Service" },
  { id: "master_data", label: "Master Data" },
];

// Verbatim TOC entries, verified against help.sap.com's Joule Capabilities
// Guide "Transactional Capabilities" pages for S/4HANA Cloud Public Edition
// — the genuinely write-capable set, not the much larger
// Display/Search/Fetch/Show/Read/Summarize/View/Explain majority the same
// guide documents.
export const WRITE_CAPABILITIES: Record<S4Area, string[]> = {
  finance_ap: [
    "Create Single Payment",
    "Post Outgoing Payments",
    "Manage Automatic Payments",
    "Preparation of Payments",
    "Down Payment and Manual Clearing",
    "Manage Journal Entries",
    "Manage Recurring Journal Entries",
    "Manual Accrual Object Creation",
    "Clearing Single G/L Open Item",
    "Manage Cost Center",
    "Manage Profit Center",
    "Manage Direct Activity Allocation",
    "Reassign Cost and Revenue",
  ],
  cash: ["Making Bank Transfers", "Displaying Cash Positions"],
  procurement: [
    "Create Purchase Requisitions",
    "Change Purchase Orders",
    "Create Returns Purchase Orders",
    "Updating Delivery Dates for Purchase Orders",
    "Create Supplier Confirmations",
    "Renewing Central Purchase Contracts",
    "Quotation Comparison and Awarding",
    "Request for Quotation",
  ],
  sales: [
    "Create Sales Documents with Reference",
    "Create Billing Documents",
    "Perform Mass Change of Sales Orders",
    "Change Sales Quotations",
    "Renewing Expiring Prices",
    "Perform Sales Order Field Changes and Resolve Fulfillment Issues",
    "Creating/Releasing/Accepting a Solution Quotation",
  ],
  supply_chain: [
    "Executing Backorder Processing (BOP) Run",
    "Fast Track Backorder Processing",
    "Post Goods Receipt without Reference",
    "Process Outbound Delivery Orders",
    "Process Warehouse Tasks/Orders",
    "Managing Physical Stock",
    "Managing Inbound Deliveries",
  ],
  manufacturing: [
    "Production Planning and Operations Agent",
    "Detailed Scheduling Optimization",
  ],
  service: [
    "Complete or Cancel Service Confirmations",
    "Change Statuses of Service Orders",
    "Updating Service Contract and Item Status",
    "Renewing Expiring Service Contracts",
  ],
  master_data: [
    "Create/Edit Business Partners, Customers, Suppliers",
    "Create Decision Table (BRFplus)",
    "ILM Data Destruction",
  ],
};

export const TOTAL_WRITE_CAPABILITIES = Object.values(WRITE_CAPABILITIES).reduce(
  (sum, list) => sum + list.length,
  0
);

// SAP's own marketing figure — real, but spans the whole Business AI
// platform (finance, spend, supply chain, HR, CX), not just S/4HANA.
export const MARKETING_FIGURE = {
  assistants: "50+",
  agents: "200+",
  scope: "SAP's whole Business AI platform",
  source: "SAP News Center, Sapphire 2026 keynote coverage, May 2026",
};

export const TRANSACTIONAL_DEFINITION_QUOTE =
  "You can use transactional capabilities to view and manage business objects directly in your Joule conversation and navigate to the related SAP Fiori apps to perform further actions on these business objects.";

// The one capability whose real gate structure was verified this deeply —
// verbatim from SAP Help, re-confirmed live 2026-08-20 (see honesty
// boundary note at the top of this file).
export interface GateExample {
  capability: string;
  claim: string;
  claimSource: string;
  gates: { label: string; detail: string }[];
  humanCheckpoint: string;
}

export const PRODUCTION_PLANNING_GATE: GateExample = {
  capability: "Production Planning and Operations Agent",
  claim:
    '"Autonomously validate and release production orders when required conditions are met"',
  claimSource: "SAP News Center / SAP Connect coverage, October 2025",
  gates: [
    {
      label: "Scope item",
      detail: "BJ5 — Make-to-Stock Production, Discrete Manufacturing — must be activated",
    },
    {
      label: "Business catalog",
      detail: "SAP_SCM_BC_PRODN_ORD_CTRL_MC must be assigned to the user",
    },
    {
      label: "Batch cap",
      detail: "Up to 20 production orders processed per run, no more",
    },
  ],
  humanCheckpoint:
    '"If the agent detects a situation where it needs your decision as a supervisor, Joule asks you for confirmation" — the planner confirms the proposed changes before the agent completes the release.',
};

export const SOURCE_NOTE =
  "SAP Joule Capabilities Guide, help.sap.com (Transactional Capabilities; Production Planning and Operations Agent pages) — extracted and Fable-5-adversarially-verified 2026-08-17, independently re-verified live 2026-08-20 against SAP's current documentation. Full research: sap-oracle-core-ai-capabilities-2026-08-17.md.";
