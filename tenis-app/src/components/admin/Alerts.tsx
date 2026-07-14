"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";

interface AlertReservation {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  user: { name: string | null; email: string } | null;
  court: { name: string } | null;
  payment: { amount: number; status: string } | null;
}

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function Alerts() {
  const [pending, setPending] = useState<AlertReservation[]>([]);
  const [cancelled, setCancelled] = useState<AlertReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const [pendingRes, cancelledRes] = await Promise.all([
          fetch("/api/admin/reservations?status=PENDING&limit=5"),
          fetch("/api/admin/reservations?status=CANCELLED&limit=5"),
        ]);

        const pendingData = await pendingRes.json();
        const cancelledData = await cancelledRes.json();

        setPending(Array.isArray(pendingData) ? pendingData.slice(0, 5) : []);
        setCancelled(Array.isArray(cancelledData) ? cancelledData.slice(0, 5) : []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Alertas</h3>
        <div className="space-y-3">
          <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </Card>
    );
  }

  const hasAlerts = pending.length > 0 || cancelled.length > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Alertas</h3>
        {(pending.length > 0 || cancelled.length > 0) && (
          <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
            {pending.length + cancelled.length}
          </span>
        )}
      </div>

      {!hasAlerts ? (
        <div className="py-8 text-center text-gray-500 text-sm">
          <svg
            className="w-8 h-8 mx-auto mb-2 text-emerald-500/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Todo en orden, sin alertas
        </div>
      ) : (
        <div className="space-y-3">
          {pending.length > 0 && (
            <div>
              <p className="text-xs font-medium text-yellow-400 uppercase tracking-wider mb-2">
                Pendientes de pago
              </p>
              <div className="space-y-1">
                {pending.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">
                        {r.court?.name ?? "Cancha"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.user?.name || r.user?.email} · {formatHour(r.startTime)}
                      </p>
                    </div>
                    <span className="text-sm text-yellow-400 font-medium">
                      {formatPrice(r.totalAmount)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {cancelled.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">
                Cancelaciones recientes
              </p>
              <div className="space-y-1">
                {cancelled.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">
                        {r.court?.name ?? "Cancha"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.user?.name || r.user?.email} · {formatHour(r.startTime)}
                      </p>
                    </div>
                    <span className="text-sm text-red-400 font-medium">
                      {formatPrice(r.totalAmount)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
