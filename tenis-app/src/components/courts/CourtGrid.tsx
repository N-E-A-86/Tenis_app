"use client";

import { useState, useEffect } from "react";
import CourtCard from "./CourtCard";
import type { CourtData } from "@/types";

export default function CourtGrid() {
  const [courts, setCourts] = useState<CourtData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourts(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-72 bg-white/5 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (courts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">
          No hay canchas disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courts.map((court, index) => (
        <CourtCard key={court.id} court={court} index={index} />
      ))}
    </div>
  );
}
