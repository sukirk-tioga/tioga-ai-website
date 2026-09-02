interface Metric {
  label: string;
  value: string;
}

export interface BenchmarkData {
  date: string;
  model: string;
  dataSource: string;
  sampleSize: string;
  metrics: Metric[];
  limitations: string[];
}

export default function BenchmarkCard({ data }: { data: BenchmarkData }) {
  return (
    <div
      className="p-6 rounded-2xl"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
        <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Labeled benchmark</h2>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ color: "var(--text-muted)", background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
          Run {data.date}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--accent)" }}>Model</p>
          <p className="text-[var(--text-muted)]">{data.model}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--accent)" }}>Sample size</p>
          <p className="text-[var(--text-muted)]">{data.sampleSize}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--accent)" }}>Data source</p>
          <p className="text-[var(--text-muted)]">{data.dataSource}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        {data.metrics.map((m) => (
          <div key={m.label} className="p-3 rounded-lg" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
            <p className="text-xs text-[var(--text-muted)] mb-1">{m.label}</p>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--warning)" }}>Limitations</p>
        <ul className="space-y-1.5">
          {data.limitations.map((l, i) => (
            <li key={i} className="text-xs text-[var(--text-muted)] leading-relaxed flex gap-2">
              <span className="shrink-0">—</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
