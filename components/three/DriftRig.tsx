"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Extracted from app/showcase/ShowcaseScene.tsx's `Rig` component — the
// scripted intro camera dolly + OrbitControls autoRotate ping-pong is
// load-bearing (docs/design/3d-design-standard.md §4.2, "the camera-freeze
// trap"): OrbitControls.autoRotate always advances azimuth in one
// direction, so a clamped min/maxAzimuthAngle range drifts to its boundary
// once and then sits completely frozen forever unless the direction is
// flipped at each boundary. That flip/eased-speed logic is copied here
// byte-for-byte in spirit, just parameterized (bounds, intro camera
// positions) instead of hardcoded to the corridor's own numbers — see that
// file's own comments for the full history of why this shape, specifically,
// is correct. ShowcaseScene.tsx itself was deliberately left using its own
// local `Rig` rather than swapped to this component, to avoid risking a
// regression on a shipped page for a low-value refactor.
export interface DriftRigProps {
  cameraFrom: [number, number, number];
  cameraTo: [number, number, number];
  introSeconds?: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  baseAutoRotateSpeed?: number;
  minSpeedFraction?: number;
  enableRotate?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
}

export default function DriftRig({
  cameraFrom,
  cameraTo,
  introSeconds = 1.8,
  minAzimuthAngle,
  maxAzimuthAngle,
  minPolarAngle = Math.PI / 2 - 0.3,
  maxPolarAngle = Math.PI / 2 + 0.15,
  baseAutoRotateSpeed = 3.5,
  minSpeedFraction = 0.18,
  enableRotate = true,
  enableZoom = false,
  enablePan = false,
}: DriftRigProps) {
  const { camera } = useThree();
  const [introDone, setIntroDone] = useState(false);
  const introStart = useRef<number | null>(null);
  const from = useMemo(() => new THREE.Vector3(...cameraFrom), [cameraFrom]);
  const to = useMemo(() => new THREE.Vector3(...cameraTo), [cameraTo]);
  // Loosely typed (any): only .getAzimuthalAngle()/.autoRotateSpeed are
  // used here, and depending on three-stdlib's exact exported OrbitControls
  // type (drei's transitive dependency, not a direct one of this repo) is
  // fragile — same reasoning as the original Rig.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const direction = useRef(1);

  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame(({ clock }) => {
    if (!introDone) {
      if (introStart.current === null) introStart.current = clock.elapsedTime;
      const t = THREE.MathUtils.clamp((clock.elapsedTime - introStart.current) / introSeconds, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(from, to, eased);
      camera.lookAt(0, 0, 0);
      if (t >= 1) setIntroDone(true);
      return;
    }
    const controls = controlsRef.current;
    if (!controls) return;
    const angle = controls.getAzimuthalAngle();
    if (angle >= maxAzimuthAngle) direction.current = -1;
    if (angle <= minAzimuthAngle) direction.current = 1;
    const range = maxAzimuthAngle - minAzimuthAngle;
    const posInRange = THREE.MathUtils.clamp((angle - minAzimuthAngle) / range, 0, 1);
    const easeToward = Math.sin(Math.PI * posInRange); // 0 at both edges, 1 at center
    const speedMag = baseAutoRotateSpeed * (minSpeedFraction + (1 - minSpeedFraction) * easeToward);
    controls.autoRotateSpeed = speedMag * direction.current;
  });

  if (!introDone) return null;

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={enableZoom}
      enablePan={enablePan}
      enableRotate={enableRotate}
      autoRotate
      autoRotateSpeed={baseAutoRotateSpeed}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      minAzimuthAngle={minAzimuthAngle}
      maxAzimuthAngle={maxAzimuthAngle}
      dampingFactor={0.08}
      enableDamping
    />
  );
}
