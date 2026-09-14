"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

// Bloom-only postprocessing for "The Boundary" — same hand-wired
// EffectComposer pattern as app/showcase/ShowcaseEffects.tsx (vanilla
// `postprocessing` package, nonzero-priority useFrame takes over the
// render call), deliberately without DOF/chromatic aberration/grain: this
// scene's bold gold/cyan/violet/magenta palette (app/globals.css's
// --boundary-* tokens) needs its bright pixels to actually bloom to read
// as bold rather than muddy against the dark --bg-solutions-field, but
// doesn't need Showcase's cinematic depth-of-field treatment. One tier for
// both desktop and mobile (bloom alone is cheap), unlike Showcase's
// tiered desktop/mobile split.
export default function BoundaryEffects() {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => new EffectComposer(gl), [gl]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  useEffect(() => {
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloom = new BloomEffect({
      intensity: 0.9,
      luminanceThreshold: 0.55,
      luminanceSmoothing: 0.2,
      mipmapBlur: true,
      radius: 0.5,
    });
    const bloomPass = new EffectPass(camera, bloom);
    composer.addPass(bloomPass);

    return () => {
      composer.removePass(bloomPass);
      composer.removePass(renderPass);
      bloomPass.dispose();
      renderPass.dispose();
    };
  }, [composer, scene, camera]);

  useFrame((_, delta) => {
    composer.render(delta);
  }, 1);

  return null;
}
