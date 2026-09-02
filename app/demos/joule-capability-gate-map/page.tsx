"use client";

import { useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  AREAS,
  WRITE_CAPABILITIES,
  TOTAL_WRITE_CAPABILITIES,
  MARKETING_FIGURE,
  TRANSACTIONAL_DEFINITION_QUOTE,
  GATE_EXAMPLES,
  SOURCE_NOTE,
  type S4Area,
} from "./lib/capabilities";

// Everything on this page is static data extracted from SAP's own public
// documentation, rendered client-side — nothing is sent to a server, no
// model call involved. Same discipline as the Agent Autonomy Tier Mapper.

function AreaButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium"
      style={{
        background: selected ? "#C8340615" : "var(--bg-dark)",
        border: `1px solid ${selected ? "#C8340650" : "var(--border)"}`,
        color: selected ? "var(--accent)" : "var(--text-muted)",
      }}
    >
      {children}
    </button>
  );
}

export default function JouleCapabilityGateMapPage() {
  const [area, setArea] = useState<S4Area>("finance_ap");
  const capabilities = WRITE_CAPABILITIES[area];
  const areaLabel = AREAS.find((a) => a.id === area)?.label ?? "";

  return (
    <DemoShell
      title="SAP Joule Capability Gate Map"
      badge="Data Explorer — Sourced from SAP's Own Documentation, Not a Model Call"
      description="SAP says 200+ agents automate your business. Here's what's actually documented to write to your ERP versus view-and-hand-off — and real examples of the gates a capability sits behind, straight from SAP's own documentation across S/4HANA and Concur."
    >
      {/* Stat comparison */}
      <div
        className="grid sm:grid-cols-2 gap-px rounded-2xl overflow-hidden mb-8"
        style={{ background: "var(--border)" }}
      >
        <div className="px-6 py-6 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-3xl font-bold mb-1" style={{ color: "var(--text)" }}>
            {MARKETING_FIGURE.agents}
          </div>
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">
            Joule agents, marketed
          </div>
          <div className="text-xs text-slate-500">{MARKETING_FIGURE.scope}</div>
        </div>
        <div className="px-6 py-6 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-3xl font-bold mb-1" style={{ color: "var(--accent)" }}>
            {TOTAL_WRITE_CAPABILITIES}
          </div>
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">
            Write-capable capabilities, documented
          </div>
          <div className="text-xs text-slate-500">Across all 8 S/4HANA areas below</div>
        </div>
      </div>

      <div
        className="p-5 rounded-xl mb-8 text-sm text-[var(--text-muted)] leading-relaxed"
        style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
      >
        SAP&apos;s own Joule Capabilities Guide splits every capability into three
        tiers: Navigational, Informational, and Transactional. Read SAP&apos;s own
        definition of &ldquo;Transactional&rdquo; closely:
        <span className="italic text-[var(--text-muted)]"> &ldquo;{TRANSACTIONAL_DEFINITION_QUOTE}&rdquo;</span>{" "}
        A large share of what gets marketed as &ldquo;agents that act&rdquo; is, in SAP&apos;s
        own documentation, view-and-hand-off to a Fiori app for a human to finish.
      </div>

      {/* Area picker */}
      <div className="p-6 rounded-2xl mb-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>What actually writes, by area</h2>
        <p className="text-sm text-[var(--text-muted)] mb-5">
          Pick an S/4HANA area to see the real, documented write-capable capability list —
          verbatim from SAP&apos;s own Transactional Capabilities pages.
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {AREAS.map((a) => (
            <AreaButton key={a.id} selected={area === a.id} onClick={() => setArea(a.id)}>
              {a.label}
              <span className="ml-1.5 opacity-60">({WRITE_CAPABILITIES[a.id].length})</span>
            </AreaButton>
          ))}
        </div>

        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-3">
            {areaLabel} — {capabilities.length} write-capable {capabilities.length === 1 ? "capability" : "capabilities"}
          </p>
          <ul className="space-y-1.5">
            {capabilities.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-none" style={{ background: "var(--accent)" }} />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Worked gate examples */}
      <div className="mb-2">
        <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Real worked examples: what a gate actually looks like</h2>
        <p className="text-sm text-[var(--text-muted)] mb-5">
          These are the capabilities checked this deeply for this demo — one from SAP&apos;s own
          flagship &ldquo;autonomous&rdquo; manufacturing pitch, one from Concur&apos;s expense-report
          Joule agent. Each shows the shape of the real question: not &ldquo;can Joule do this,&rdquo;
          but &ldquo;is it configured to, here.&rdquo;
        </p>
      </div>

      {GATE_EXAMPLES.map((example) => (
        <div
          key={example.capability}
          className="p-6 rounded-2xl mb-8"
          style={{ background: "var(--bg-card)", border: `1px solid #FBBF2440` }}
        >
          <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: "var(--accent)" }}>
            {AREAS.find((a) => a.id === example.area)?.label}
          </p>

          <div className="p-4 rounded-xl mb-4" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">{example.capability}</p>
            <p className="text-sm text-[var(--text-muted)] italic">
              The pitch: {example.claim}
            </p>
            <p className="text-xs text-slate-500 mt-1">— {example.claimSource}</p>
          </div>

          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-2">What SAP&apos;s own docs actually require</p>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {example.gates.map((g) => (
              <div key={g.label} className="p-3.5 rounded-xl min-w-0" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--warning-light)" }}>
                  {g.label}
                </p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed break-words">{g.detail}</p>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl" style={{ background: "#4ADE8010", border: "1px solid #4ADE8040" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--success)" }}>
              Human checkpoint
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{example.humanCheckpoint}</p>
          </div>
        </div>
      ))}

      <div
        className="p-5 rounded-xl mb-8 text-sm text-[var(--text-muted)] leading-relaxed"
        style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
      >
        None of this is a secret — it&apos;s all in SAP&apos;s own help documentation. What&apos;s
        missing is the map from a gate list like this to any one client&apos;s actual
        configuration: which scope items are activated, which business catalogs are
        assigned, on this exact release and edition. SAP ships the capability guide.
        Nobody ships the &ldquo;here&apos;s what&apos;s actually turned on, for you, right now&rdquo;
        document — because that&apos;s implementation and governance work, not product
        documentation, and it&apos;s genuinely different for every company.
      </div>

      {/* Citation */}
      <div className="p-5 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--accent)" }}>
          Source &amp; scope
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{SOURCE_NOTE}</p>
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center mt-4 max-w-lg mx-auto">
        The capability list above is a real inventory extracted from SAP&apos;s own
        documentation. The gate detail is verified this deeply for one capability —
        mapping the rest against your real configuration is exactly the work a
        discovery call scopes. Nothing here is saved or sent anywhere; this runs
        entirely in your browser.
      </p>
    </DemoShell>
  );
}
