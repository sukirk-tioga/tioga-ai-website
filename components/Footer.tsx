export default function Footer() {
  return (
    <footer className="py-10 px-6" style={{ borderTop: "1px solid #1E2D4A" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            T
          </div>
          <span>Tioga AI</span>
        </a>
        <div className="flex items-center gap-6 text-xs">
          <a href="/demos" className="hover:text-slate-400 transition-colors">Live Demos</a>
          <a href="/mcp" className="hover:text-slate-400 transition-colors">MCP</a>
          <a href="/#contact" className="hover:text-slate-400 transition-colors">Contact</a>
          <a href="mailto:hello@tioga.ai" className="hover:text-slate-400 transition-colors">hello@tioga.ai</a>
        </div>
        <p>© {new Date().getFullYear()} Tioga AI</p>
      </div>
    </footer>
  );
}
