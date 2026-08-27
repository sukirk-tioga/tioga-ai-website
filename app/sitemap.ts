import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tioga.ai";
  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const, lastModified: "2026-08-07" },
    { path: "/solutions", priority: 0.9, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/solutions/oracle", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/solutions/sap", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/solutions/ap-automation", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/solutions/governed-write-path", priority: 0.7, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/solutions/mcp-security", priority: 0.7, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/solutions/ai-governance", priority: 0.7, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/solutions/ebs-to-s4hana", priority: 0.7, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/mcp", priority: 0.7, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/mcp/vs-custom-integration", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/mcp/vs-rpa", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/demos", priority: 0.8, changeFrequency: "weekly" as const, lastModified: "2026-08-07" },
    { path: "/demos/governance-ledger", priority: 0.6, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/demos/ap-exception-workflow", priority: 0.6, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/demos/migration-assessment", priority: 0.6, changeFrequency: "monthly" as const, lastModified: "2026-08-02" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const, lastModified: "2026-08-16" },
    { path: "/trust", priority: 0.7, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/trust/eu-ai-act", priority: 0.6, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/trust/eu-ai-act/calculator", priority: 0.6, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/trust/framework-mapping", priority: 0.6, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/changelog", priority: 0.6, changeFrequency: "weekly" as const, lastModified: "2026-08-07" },
    { path: "/engineering", priority: 0.6, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/engineering/governance-ledger", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/engineering/invoice-processing", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/engineering/email-triage", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/engineering/migration-assessment", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-07" },
    { path: "/articles", priority: 0.6, changeFrequency: "monthly" as const, lastModified: "2026-08-26" },
    { path: "/articles/who-runs-your-ai", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-26" },
    { path: "/articles/governed-write-path-pattern", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-03" },
    { path: "/articles/framework-mapping-not-three-checklists", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-03" },
    { path: "/articles/mcp-scoped-permissions", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-03" },
    { path: "/articles/migration-complexity-scoring", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-03" },
    { path: "/articles/ai-cost-governance-ledger", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-03" },
    { path: "/articles/ap-exception-auto-approve-antipattern", priority: 0.5, changeFrequency: "monthly" as const, lastModified: "2026-08-03" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const, lastModified: "2026-08-07" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const, lastModified: "2026-08-07" },
  ];

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    lastModified: route.lastModified,
  }));
}
