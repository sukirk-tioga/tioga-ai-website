import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tioga.ai";
  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/solutions", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/solutions/oracle", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/solutions/sap", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/solutions/ap-automation", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/solutions/governed-write-path", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/solutions/mcp-security", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/solutions/ai-governance", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/solutions/ebs-to-s4hana", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/mcp", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/mcp/vs-custom-integration", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/mcp/vs-rpa", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/demos", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/demos/governance-ledger", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/demos/ap-exception-workflow", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/demos/migration-assessment", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/trust", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/trust/eu-ai-act", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/trust/eu-ai-act/calculator", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/trust/framework-mapping", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/changelog", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/engineering", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/engineering/governance-ledger", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/engineering/invoice-processing", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/engineering/email-triage", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/engineering/migration-assessment", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/articles", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/articles/governed-write-path-pattern", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/articles/framework-mapping-not-three-checklists", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/articles/mcp-scoped-permissions", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/articles/migration-complexity-scoring", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/articles/ai-cost-governance-ledger", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/articles/ap-exception-auto-approve-antipattern", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
