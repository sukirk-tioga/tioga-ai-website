"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

// Real extraction of the Gate idiom shared, byte-for-byte in spirit, by
// app/showcase/ShowcaseScene.tsx and app/demos/agent-checkpoint-walk/Scene.tsx
// (both duplicated it inline rather than importing it — see this repo's own
// docs/design/3d-design-standard.md build-plan note calling that out as a
// gap to close "for real" on the next 3D pilot). Parameterized on color only
// — geometry/behavior (halo, glass pane, scan ring, frame, breathing
// envelope-follower on `activity`) is identical to both prior
// implementations. `activity` (0..1) should be driven by a real
// crossing/event signal, per docs/design/3d-design-standard.md §3.1 — never
// a decorative timer.
export interface GateProps {
  position?: [number, number, number];
  /** Frame bar base color (accentDark in prior scenes). */
  frameColor: string;
  /** Frame emissive / halo / glass pane / scan ring color (accent in prior scenes). */
  glowColor: string;
  activity: React.MutableRefObject<number>;
  frameWidth?: number;
  frameHeight?: number;
}

export default function Gate({
  position = [0, 0, 0],
  frameColor,
  glowColor,
  activity,
  frameWidth = 1.0,
  frameHeight = 1.7,
}: GateProps) {
  const frameMaterials = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const haloMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const scanRingRef = useRef<THREE.Mesh>(null);
  const scanRingMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const glassPaneRef = useRef<THREE.Mesh>(null);
  const displayedActivity = useRef(0);

  useFrame(({ clock }, delta) => {
    const target = activity.current;
    const rate = target > displayedActivity.current ? 14 : 3.2;
    displayedActivity.current += (target - displayedActivity.current) * Math.min(delta * rate, 1);
    const activityLevel = displayedActivity.current;

    const breathe = 0.55 + 0.2 * Math.sin(clock.elapsedTime * 0.7);
    const boost = activityLevel * 1.4;
    frameMaterials.current.forEach((mat) => {
      if (mat) mat.emissiveIntensity = breathe + boost;
    });
    if (haloMaterial.current) haloMaterial.current.opacity = 0.16 + activityLevel * 0.3;
    if (scanRingRef.current) scanRingRef.current.rotation.z = clock.elapsedTime * 0.9;
    if (scanRingMaterial.current) {
      scanRingMaterial.current.opacity = 0.35 + 0.25 * Math.sin(clock.elapsedTime * 1.1);
    }
    if (glassPaneRef.current) {
      const s = 1 + 0.015 * Math.sin(clock.elapsedTime * 0.9) + activityLevel * 0.06;
      glassPaneRef.current.scale.setScalar(s);
    }
  });

  const bar = 0.09;

  return (
    <group position={position}>
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[1.5, 40]} />
        <meshBasicMaterial
          ref={haloMaterial}
          color={glowColor}
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={glassPaneRef} position={[0, 0, -0.02]}>
        <circleGeometry args={[0.62, 48]} />
        <MeshTransmissionMaterial
          color={glowColor}
          roughness={0}
          transmission={1}
          thickness={2}
          ior={1.4}
          chromaticAberration={0.04}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 400]}
          distortion={0.15}
          distortionScale={0.3}
          temporalDistortion={0.08}
          backside
        />
      </mesh>
      <mesh ref={scanRingRef} position={[0, 0, -0.01]}>
        <ringGeometry args={[0.68, 0.74, 6, 1, 0, Math.PI * 1.3]} />
        <meshBasicMaterial
          ref={scanRingMaterial}
          color={glowColor}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {[
        { pos: [-frameWidth / 2, 0, 0], size: [bar, frameHeight, bar] },
        { pos: [frameWidth / 2, 0, 0], size: [bar, frameHeight, bar] },
        { pos: [0, frameHeight / 2, 0], size: [frameWidth, bar, bar] },
        { pos: [0, -frameHeight / 2, 0], size: [frameWidth, bar, bar] },
      ].map((piece, i) => (
        <mesh key={i} position={piece.pos as [number, number, number]}>
          <boxGeometry args={piece.size as [number, number, number]} />
          <meshStandardMaterial
            ref={(m) => {
              frameMaterials.current[i] = m;
            }}
            color={frameColor}
            emissive={glowColor}
            emissiveIntensity={0.55}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
