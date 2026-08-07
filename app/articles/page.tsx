import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Technical writing on governed AI write-paths, AI governance frameworks, MCP security, ERP migration, and AI cost governance — grounded in Tioga AI's own live demos and infrastructure.",
  alternates: { canonical: "/articles" },
  openGraph: {
    title: "Articles — Tioga AI",
    description: "Technical articles grounded in real, running systems — not generic AI takes.",
  },
};

const ARTICLES = [
  {
    href: "/articles/governed-write-path-pattern",
    title: "How a governed AI write-path actually works",
    summary: "Read, decide, approve, execute, audit, reject, rollback — with a real bug we caught building it.",
  },
  {
    href: "/articles/framework-mapping-not-three-checklists",
    title: "NIST AI RMF, ISO 42001, EU AI Act: one mapping, not three checklists",
    summary: "Why the same evidence trail satisfies all three, if it's architectural from the start.",
  },
  {
    href: "/articles/mcp-scoped-permissions",
    title: "An MCP integration still needs the same approval gates a custom API needs",
    summary: "What Model Context Protocol standardizes, and what it doesn't — with real code.",
  },
  {
    href: "/articles/migration-complexity-scoring",
    title: "What actually drives Oracle EBS → S/4HANA migration complexity",
    summary: "A real, reproducible scoring model from module footprint and data volume.",
  },
  {
    href: "/articles/ai-cost-governance-ledger",
    title: "What a real AI cost-governance ledger looks like",
    summary: "88% of our own model calls settle at $0 before touching billed credit — real numbers.",
  },
  {
    href: "/articles/ap-exception-auto-approve-antipattern",
    title: "Why \"auto-approve everything under $X\" is an AP governance anti-pattern",
    summary: "Scope, spend tiers, and ERP validation as independent layers — plus a rollback bug we found.",
  },
];

export default function ArticlesIndexPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Articles
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Grounded in running systems, not takes.
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-16">
          Every article here links back to a live demo, a real policy file, or
          a real bug we found and fixed — not generic advice. Pre-launch, no
          client case studies exist yet; what follows is the actual
          engineering and governance reasoning behind what we&apos;ve built.
        </p>

        <div className="space-y-4">
          {ARTICLES.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="block p-6 rounded-2xl transition-all hover:border-slate-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white mb-1.5">{a.title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xl">{a.summary}</p>
                </div>
                <span className="text-sm shrink-0" style={{ color: "var(--accent)" }}>Read →</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-slate-400 mb-4">
            Prefer how the demos themselves were built?{" "}
            <Link href="/engineering" style={{ color: "var(--accent)" }} className="hover:text-white transition-colors">
              See the engineering writeups →
            </Link>
          </p>
          <Link
            href="/demos"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Try the live demos
          </Link>
        </div>
      </section>
    </main>
  );
}
