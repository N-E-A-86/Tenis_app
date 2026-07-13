"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh, Group, MeshBasicMaterial } from "three";
import gsap from "gsap";
import { createColorTexture, createBumpTexture } from "@/lib/tennis-ball-textures";

// ═══════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════

interface Anim {
  paddleX: number;    // paddle position (enters from right)
  paddleAngle: number; // paddle rotation (windup & swing)
  ballZ: number;      // ball depth
  ballScale: number;
  ballSquash: number;
  impactGlow: number; // 0-1
}

// ═══════════════════════════════════════════════════════
// Paddle (simplified — just the paddle face)
// ═══════════════════════════════════════════════════════

function Paddle({ anim }: { anim: React.MutableRefObject<Anim> }) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x = anim.current.paddleX;
    groupRef.current.rotation.z = anim.current.paddleAngle;
  });

  return (
    <group ref={groupRef} position={[2, 0.3, 1.2]}>
      {/* Handle */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.03, 0.035, 0.25, 8]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      {/* Paddle face */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.28, 0.35, 0.025]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      {/* Perforations */}
      {[
        [-0.07, 0.15], [0.07, 0.15],
        [-0.07, 0.08], [0.07, 0.08],
        [-0.07, -0.02], [0.07, -0.02],
        [-0.04, -0.1], [0.04, -0.1],
        [0, 0.12], [0, 0.04],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.014]}>
          <circleGeometry args={[0.015, 6]} />
          <meshBasicMaterial color="#2a2a2a" />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// Ball
// ═══════════════════════════════════════════════════════

function Ball({ anim }: { anim: React.MutableRefObject<Anim> }) {
  const ref = useRef<Mesh>(null);
  const colorMap = useMemo(() => createColorTexture(), []);
  const bumpMap = useMemo(() => createBumpTexture(), []);

  useFrame(() => {
    if (!ref.current) return;
    const s = anim.current;
    ref.current.position.z = s.ballZ;
    const base = s.ballScale;
    ref.current.scale.set(base, base * s.ballSquash, base);
  });

  return (
    <mesh ref={ref} position={[0, 0.3, 1.5]}>
      <sphereGeometry args={[0.45, 32, 32]} />
      <meshStandardMaterial
        map={colorMap}
        bumpMap={bumpMap}
        bumpScale={0.008}
        roughness={0.8}
        metalness={0}
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════
// Impact glow
// ═══════════════════════════════════════════════════════

function ImpactGlow({ anim }: { anim: React.MutableRefObject<Anim> }) {
  const ref = useRef<Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const mat = ref.current.material as MeshBasicMaterial;
    mat.opacity = anim.current.impactGlow * 0.6;
    const s = 1 + anim.current.impactGlow * 2;
    ref.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={ref} position={[0, 0.3, 1.5]}>
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshBasicMaterial color="#FFFFCC" transparent opacity={0} />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════
// Scene
// ═══════════════════════════════════════════════════════

function SplashScene({ onFlash, onDone }: { onFlash: () => void; onDone: () => void }) {
  const anim = useRef<Anim>({
    paddleX: 2,
    paddleAngle: 0,
    ballZ: 1.5,
    ballScale: 0.5,
    ballSquash: 1,
    impactGlow: 0,
  });

  useEffect(() => {
    const s = anim.current;
    const tl = gsap.timeline({ onComplete: onDone });

    // 0.00s — Paddle slides in from right
    tl.to(s, { paddleX: 1.2, duration: 0.25, ease: "power2.out" });

    // 0.25s — Wind up (paddle goes back)
    tl.to(s, { paddleAngle: -0.4, duration: 0.2, ease: "power2.out" });

    // 0.45s — SWING forward
    tl.to(s, { paddleAngle: 0.15, duration: 0.08, ease: "power4.in" });

    // 0.53s — Impact: ball squashes + glow burst
    tl.to(s, { ballSquash: 0.4, duration: 0.03, ease: "none" });
    tl.to(s, { impactGlow: 1, duration: 0.03, ease: "none" }, "<");

    // 0.56s — Ball decompress + glow dies
    tl.to(s, { ballSquash: 1, duration: 0.06, ease: "power2.out" });
    tl.to(s, { impactGlow: 0, duration: 0.15, ease: "power2.out" }, "<");

    // 0.62s — Ball launches toward camera
    tl.to(s, {
      ballZ: -4.5,
      ballScale: 6,
      duration: 0.6,
      ease: "power4.out",
    });

    // 1.22s — Flash white
    tl.call(() => onFlash());

    // 1.27s — Brief hold
    tl.to({}, { duration: 0.25 });

    // Total: ~1.52s
    return () => {
      tl.kill();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Subtle court grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial color="#0a2a1a" transparent opacity={0.2} wireframe />
      </mesh>

      <Paddle anim={anim} />
      <Ball anim={anim} />
      <ImpactGlow anim={anim} />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// Wrapper
// ═══════════════════════════════════════════════════════

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [flash, setFlash] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Flash overlay */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-150 pointer-events-none ${
          flash ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "#fff" }}
      />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 2, -2]} intensity={0.2} color="#FFF5D0" />
        <SplashScene
          onFlash={() => setFlash(true)}
          onDone={() => setTimeout(onFinish, 300)}
        />
      </Canvas>
    </div>
  );
}
