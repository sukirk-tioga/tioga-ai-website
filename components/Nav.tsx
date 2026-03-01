"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const links = [
    { href: "/#services", label: "Services" },
    { href: "/demos", label: "Live Demos" },
    { href: "/mcp", label: "MCP" },
    { href: "/#process", label: "Process" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between transition-all duration-200"
        style={{
          background: scrolled ? "rgba(10,15,28,0.97)" : "rgba(10,15,28,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1E2D4A",
        }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo-icon.png"
            alt="tioga.ai logo"
            width={52}
            height={52}
            className="w-12 h-12 object-contain"
          />
          <span className="font-semibold text-white text-lg tracking-tight">tioga<span style={{ color: "#00D4FF" }}>.ai</span></span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-white transition-colors"
              style={pathname === l.href ? { color: "white" } : {}}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <a
            href="/#contact"
            className="hidden md:inline-flex px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            Get Started
          </a>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors hover:bg-white/5"
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-0.5 bg-slate-400 transition-all duration-200 origin-center"
              style={menuOpen ? { transform: "rotate(45deg) translate(3px, 3px)" } : {}}
            />
            <span
              className="block w-5 h-0.5 bg-slate-400 transition-all duration-200"
              style={menuOpen ? { opacity: 0 } : {}}
            />
            <span
              className="block w-5 h-0.5 bg-slate-400 transition-all duration-200 origin-center"
              style={menuOpen ? { transform: "rotate(-45deg) translate(3px, -3px)" } : {}}
            />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        className="fixed top-[65px] left-0 right-0 z-40 md:hidden transition-all duration-200 overflow-hidden"
        style={{
          maxHeight: menuOpen ? "400px" : "0px",
          background: "rgba(10,15,28,0.98)",
          borderBottom: menuOpen ? "1px solid #1E2D4A" : "none",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="px-6 py-4 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-slate-300 hover:text-white transition-colors border-b border-slate-800/50 last:border-0"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#contact"
            onClick={() => setMenuOpen(false)}
            className="mt-3 py-3 rounded-lg text-sm font-medium text-white text-center transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            Get Started
          </a>
        </div>
      </div>
    </>
  );
}
