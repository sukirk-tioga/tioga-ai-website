import TrackedCTA from "@/components/TrackedCTA";

interface EstatePane {
  vendor: string;
  product: string;
  quote: string;
  source: string;
}

const PANES: EstatePane[] = [
  {
    vendor: "SAP",
    product: "AI Agent Hub",
    quote: "governance layer of record for the enterprise agent ecosystem",
    source: "SAP CTO Philipp Herzig, SAP News, Aug 2026",
  },
  {
    vendor: "Workday",
    product: "Agent System of Record",
    quote: "the single source of truth for all of an enterprise's AI agents",
    source: "Workday ASOR GA blog, blog.workday.com",
  },
  {
    vendor: "Databricks",
    product: "Unity AI Gateway",
    quote: "a unified governance layer for both AI assets and AI interactions",
    source: "Databricks blog, Data + AI Summit 2026 (Jun 2026)",
  },
  {
    vendor: "ServiceNow",
    product: "AI Control Tower",
    quote: "we manage them where technically possible",
    source: "ServiceNow product leadership, per Techzine Global reporting, May 2026",
  },
];

const DISCIPLINES = ["Qualify", "Arbitrate", "Gate", "Probe", "Track", "Review"];

export default function StandingWatchEstateDiagram() {
  return (
    <div
      className="p-6 md:p-8 rounded-2xl"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--accent)" }}>
        The estate today
      </p>
      <h2 className="text-lg font-bold text-white mb-1">
        Four vendors, four self-claimed &ldquo;layers of record&rdquo;
      </h2>
      <p className="text-sm text-slate-400 mb-6 max-w-2xl">
        Each pane below is the vendor&apos;s own verified language about its own product —
        not Tioga&apos;s characterization. Standing Watch&apos;s six disciplines sit above and
        across all four, as the cross-cutting layer none of them ship.
      </p>

      {/* Cross-cutting Standing Watch band */}
      <div
        className="rounded-xl p-4 relative z-10"
        style={{ background: "#00D4FF15", border: "1px solid #00D4FF40" }}
      >
        <p className="text-xs uppercase tracking-wide mb-2 text-center" style={{ color: "var(--accent)" }}>
          Standing Watch — six disciplines, cross-cutting
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {DISCIPLINES.map((d) => (
            <span
              key={d}
              className="text-xs font-mono px-2.5 py-1 rounded-full"
              style={{ color: "var(--accent)", background: "var(--bg-dark)", border: "1px solid #00D4FF40" }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Connector ticks */}
      <div className="grid grid-cols-2 md:grid-cols-4">
        {PANES.map((p) => (
          <div key={p.vendor} className="flex justify-center">
            <div className="w-px h-3" style={{ background: "#00D4FF40" }} />
          </div>
        ))}
      </div>

      {/* Vendor panes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PANES.map((p) => (
          <div
            key={p.vendor}
            className="p-4 rounded-xl flex flex-col"
            style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
          >
            <p className="text-sm font-semibold text-white">{p.vendor}</p>
            <p className="text-[11px] text-slate-400 mb-2">{p.product}</p>
            <p className="text-sm italic text-slate-200 flex-1 leading-snug">&ldquo;{p.quote}&rdquo;</p>
            <p
              className="text-[10px] text-slate-400 mt-3 pt-2"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {p.source}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-5 text-center leading-relaxed">
        A static positioning graphic, not a live data feed — quotes verified 2026-08-10 against
        each vendor&apos;s own material or on-record statements; see source line under each pane.
      </p>

      <div className="text-center mt-4">
        <TrackedCTA
          href="/samples/standing-watch-one-pager.html"
          target="_blank"
          rel="noopener noreferrer"
          event="lead_asset_download"
          data={{ asset: "standing-watch-one-pager", location: "solutions_standing-watch" }}
          className="inline-block text-sm underline underline-offset-2 transition-colors hover:text-white"
          style={{ color: "var(--accent)" }}
        >
          Download the one-pager (print/save as PDF) →
        </TrackedCTA>
      </div>
    </div>
  );
}
