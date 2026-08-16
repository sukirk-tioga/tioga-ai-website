export const CAL_LINK = "https://cal.com/sukir-kumaresan-rfgb7k/introduction-chat";

// Shared by any 3D/WebGL surface that reads brand colors at runtime instead
// of hardcoding hex literals (repo convention — see CLAUDE.md). Was defined
// locally inside ShowcaseScene.tsx; pulled out here once a second real
// call site (the homepage hero field) needed the same helper.
export function readCssToken(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || "white";
}
