"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  BlendFunction,
  BloomEffect,
  ChromaticAberrationEffect,
  DepthOfFieldEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  Pass,
  RenderPass,
} from "postprocessing";

// Real postprocessing, wired by hand against the vanilla `postprocessing`
// package rather than `@react-three/postprocessing` (whose 2.x line is a
// ~19-months-stale wrapper and whose 3.x line requires fiber v9/React 19 —
// this repo is still on fiber v8/React 18). `npm install postprocessing`
// resolves cleanly against three ^0.185.1 with zero peer conflicts —
// verified before writing this file, not assumed. The
// `@react-three/fiber`-documented way to hand off rendering to a custom
// EffectComposer is a useFrame callback with a nonzero render-priority,
// which stops R3F's own default `gl.render(scene, camera)` call so this
// composer becomes the only thing drawing each frame.
//
// Mobile gets bloom only — depth of field and chromatic aberration/noise
// are desktop-only, matching the tiered-quality pattern real award-winning
// sites (e.g. Bruno Simon's portfolio) use rather than dropping effects
// outright on lower-end GPUs.
export default function ShowcaseEffects({ isMobile }: { isMobile: boolean }) {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => new EffectComposer(gl), [gl]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  useEffect(() => {
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloom = new BloomEffect({
      intensity: isMobile ? 0.8 : 1.15,
      luminanceThreshold: 0.32,
      luminanceSmoothing: 0.25,
      mipmapBlur: true,
      radius: 0.55,
    });

    const passes: Pass[] = [renderPass];

    if (isMobile) {
      const bloomPass = new EffectPass(camera, bloom);
      composer.addPass(bloomPass);
      passes.push(bloomPass);
    } else {
      const dof = new DepthOfFieldEffect(camera, {
        focalLength: 0.02,
        bokehScale: 0.9,
        height: size.height,
      });
      // Auto-focus on the gate at world origin every frame rather than a
      // fixed normalized focusDistance — the camera's distance to the gate
      // barely changes (zoom is disabled) but this stays correct if that
      // ever changes.
      dof.target = new THREE.Vector3(0, 0, 0);

      const chroma = new ChromaticAberrationEffect({
        offset: new THREE.Vector2(0.0006, 0.0006),
        radialModulation: false,
        modulationOffset: 0,
      });

      const grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true });
      grain.blendMode.opacity.value = 0.03;

      const effectPass = new EffectPass(camera, bloom, dof, chroma, grain);
      composer.addPass(effectPass);
      passes.push(effectPass);
    }

    return () => {
      passes.forEach((pass) => {
        if (pass !== renderPass) composer.removePass(pass);
      });
      composer.removePass(renderPass);
      passes.forEach((pass) => pass.dispose());
    };
  }, [composer, scene, camera, isMobile]);

  // Nonzero render priority hands the per-frame render call to this
  // composer and stops R3F's own default render — documented pattern for
  // wiring a manual EffectComposer into react-three-fiber v8.
  useFrame(
    (_, delta) => {
      composer.render(delta);
    },
    1
  );

  return null;
}
