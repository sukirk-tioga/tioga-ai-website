import SolutionsFieldLoader from "@/components/SolutionsFieldLoader";

// Phase 4 "Cartier" set piece: this layout persists across navigation
// between /solutions and its 8 sub-pages (Next.js layouts don't remount on
// nested route changes), so <SolutionsFieldLoader>'s Canvas/WebGL context
// stays alive while only each page's own content swaps underneath -- that
// persistence is what makes the mood transition (see
// components/SolutionsFieldLoader.tsx) read as flying between rooms in one
// shared space rather than a hard reload on every click.
export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SolutionsFieldLoader />
      {children}
    </>
  );
}
