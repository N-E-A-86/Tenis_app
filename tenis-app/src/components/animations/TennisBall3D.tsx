"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Mesh } from "three";
import { createColorTexture, createBumpTexture } from "@/lib/tennis-ball-textures";

// ═══════════════════════════════════════════════════════
// Ball
// ═══════════════════════════════════════════════════════

function Ball() {
  const ref = useRef<Mesh>(null);
  const colorMap = useMemo(() => createColorTexture(), []);
  const bumpMap = useMemo(() => createBumpTexture(), []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    // Slow Y spin
    ref.current.rotation.y += delta * 0.4;
    // Gentle natural wobble
    const t = Date.now() * 0.0003;
    ref.current.rotation.x = Math.sin(t) * 0.06;
    ref.current.rotation.z = Math.cos(t * 0.7) * 0.03;
  });

  return (
    <Float speed={0.9} rotationIntensity={0.08} floatIntensity={0.4}>
      <mesh ref={ref} scale={2.5}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.018}
          roughness={0.82}
          metalness={0}
        />
      </mesh>
    </Float>
  );
}

// ═══════════════════════════════════════════════════════
// Scene
// ═══════════════════════════════════════════════════════

const isMobile =
  typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 6, 6]} intensity={1.0} />
      <directionalLight position={[-4, 2, -4]} intensity={0.25} color="#FFF5D0" />
      {/* Rim / back light */}
      <directionalLight position={[-3, -4, -5]} intensity={0.5} color="#DDF15E" />
      <hemisphereLight args={["#DDF15E", "#222222", 0.15]} />
      <Ball />
    </Canvas>
  );
}

// ═══════════════════════════════════════════════════════
// States
// ═══════════════════════════════════════════════════════

function Spinner() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  );
}

function Fallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <svg
          className="w-20 h-20 mx-auto text-emerald-400/30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <circle cx={12} cy={12} r={10} />
          <path d="M4.5 8.5C7 10 7 14 4.5 15.5" />
          <path d="M19.5 8.5C17 10 17 14 19.5 15.5" />
        </svg>
        <p className="text-sm text-gray-500 mt-3">
          3D no disponible en este navegador
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════

export default function TennisBall3D() {
  const [status, setStatus] = useState<"loading" | "ready" | "unsupported">(
    "loading",
  );

  useEffect(() => {
    // Brief delay so the spinner is visible (feels snappier)
    const timer = setTimeout(() => {
      try {
        const c = document.createElement("canvas");
        const gl =
          c.getContext("webgl") || c.getContext("experimental-webgl");
        setStatus(gl ? "ready" : "unsupported");
      } catch {
        setStatus("unsupported");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (status === "loading") return <Spinner />;
  if (status === "unsupported") return <Fallback />;
  return <Scene />;
}
