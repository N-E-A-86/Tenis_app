"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";

interface TodayReservation {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  user: { name: string | null; email: string; phone: string | null } | null;
  court: { name: string } | null;
  payment: { amount: number; status: string } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-500/20 text-yellow-300" },
  CONFIRMED: { label: "Confirmada", color: "bg-emerald-500/20 text-emerald-300" },
  CANCELLED: { label: "Cancelada", color: "bg-red-500/20 text-red-300" },
  COMPLETED: { label: "Completada", color: "bg-gray-500/20 text-gray-300" },
};

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function TodayReservations() {
  const [reservations, setReservations] = useState<TodayReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats/today")
      .then((res) => res.json())
      .then((json) => {
        setReservations(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Reservas de hoy</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Reservas de hoy</h3>
        <span className="text-sm text-gray-500">{reservations.length} reservas</span>
      </div>

      {reservations.length === 0 ? (
        <div className="py-8 text-center text-gray-500 text-sm">
          No hay reservas para hoy
        </div>
      ) : (
        <div className="space-y-2">
          {reservations.map((r, i) => {
            const status = STATUS_LABELS[r.status] ?? STATUS_LABELS.PENDING;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-center min-w-[48px]">
                    <p className="text-sm font-medium text-white">
                      {formatHour(r.startTime)}
                    </p>
                    <p className="text-xs text-gray-500">{formatHour(r.endTime)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {r.court?.name ?? "Cancha"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {r.user?.name || r.user?.email || "Anónimo"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-emerald-400 font-medium">
                    {formatPrice(r.totalAmount)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
