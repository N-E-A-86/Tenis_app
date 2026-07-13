"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Mesh, Group, MeshBasicMaterial } from "three";
import gsap from "gsap";
import { createColorTexture, createBumpTexture } from "@/lib/tennis-ball-textures";

// ── Animation state shape ──────────────────────────────

interface AnimState {
  armAngle: number;   // radians — paddle arm rotation
  ballZ: number;      // ball depth
  ballScale: number;  // ball uniform scale
  ballSquash: number; // y squash on impact (1 = normal)
  glow: number;       // 0-1 rim glow intensity
  flash: number;      // 0-1 white flash overlay
}

// ── Player figure ──────────────────────────────────────

const NEON = "#10b981";
const DIM = "#065f46";

function PlayerBody() {
  return (
    <group position={[0, 0, 0]}>
      {/* Torso */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.32, 0.42, 0.75, 12]} />
        <meshBasicMaterial color={NEON} transparent opacity={0.5} wireframe />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial color={NEON} transparent opacity={0.6} />
      </mesh>
      {/* Legs */}
      {([[-0.15, 0.25, 0], [0.15, 0.25, 0]] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
          <meshBasicMaterial color={DIM} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ── Paddle ─────────────────────────────────────────────

const PADDLE_W = 0.25;
const PADDLE_H = 0.32;

function Paddle() {
  return (
    <group position={[0, -0.4, 0]}>
      {/* Handle */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.14, 8]} />
        <meshBasicMaterial color="#555" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[PADDLE_W, PADDLE_H, 0.02]} />
        <meshBasicMaterial color="#222" />
      </mesh>
      {/* Perforations */}
      {[
        [-0.06, 0.02], [0.06, 0.02],
        [-0.06, 0.1], [0.06, 0.1],
        [-0.06, 0.18], [0.06, 0.18],
        [0, 0.06], [0, 0.14],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.011]}>
          <circleGeometry args={[0.015, 8]} />
          <meshBasicMaterial color="#333" />
        </mesh>
      ))}
    </group>
  );
}

// ── Arm assembly ───────────────────────────────────────

function Arm({ anim }: { anim: React.MutableRefObject<AnimState> }) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // The arm pivots at the shoulder
    groupRef.current.rotation.z = anim.current.armAngle;
  });

  return (
    <group ref={groupRef} position={[0.32, 0.95, 0]}>
      {/* Upper arm */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.4, 8]} />
        <meshBasicMaterial color={NEON} transparent opacity={0.6} />
      </mesh>
      {/* Forearm + paddle */}
      <group position={[0, -0.42, 0]}>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.2, 8]} />
          <meshBasicMaterial color={DIM} transparent opacity={0.5} />
        </mesh>
        <Paddle />
      </group>
    </group>
  );
}

// ── Court floor ────────────────────────────────────────

function CourtFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
      <planeGeometry args={[6, 6]} />
      <meshBasicMaterial color="#0a2a1a" transparent opacity={0.3} wireframe />
    </mesh>
  );
}

// ── Ball ───────────────────────────────────────────────

function SplashBall({ anim }: { anim: React.MutableRefObject<AnimState> }) {
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
    <mesh ref={ref} position={[0.15, 0.5, 1.8]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial
        map={colorMap}
        bumpMap={bumpMap}
        bumpScale={0.015}
        roughness={0.8}
        metalness={0}
      />
    </mesh>
  );
}

// ── Splash scene (R3F) ─────────────────────────────────

function SplashScene({ onFlash, onDone }: { onFlash: () => void; onDone: () => void }) {
  const anim = useRef<AnimState>({
    armAngle: -0.2,
    ballZ: 1.8,
    ballScale: 0.3,
    ballSquash: 1,
    glow: 0,
    flash: 0,
  });

  const flashOverlay = useRef<Mesh>(null);

  useEffect(() => {
    const s = anim.current;

    const tl = gsap.timeline({
      onComplete: () => {
        onDone();
      },
    });

    // 0.0s – Breathe / hold
    tl.to({}, { duration: 0.3 });

    // 0.3s – Wind up: arm goes back
    tl.to(s, {
      armAngle: -0.6,
      duration: 0.25,
      ease: "power2.out",
    });

    // 0.55s – SWING: arm snaps forward
    tl.to(s, {
      armAngle: 0.5,
      duration: 0.12,
      ease: "power4.in",
    });

    // 0.67s – Ball compression at contact
    tl.to(s, {
      ballSquash: 0.45,
      duration: 0.04,
      ease: "none",
    });

    // 0.71s – Ball decompress
    tl.to(s, {
      ballSquash: 1,
      duration: 0.06,
      ease: "power2.out",
    });

    // 0.77s – Ball launch toward camera
    tl.to(s, {
      ballZ: -4,
      ballScale: 8,
      duration: 0.7,
      ease: "power4.out",
    });

    // 1.47s – Flash overlay
    tl.call(() => onFlash());
    tl.to(s, { flash: 1, duration: 0.05, ease: "none" });

    // 1.57s – Hold flash, begin fade
    tl.to({}, { duration: 0.25 });

    // 1.82s – Done (total ~2.1s)
    // onComplete fires here

    return () => {
      tl.kill();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Render flash overlay in 3D space
  useFrame(() => {
    if (!flashOverlay.current) return;
    const mat = flashOverlay.current.material as MeshBasicMaterial;
    mat.opacity = anim.current.flash;
  });

  return (
    <>
      <CourtFloor />
      <PlayerBody />
      <Arm anim={anim} />
      <SplashBall anim={anim} />

      {/* Flash overlay (3D quad covering the view) */}
      <mesh ref={flashOverlay} position={[0, 0, -5]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="white" transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

// ── Main wrapper ───────────────────────────────────────

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [flash, setFlash] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* CSS flash overlay (front layer) */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-100 pointer-events-none ${
          flash ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "#fff" }}
      />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[4, 6, 4]} intensity={0.8} />
        <directionalLight position={[-3, 2, -2]} intensity={0.2} color="#FFF5D0" />
        <SplashScene
          onFlash={() => setFlash(true)}
          onDone={() => {
            setTimeout(onFinish, 400);
          }}
        />
      </Canvas>
    </div>
  );
}
