"use client";

import { type ReactNode } from "react";
import { LazyMotion } from "framer-motion";

const loadFeatures = () =>
  import("@/lib/motion-features").then((mod) => mod.default);

export default function AnimationProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
