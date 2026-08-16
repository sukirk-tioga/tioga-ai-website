// Per-solution "camera position and lighting mood" config for the shared
// /solutions renderer (Phase 4). Each entry maps a solution slug to a
// distinct accent tint (mood) and a pan offset into the shared shader
// field (camera-position proxy -- see SolutionsFieldScene.tsx's own
// comment on why this isn't a literal 3D camera move). Pan values are
// small and spread around the origin so the field always looks organically
// continuous, never like it's snapping between unrelated regions.

export interface SolutionMood {
  color: string;
  colorDark: string;
  panX: number;
  panY: number;
}

export const SOLUTION_MOODS: Record<string, SolutionMood> = {
  oracle: { color: "#00D4FF", colorDark: "#0088AA", panX: 0, panY: 0 },
  sap: { color: "#4ADE80", colorDark: "#1F9D58", panX: 0.6, panY: -0.3 },
  "ap-automation": { color: "#F59E0B", colorDark: "#B36E00", panX: -0.5, panY: 0.4 },
  "governed-write-path": { color: "#8B5CF6", colorDark: "#5B32B0", panX: 0.9, panY: 0.5 },
  "mcp-security": { color: "#EF4444", colorDark: "#A82A2A", panX: -0.8, panY: -0.5 },
  "ai-governance": { color: "#00D4FF", colorDark: "#0057B8", panX: 0.3, panY: 0.9 },
  "ebs-to-s4hana": { color: "#4ADE80", colorDark: "#0088AA", panX: -0.3, panY: -0.8 },
  "standing-watch": { color: "#8B5CF6", colorDark: "#0088AA", panX: 1.1, panY: 0.1 },
};

export const DEFAULT_MOOD: SolutionMood = SOLUTION_MOODS.oracle;

export function moodForPathname(pathname: string): SolutionMood {
  const slug = pathname.split("/").filter(Boolean)[1]; // "/solutions/<slug>"
  if (!slug) return DEFAULT_MOOD;
  return SOLUTION_MOODS[slug] ?? DEFAULT_MOOD;
}
