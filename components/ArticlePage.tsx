import TrackedCTA from "@/components/TrackedCTA";

interface Section {
  heading: string;
  body: React.ReactNode;
}

interface RelatedLink {
  href: string;
  label: string;
}

export interface ArticleContent {
  slug: string;
  query: string;
  title: string;
  dek: string;
  evidenceLabel: string;
  sections: Section[];
  relatedService: RelatedLink;
  related: RelatedLink[];
}

export default function ArticlePage({ content }: { content: ArticleContent }) {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <article className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <a
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All articles
        </a>

        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Targets: &ldquo;{content.query}&rdquo;
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{content.title}</h1>
        <p className="text-lg text-slate-400 leading-relaxed mb-4">{content.dek}</p>

        <div
          className="text-xs px-3 py-2 rounded-lg mb-12 inline-block"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          {content.evidenceLabel}
        </div>

        <div className="flex flex-col gap-10">
          {content.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold text-white mb-3">{s.heading}</h2>
              <div className="text-slate-400 leading-relaxed space-y-3">{s.body}</div>
            </section>
          ))}
        </div>

        <div
          className="mt-14 p-8 rounded-2xl text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-xl font-semibold text-white mb-2">See it built, not just described</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            {content.relatedService.label} is the engagement this pattern comes from.
          </p>
          <TrackedCTA
            href={content.relatedService.href}
            event="article_to_service_cta"
            data={{ article: content.slug, target: content.relatedService.href }}
            className="inline-flex px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            {content.relatedService.label} →
          </TrackedCTA>
        </div>

        {content.related.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
            {content.related.map((r) => (
              <a key={r.href} href={r.href} className="hover:text-white transition-colors" style={{ color: "var(--accent)" }}>
                {r.label} →
              </a>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
