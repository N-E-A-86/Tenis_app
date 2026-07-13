"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

export default function AnimatedHero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/foto-portada.jpg"
        alt=""
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Subtle light gradient overlay for readability at edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/30" />

      {/* Decorative blur effects (light version) */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
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
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight"
            >
              Reservá tu{" "}
              <span className="text-emerald-700">
                cancha de tenis
              </span>{" "}
              en segundos
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-base sm:text-lg text-black max-w-lg font-medium"
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
                className="px-6 sm:px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-600/30"
              >
                Ver canchas
              </a>
              <a
                href="/register"
                className="px-6 sm:px-8 py-3 bg-black/10 hover:bg-black/20 text-black rounded-lg font-medium transition-all backdrop-blur-sm border border-black/20"
              >
                Registrarse
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-10 flex gap-6 sm:gap-8"
            >
              <div>
                <div className="text-xl sm:text-2xl font-bold text-black">4</div>
                <div className="text-xs sm:text-sm text-black font-medium">Canchas</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-black">08-00</div>
                <div className="text-xs sm:text-sm text-black font-medium">Horario</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-black">MP</div>
                <div className="text-xs sm:text-sm text-black font-medium">Pago seguro</div>
              </div>
            </motion.div>
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
          className="w-6 h-10 border-2 border-black/20 rounded-full flex justify-center"
        >
          <motion.div className="w-1 h-3 bg-emerald-600 rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  );
}
