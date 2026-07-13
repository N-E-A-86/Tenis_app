"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Mesh, CanvasTexture } from "three";

function createTennisBallTexture(): CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // 1. Base — optic yellow
  ctx.fillStyle = "#DDF15E";
  ctx.fillRect(0, 0, size, size);

  // 2. Fuzz texture — tiny white dots
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = Math.random() * 0.06;
    ctx.fillStyle = `rgba(255, 255, 220, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Seam lines — classic S-curves
  ctx.shadowColor = "rgba(180, 180, 180, 0.2)";
  ctx.shadowBlur = 6;

  // Seam 1 — upper S
  ctx.beginPath();
  ctx.moveTo(0, size * 0.28);
  ctx.bezierCurveTo(
    size * 0.2, size * 0.2,
    size * 0.2, size * 0.55,
    size * 0.5, size * 0.55,
  );
  ctx.bezierCurveTo(
    size * 0.8, size * 0.55,
    size * 0.8, size * 0.2,
    size, size * 0.28,
  );
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 7;
  ctx.stroke();

  // Seam 2 — lower S (mirrored)
  ctx.beginPath();
  ctx.moveTo(0, size * 0.72);
  ctx.bezierCurveTo(
    size * 0.2, size * 0.8,
    size * 0.2, size * 0.45,
    size * 0.5, size * 0.45,
  );
  ctx.bezierCurveTo(
    size * 0.8, size * 0.45,
    size * 0.8, size * 0.8,
    size, size * 0.72,
  );
  ctx.stroke();

  // 4. Soft fuzz over seams (blurred overlay)
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 14;
  // Seam 1 fuzzy overlay
  ctx.beginPath();
  ctx.moveTo(0, size * 0.28);
  ctx.bezierCurveTo(size * 0.2, size * 0.2, size * 0.2, size * 0.55, size * 0.5, size * 0.55);
  ctx.bezierCurveTo(size * 0.8, size * 0.55, size * 0.8, size * 0.2, size, size * 0.28);
  ctx.stroke();
  // Seam 2 fuzzy overlay
  ctx.beginPath();
  ctx.moveTo(0, size * 0.72);
  ctx.bezierCurveTo(size * 0.2, size * 0.8, size * 0.2, size * 0.45, size * 0.5, size * 0.45);
  ctx.bezierCurveTo(size * 0.8, size * 0.45, size * 0.8, size * 0.8, size, size * 0.72);
  ctx.stroke();

  // 5. Subtle darker variation
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = Math.random() * 0.025;
    ctx.fillStyle = `rgba(160, 180, 60, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  return new CanvasTexture(canvas);
}

function Ball() {
  const meshRef = useRef<Mesh>(null);
  const texture = useMemo(() => createTennisBallTexture(), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0004) * 0.08;
      meshRef.current.rotation.z = Math.cos(Date.now() * 0.0003) * 0.04;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
      <mesh ref={meshRef} scale={2.4}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.75}
          metalness={0}
        />
      </mesh>
    </Float>
  );
}

export default function TennisBall3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 6, 6]} intensity={1.2} />
      <directionalLight position={[-4, 2, -4]} intensity={0.3} color="#FFF5D0" />
      <hemisphereLight args={["#DDF15E", "#111111", 0.25]} />
      <Ball />
    </Canvas>
  );
}
