import type { Metadata } from "next";
import Link from "next/link";
import SolutionsHub from "./SolutionsHub";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Find the right workflow for your business — governed AI agents for finance and purchasing, service operations, reporting, systems integration, and AI oversight, organized by problem, not by vendor.",
  alternates: { canonical: "/solutions" },
  openGraph: {
    title: "Solutions — Tioga AI",
    description: "Find the right workflow for your business, organized by problem, not by vendor.",
  },
};

// Real solution-detail routes, mapped to the hub's workflow IDs only where
// the mapping is genuinely 1:1 accurate. Left unmapped (renders as plain
// text via the component's own honesty behavior):
//  - "oracle-sap": names two systems (Oracle EBS and SAP) but only one
//    URL is possible per workflow row — a single href here would
//    misrepresent which system it points to. Both are still reachable via
//    the "Browse by system" section below instead.
//  - "sales-orders", "field-service", "erp-reporting": no live /solutions
//    detail page exists for these yet.
//  - "ledger", "oversight", "autonomy": each has a live /demos page but no
//    dedicated /solutions detail page — mapping to a demo would blur the
//    "solution page" destination this hub's link affordance implies.
//  - "hr-procurement", "salesforce": marked not-built; no destination.
const LINKS: Record<string, string> = {
  "ap-exceptions": "/solutions/ap-automation",
  "write-paths": "/solutions/governed-write-path",
  "mcp": "/solutions/mcp-security",
  "watch": "/solutions/standing-watch",
};

// "AI Governance" is a real /solutions page but covers compliance programs
// (NIST AI RMF, ISO 42001, EU AI Act) broadly rather than any one of the
// governance family's four named tools — so it's wired as a family-level
// link rather than force-mapped onto "ledger"/"oversight"/"autonomy".
const FAMILY_LINKS: Record<string, string> = {
  governance: "/solutions/ai-governance",
};

const BY_SYSTEM = [
  { href: "/solutions/oracle", label: "Oracle EBS" },
  { href: "/solutions/sap", label: "SAP" },
  { href: "/solutions/ebs-to-s4hana", label: "EBS → S/4HANA migration" },
];

export default function SolutionsHubPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <div className="pt-24">
        <SolutionsHub variant="editorial" links={LINKS} familyLinks={FAMILY_LINKS} />
      </div>

      {/* Preserves vendor-page discoverability: the old hub linked directly
          to Oracle/SAP/etc. by vendor name. The new problem-led structure
          above doesn't have an equivalent "by system" section, so this
          keeps those real pages reachable from /solutions without
          competing with the problem-led hierarchy above it. */}
      <section className="max-w-5xl mx-auto px-6 pb-20 pt-2" aria-labelledby="by-system-title">
        <h2
          id="by-system-title"
          className="text-xs font-semibold uppercase tracking-wide mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Browse by system
        </h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {BY_SYSTEM.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="transition-colors hover:text-[var(--text)]"
              style={{ color: "var(--text-muted)" }}
            >
              {s.label} →
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
