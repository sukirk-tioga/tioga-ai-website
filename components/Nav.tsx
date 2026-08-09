"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

  // Trimmed 2026-08-08 from 8 items to 5: MCP and Engineering are jargon a
  // CFO/CIO buyer won't recognize from a nav bar and were already duplicated
  // in the footer; Process is homepage content, reachable via the #process
  // anchor. Solutions/Services/Live Demos kept as the core buyer funnel.
  const links = [
    { href: "/solutions", label: "Solutions" },
    { href: "/#services", label: "Services" },
    { href: "/demos", label: "Live Demos" },
    { href: "/about", label: "About" },
    { href: "/#contact", label: "Contact" },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between transition-all duration-200"
        style={{
          background: scrolled ? "rgba(10,15,28,0.97)" : "rgba(10,15,28,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo-icon.png"
            alt="tioga.ai logo"
            width={52}
            height={52}
            className="w-12 h-12 object-contain"
          />
          <span className="font-semibold text-white text-xl tracking-tight">tioga<span style={{ color: "var(--accent)" }}>.ai</span></span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-base text-slate-400 font-semibold">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-white transition-colors"
              style={isActive(l.href) ? { color: "white" } : {}}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/#contact"
            className="hidden md:inline-flex px-5 py-2.5 rounded-lg text-base font-medium text-white transition-all hover:opacity-90"
            style={{ background: "var(--accent-dark)" }}
          >
            Get Started
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors hover:bg-white/5"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
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
        id="mobile-nav-menu"
        className="fixed top-[65px] left-0 right-0 z-40 md:hidden transition-all duration-200 overflow-hidden"
        aria-hidden={!menuOpen}
        style={{
          maxHeight: menuOpen ? "400px" : "0px",
          background: "rgba(10,15,28,0.98)",
          borderBottom: menuOpen ? "1px solid var(--border)" : "none",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="px-6 py-4 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? undefined : -1}
              className="py-3 text-sm text-slate-300 hover:text-white transition-colors border-b border-slate-800/50 last:border-0"
              style={isActive(l.href) ? { color: "white" } : {}}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? undefined : -1}
            className="mt-3 py-3 rounded-lg text-sm font-medium text-white text-center transition-all hover:opacity-90"
            style={{ background: "var(--accent-dark)" }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
