"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Phase 0 de-risk spike: trivial placeholder only, not the real scene.
// Color is read from the CSS token at runtime (never a hex literal in this
// file, not even as a fallback) per the sanctioned pattern in the 3D
// showcase plan §4 — there's no theme switching on this site, so reading
// once on mount is sufficient. Both tokens are verified present in
// globals.css's `:root` block, so the "white" fallback (a named CSS
// keyword, not a hex literal) is a defensive no-op, not an expected path.
function readToken(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || "white";
}

function RotatingShape({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.4, 0]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
}

export default function ShowcaseScene() {
  const [tokens, setTokens] = useState<{ accent: string; bgDarker: string } | null>(null);

  useEffect(() => {
    setTokens({
      accent: readToken("--accent"),
      bgDarker: readToken("--bg-darker"),
    });
  }, []);

  if (!tokens) return null;

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <color attach="background" args={[tokens.bgDarker]} />
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.4} />
      <RotatingShape color={tokens.accent} />
    </Canvas>
  );
}
