"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Real extraction of app/showcase/ShowcaseScene.tsx's `Ribbons` — permanent,
// always-visible static tubes tracing each row's real path (rest-state
// density, per docs/design/3d-design-standard.md §2.4's "design the rest
// state first" corollary), with a slow staggered emissive shimmer per row
// (a different phase offset per index, from a fixed golden-ratio hash — not
// synchronized, so it reads as ambient shimmer on real material, not as "an
// event is happening"). Never a traveling particle — that's Pulses.tsx.
export interface RibbonRow {
  curve: THREE.CatmullRomCurve3;
  radius: number;
  color: string;
  /** Base emissive intensity before the shimmer term is added. */
  baseEmissive: number;
}

export default function Ribbons({ rows }: { rows: RibbonRow[] }) {
  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const phaseOffsets = useMemo(() => rows.map((_, i) => (i * 0.6180339887) % (Math.PI * 2)), [rows]);

  useFrame(({ clock }) => {
    materials.current.forEach((mat, i) => {
      if (!mat) return;
      const shimmer = 0.14 * Math.sin(clock.elapsedTime * 0.5 + phaseOffsets[i]);
      mat.emissiveIntensity = Math.max(rows[i].baseEmissive + shimmer, 0.1);
    });
  });

  return (
    <>
      {rows.map(({ curve, radius, color, baseEmissive }, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 32, radius, 6, false]} />
          <meshStandardMaterial
            ref={(m) => {
              materials.current[i] = m;
            }}
            color={color}
            emissive={color}
            emissiveIntensity={baseEmissive}
            transparent
            opacity={0.55}
            roughness={0.5}
          />
        </mesh>
      ))}
    </>
  );
}
