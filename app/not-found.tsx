export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center text-[var(--text)] px-6" style={{ background: "var(--bg-dark)" }}>
      <div className="max-w-lg w-full text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent)" }}
        >
          404
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>Page not found</h1>
        <p className="text-[var(--text-muted)] mb-10">
          That page doesn&apos;t exist — but here&apos;s where you probably meant to go.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <a
            href="/demos"
            className="p-4 rounded-xl transition-all hover:border-slate-500"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Live Demos →</p>
          </a>
          <a
            href="/services"
            className="p-4 rounded-xl transition-all hover:border-slate-500"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Services &amp; Pricing →</p>
          </a>
          <a
            href="/contact"
            className="p-4 rounded-xl transition-all hover:border-slate-500"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Book a Call →</p>
          </a>
        </div>
      </div>
    </main>
  );
}
