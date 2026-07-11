"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { Mesh } from "three";

function Ball() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={1.5}>
      <mesh ref={meshRef} scale={2.2}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#10b981"
          emissive="#059669"
          emissiveIntensity={0.15}
          roughness={0.3}
          metalness={0.1}
          distort={0.15}
          speed={2}
        />
      </mesh>
      {/* Anillo orbital */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.8}>
        <ringGeometry args={[1.3, 1.5, 64]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.2} side={2} />
      </mesh>
    </Float>
  );
}

export default function TennisBall3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#10b981" />
      <Ball />
    </Canvas>
  );
}
