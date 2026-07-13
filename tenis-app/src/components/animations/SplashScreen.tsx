"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"intro" | "flash" | "outro">("intro");
  const [flashVisible, setFlashVisible] = useState(false);
  const ballRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Timeline:
    // 0.0s  – Ball visible (small), dark background
    // 0.4s  – Begin scaling up (coming toward camera)
    // 1.0s  – Ball fills view
    // 1.2s  – Flash white
    // 1.6s  – Fade out splash
    // 2.0s  – Homepage

    const t1 = setTimeout(() => setPhase("intro"), 50);
    const t2 = setTimeout(() => {
      setFlashVisible(true);
      setPhase("flash");
    }, 1200);
    const t3 = setTimeout(() => {
      setPhase("outro");
    }, 1500);
    const t4 = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center">
      {/* Ball image */}
      <div
        ref={ballRef}
        className={`relative transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          phase === "intro"
            ? "w-24 h-24 opacity-0 scale-50"
            : phase === "flash"
              ? "w-[200vw] h-[200vw] opacity-100 scale-100"
              : "w-[200vw] h-[200vw] opacity-0 scale-125"
        }`}
      >
        <Image
          src="/images/pelota-tenis.jpg"
          alt="Tennis ball"
          fill
          className="object-contain"
          priority
          unoptimized
          sizes="100vw"
        />
      </div>

      {/* Glow behind ball */}
      <div
        className={`absolute rounded-full bg-yellow-300/10 blur-3xl transition-all duration-[900ms] ${
          phase === "intro"
            ? "w-0 h-0 opacity-0"
            : "w-96 h-96 opacity-100"
        }`}
      />

      {/* Flash overlay */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-200 ${
          flashVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "#fff" }}
      />
    </div>
  );
}
