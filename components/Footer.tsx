import Image from "next/image";

export default function Footer() {
  return (
    <footer className="py-10 px-6" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo-icon.png"
            alt="tioga.ai"
            width={24}
            height={24}
            className="w-6 h-6 object-contain object-bottom"
          />
          <span>Tioga AI</span>
        </a>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
          <a href="/services" className="hover:text-slate-400 transition-colors">Services</a>
          <a href="/demos" className="hover:text-slate-400 transition-colors">Live Demos</a>
          <a href="/mcp" className="hover:text-slate-400 transition-colors">MCP</a>
          <a href="/engineering" className="hover:text-slate-400 transition-colors">Engineering</a>
          <a href="/about" className="hover:text-slate-400 transition-colors">About</a>
          <a href="/trust" className="hover:text-slate-400 transition-colors">Trust</a>
          <a href="/changelog" className="hover:text-slate-400 transition-colors">Build Log</a>
          <a href="/#contact" className="hover:text-slate-400 transition-colors">Contact</a>
          <a href="mailto:hello@tioga.ai" className="hover:text-slate-400 transition-colors">hello@tioga.ai</a>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p>© {new Date().getFullYear()} Tioga AI</p>
          <div className="flex items-center gap-3 text-xs">
            <a href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-slate-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
