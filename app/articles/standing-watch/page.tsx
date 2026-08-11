import type { Metadata } from "next";
import ArticlePage, { type ArticleContent } from "@/components/ArticlePage";

export const metadata: Metadata = {
  title: "Why Every Automation We Run Only Proposes — Never Applies",
  description:
    "The real 12-day cross-machine auth gap that motivated our security-watch automation, and why propose-and-approve — never auto-apply — is the whole point of Standing Watch.",
  alternates: { canonical: "/articles/standing-watch" },
  openGraph: {
    type: "article",
    publishedTime: "2026-08-10",
    title: "Why Every Automation We Run Only Proposes — Tioga AI",
    description: "Propose-and-approve governance, forged on a real incident, run on our own two-machine estate.",
  },
};

const content: ArticleContent = {
  slug: "standing-watch",
  query: "AI agent governance propose and approve automation",
  date: "2026-08-10",
  title: "Why every automation we run only proposes — never applies",
  dek: "Standing Watch is a name for six governance disciplines we already run in production on our own multi-vendor AI estate. Here's the incident that started it and the rule that hasn't changed since.",
  evidenceLabel: "Evidence: real, dated excerpts from our own router-watch and security-watch automations — not a projection or a mockup.",
  sections: [
    {
      heading: "The incident: fixed on one machine, silently absent on the other for 12+ days",
      body: (
        <p>
          Our AI estate runs across two machines talking to five different
          backends. Before security-watch existed, we hit the failure mode
          it was built to catch: an authentication fix was applied and
          verified on one machine, and quietly never made it to the second.
          Nobody was lying about the system&apos;s state — nobody was
          checking both machines identically, on a schedule. It drifted,
          unauthenticated, for more than 12 days before anything caught it.
        </p>
      ),
    },
    {
      heading: "The fix isn't a smarter check — it's the same check, everywhere, on a schedule",
      body: (
        <p>
          Security-watch runs one behavioral probe — make the real
          unauthenticated call, read the real HTTP status — identically
          against every machine in scope, without relying on anyone
          remembering to look. On our most recent run, that exact class of
          gap showed up again on schedule (the gateway&apos;s
          authentication was found open), and was fixed and re-verified the
          same day. 8 of 10 flagged findings that run were fixed and
          verified live; 2 were correctly left for a human — full-disk
          encryption, because enabling it needs physical console access
          nothing the automation runs with can reach, and a home-router
          firewall rule, because it needs the router&apos;s own admin UI,
          not anything scriptable from either machine.
        </p>
      ),
    },
    {
      heading: "Propose-and-approve is the design, not a gap we haven't closed",
      body: (
        <p>
          Neither router-watch nor security-watch has write access to the
          config it reports on. Every finding is a dated proposal a human
          reads and applies by hand, then the automation re-verifies. That
          durable record — a human decision attached to every change — is
          the actual product. An automation that silently applied its own
          fixes would still be making the same changes, but it would stop
          being evidence anyone could audit later.
        </p>
      ),
    },
  ],
  relatedService: {
    href: "/solutions/standing-watch",
    label: "Standing Watch Assessment",
  },
  related: [
    { href: "/demos/standing-watch", label: "See the real excerpts" },
    { href: "/engineering/standing-watch", label: "Read the full engineering writeup" },
  ],
};

export default function StandingWatchArticle() {
  return <ArticlePage content={content} />;
}
