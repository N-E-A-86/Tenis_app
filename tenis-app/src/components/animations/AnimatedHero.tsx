"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";

const TennisBall3D = dynamic(() => import("./TennisBall3D"), { ssr: false });

export default function AnimatedHero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-black to-black" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight"
            >
              Reservá tu{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                cancha de tenis
              </span>{" "}
              en segundos
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-lg text-gray-400 max-w-lg"
            >
              Gestioná tus reservas, pagá con Mercado Pago y disfrutá del mejor
              tenis. Sin complicaciones, sin llamadas.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <a
                href="/canchas"
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/25"
              >
                Ver canchas
              </a>
              <a
                href="/register"
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all backdrop-blur-sm"
              >
                Registrarse
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 flex gap-8"
            >
              <div>
                <div className="text-2xl font-bold text-white">4</div>
                <div className="text-sm text-gray-500">Canchas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">08-00</div>
                <div className="text-sm text-gray-500">Horario</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">MP</div>
                <div className="text-sm text-gray-500">Pago seguro</div>
              </div>
            </motion.div>
          </motion.div>

          {/* 3D Ball */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:block h-[70vh] relative"
          >
            <TennisBall3D />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center"
        >
          <motion.div className="w-1 h-3 bg-emerald-400 rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  );
}
