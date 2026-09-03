import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// Generated from the actual route tree (fixed 2026-09-02 — see the
// 2026-09-02 comprehensive business-readiness audit, G-43). The previous
// version was a hand-maintained array that had drifted to 34 of 51 live
// routes, with lastModified frozen at 2026-08-07 on nearly every entry —
// missing 6 of 8 articles, 8 of 12 demo pages (including
// /demos/standing-watch, arguably the strongest proof asset on the site),
// /solutions/standing-watch, /engineering/standing-watch, /showcase,
// /lp/standing-watch, /privacy, and /terms. Walking app/ at build time
// means this can't silently drift out of sync with the route tree again —
// a new page.tsx is automatically included on the next build.

const APP_DIR = path.join(process.cwd(), "app");
const BASE_URL = "https://tioga.ai";

// Priority tiers by path shape — same rough weighting the old hand-written
// list used (home highest, top-level sections next, nested/legal lowest),
// just derived from the route instead of re-typed per entry.
function priorityFor(route: string): number {
  if (route === "/") return 1.0;
  const depth = route.split("/").filter(Boolean).length;
  if (route === "/privacy" || route === "/terms") return 0.3;
  if (depth === 1) return 0.8;
  if (depth === 2) return 0.6;
  return 0.5;
}

function changeFreqFor(route: string): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (route === "/" || route === "/demos" || route === "/changelog") return "weekly";
  if (route === "/privacy" || route === "/terms") return "yearly";
  return "monthly";
}

// Recursively find every page.tsx under app/, skipping anything under a
// directory that starts with "_" (private, non-routable, per Next.js
// convention — e.g. demos/_lib) and skipping dynamic-segment directories
// (["..."] or "[slug]") since none exist today and a future one would need
// its own sitemap logic (generateSitemaps), not a static URL entry.
function findPageFiles(dir: string, routeParts: string[] = []): { route: string; absPath: string }[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: { route: string; absPath: string }[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith("[")) continue; // dynamic segment, not a static route
      results.push(...findPageFiles(fullPath, [...routeParts, entry.name]));
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      const route = "/" + routeParts.join("/");
      results.push({ route: route === "/" ? "/" : route.replace(/\/$/, ""), absPath: fullPath });
    }
  }
  return results;
}

// Best-effort real last-modified date from git history. Falls back to the
// build date if git isn't available (e.g. a shallow clone with truncated
// history) — a build-date fallback is honest (reflects when the site was
// actually last deployed) rather than reintroducing a hand-typed, staleness-
// prone constant.
function lastModifiedFor(absPath: string): string {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${absPath}"`, {
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (out) return out;
  } catch {
    // git unavailable or file not tracked yet — fall through to build date
  }
  return new Date().toISOString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = findPageFiles(APP_DIR);

  return pages
    .map(({ route, absPath }) => ({
      url: `${BASE_URL}${route}`,
      lastModified: lastModifiedFor(absPath),
      changeFrequency: changeFreqFor(route),
      priority: priorityFor(route),
    }))
    .sort((a, b) => a.url.localeCompare(b.url));
}
