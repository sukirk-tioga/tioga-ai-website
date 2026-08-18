import Link from "next/link";
import type { ReactNode } from "react";

// Shared wrapper for standalone demo pages: title, description, back-link, footer CTA.
export default function DemoShell({
  title,
  description,
  badge = "Live AI Demo — Powered by Claude",
  children,
}: {
  title: string;
  description: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <div className="pt-28 pb-20 px-6 max-w-3xl mx-auto">
        <Link
          href="/demos"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All demos
        </Link>

        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
          >
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
            {badge}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h1>
          <p className="text-slate-400 max-w-xl">{description}</p>
        </div>

        {children}

        {/* Footer CTA */}
        <div
          className="mt-14 p-8 rounded-2xl text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-xl font-semibold text-white mb-2">
            Want the full picture for your environment?
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            A discovery call gets you a scoped assessment from the team that builds these
            migrations — not a form, a conversation.
          </p>
          <a
            href="/contact"
            className="inline-flex px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Book a discovery call
          </a>
        </div>
      </div>
    </main>
  );
}
