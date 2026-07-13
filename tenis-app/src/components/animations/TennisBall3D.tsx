"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Mesh, CanvasTexture, RepeatWrapping } from "three";

// ═══════════════════════════════════════════════════════
// Procedural textures
// ═══════════════════════════════════════════════════════

function createColorTexture(size = 1024): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // 1. Base — optic yellow
  ctx.fillStyle = "#DDF15E";
  ctx.fillRect(0, 0, size, size);

  // 2. Fuzz — tiny white dots
  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const a = Math.random() * 0.055;
    ctx.fillStyle = `rgba(255, 255, 220, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Seams — figure-8 pattern with depth
  const drawSeam = (
    x1: number, y1: number,            // start
    c1x: number, c1y: number,           // first control
    c2x: number, c2y: number,           // second control
    x2: number, y2: number,             // end
    c3x: number, c3y: number,           // third control
    c4x: number, c4y: number,           // fourth control
    x3: number, y3: number,             // final end
  ) => {
    // Shadow / depression first
    ctx.shadowColor = "rgba(80, 90, 30, 0.3)";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(160, 180, 60, 0.1)";
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();

    // White seam
    ctx.shadowColor = "rgba(100, 100, 50, 0.2)";
    ctx.shadowBlur = 6;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();

    // Fuzz overlay on seam
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();
  };

  const S = size;

  // Upper seam
  drawSeam(
    0, S * 0.28,
    S * 0.22, S * 0.18,
    S * 0.22, S * 0.56,
    S * 0.5, S * 0.56,
    S * 0.78, S * 0.56,
    S * 0.78, S * 0.18,
    S, S * 0.28,
  );

  // Lower seam (mirrored)
  drawSeam(
    0, S * 0.72,
    S * 0.22, S * 0.82,
    S * 0.22, S * 0.44,
    S * 0.5, S * 0.44,
    S * 0.78, S * 0.44,
    S * 0.78, S * 0.82,
    S, S * 0.72,
  );

  // 4. Subtle darker variation
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const a = Math.random() * 0.02;
    ctx.fillStyle = `rgba(140, 160, 50, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  return tex;
}

function createBumpTexture(size = 512): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Mid-gray base
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  // Noise dots — fuzzy pile feel
  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = Math.random() * 50 + 103; // 103–153, centered ~128
    ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.8 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Seam grooves (darker = recessed in bump map)
  ctx.strokeStyle = "#585858";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.28);
  ctx.bezierCurveTo(size * 0.22, size * 0.18, size * 0.22, size * 0.56, size * 0.5, size * 0.56);
  ctx.bezierCurveTo(size * 0.78, size * 0.56, size * 0.78, size * 0.18, size, size * 0.28);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, size * 0.72);
  ctx.bezierCurveTo(size * 0.22, size * 0.82, size * 0.22, size * 0.44, size * 0.5, size * 0.44);
  ctx.bezierCurveTo(size * 0.78, size * 0.44, size * 0.78, size * 0.82, size, size * 0.72);
  ctx.stroke();

  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  return tex;
}

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
