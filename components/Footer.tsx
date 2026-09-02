import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-10 px-6" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo-icon.png"
            alt="tioga.ai"
            width={24}
            height={24}
            className="w-6 h-6 object-contain object-bottom"
          />
          <span>Tioga AI</span>
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
          <Link href="/services" className="hover:text-[var(--text)] transition-colors">Services</Link>
          <Link href="/demos" className="hover:text-[var(--text)] transition-colors">Live Demos</Link>
          <Link href="/#process" className="hover:text-[var(--text)] transition-colors">Process</Link>
          <Link href="/mcp" className="hover:text-[var(--text)] transition-colors">MCP</Link>
          <Link href="/engineering" className="hover:text-[var(--text)] transition-colors">Engineering</Link>
          <Link href="/articles" className="hover:text-[var(--text)] transition-colors">Articles</Link>
          <Link href="/about" className="hover:text-[var(--text)] transition-colors">About</Link>
          <Link href="/trust" className="hover:text-[var(--text)] transition-colors">Trust</Link>
          <Link href="/changelog" className="hover:text-[var(--text)] transition-colors">Build Log</Link>
          <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
          <a href="mailto:hello@tioga.ai" className="hover:text-[var(--text)] transition-colors">hello@tioga.ai</a>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p>© {new Date().getFullYear()} Tioga AI</p>
          <div className="flex items-center gap-3 text-xs">
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
