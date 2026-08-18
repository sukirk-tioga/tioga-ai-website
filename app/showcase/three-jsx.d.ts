// @react-three/fiber v8's bundled types augment the *global* `JSX` namespace
// (`declare global { namespace JSX { ... } }`), which was correct for
// @types/react 18. This repo's devDependency @types/react is pinned to v19
// (a pre-existing skew from the runtime `react@18.3.1` — not introduced by
// this change), and @types/react 19 moved JSX.IntrinsicElements out of the
// global namespace into a module augmentation of `"react"` itself
// (see react/jsx-runtime.d.ts). Fiber v8's global augmentation is therefore
// never consulted, and every R3F intrinsic (`<mesh>`, `<meshStandardMaterial>`,
// etc.) fails to typecheck. This file re-declares the same extension in the
// place @types/react 19 actually looks, without changing the repo's
// project-wide @types/react version.
import type { ThreeElements } from "@react-three/fiber";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
