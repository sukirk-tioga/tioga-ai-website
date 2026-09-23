import type { Metadata } from "next";
import PresenterSwitch from "./presenter-switch";

// Hidden presenter page for the governed-agent ERP demo (Snowflake backend).
// Password-gated by middleware.ts, noindex, excluded from the sitemap, not
// listed on /demos.
//
// Live mode embeds the ledger UI from Sukir's laptop (docker compose, port
// 4003). It only works at home: Snowflake account EO89282 allows only the
// home IP (see runbooks/run-governed-agent-demo.md in the vault). Anywhere
// else, Recording mode plays a real run captured 2026-09-23.

export const metadata: Metadata = {
  title: "Governed Agent Demo — Presenter",
  robots: { index: false, follow: false },
};

export default function PresenterGovernedAgentPage() {
  return (
    <main id="main-content" className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <div className="pt-28 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2">Presenter view · not public</p>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3">Governed agent write-path — ERP on Snowflake</h1>
        <p className="text-[var(--text-muted)] max-w-3xl mb-8">
          An AI agent proposes purchase-order changes. A policy gateway checks scope and spend caps, routes big
          changes to a human, and the ERP&apos;s own rules have the final say. Every decision lands on an audit ledger.
        </p>
        <PresenterSwitch />
      </div>
    </main>
  );
}
