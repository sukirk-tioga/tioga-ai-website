import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tioga.ai";
  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/mcp", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/demos", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/demos/governance-ledger", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/demos/migration-assessment", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/trust", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/trust/eu-ai-act", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/trust/eu-ai-act/calculator", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/trust/framework-mapping", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/changelog", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/engineering", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/engineering/invoice-processing", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/engineering/email-triage", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/engineering/migration-assessment", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
