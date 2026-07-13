"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import {
  CourtClayIcon,
  CourtHardIcon,
  CourtGrassIcon,
  CourtSyntheticIcon,
} from "@/components/ui/Icons";
import type { CourtData, SurfaceType } from "@/types";

const surfaceLabels: Record<SurfaceType, string> = {
  CLAY: "Polvo de ladrillo",
  HARD: "Dura",
  GRASS: "Césped",
  SYNTHETIC: "Sintética",
};

const surfaceColors: Record<SurfaceType, string> = {
  CLAY: "bg-amber-700/30 text-amber-300 border-amber-700/50",
  HARD: "bg-blue-700/30 text-blue-300 border-blue-700/50",
  GRASS: "bg-green-700/30 text-green-300 border-green-700/50",
  SYNTHETIC: "bg-purple-700/30 text-purple-300 border-purple-700/50",
};

const surfaceIcons: Record<SurfaceType, typeof CourtClayIcon> = {
  CLAY: CourtClayIcon,
  HARD: CourtHardIcon,
  GRASS: CourtGrassIcon,
  SYNTHETIC: CourtSyntheticIcon,
};

interface CourtCardProps {
  court: CourtData;
  index: number;
}

export default function CourtCard({ court, index }: CourtCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/canchas/${court.id}`}>
        <Card hover className="group cursor-pointer h-full">
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-emerald-900/50 to-black overflow-hidden">
            {court.imageUrl ? (
              <Image
                src={court.imageUrl}
                alt={court.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {(() => {
                  const Icon = surfaceIcons[court.surfaceType as SurfaceType] || CourtClayIcon;
                  return <Icon size={80} className="opacity-15" />;
                })()}
              </div>
            )}
            <div className="absolute top-3 right-3">
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full border ${surfaceColors[court.surfaceType as SurfaceType] || surfaceColors.CLAY}`}
              >
                {surfaceLabels[court.surfaceType as SurfaceType] || court.surfaceType}
              </span>
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
              {court.name}
            </h3>
            {court.description && (
              <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                {court.description}
              </p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-emerald-400 font-bold text-lg">
                {formatPrice(court.pricePerHour)}
              </span>
              <span className="text-sm text-gray-500">/ hora</span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
