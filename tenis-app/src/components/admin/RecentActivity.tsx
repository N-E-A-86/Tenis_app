"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";

interface ActivityItem {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  user: { name: string | null; email: string } | null;
  court: { name: string } | null;
  payment: { amount: number; status: string } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-500/20 text-yellow-300" },
  CONFIRMED: { label: "Confirmada", color: "bg-emerald-500/20 text-emerald-300" },
  CANCELLED: { label: "Cancelada", color: "bg-red-500/20 text-red-300" },
  COMPLETED: { label: "Completada", color: "bg-gray-500/20 text-gray-300" },
};

export default function RecentActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats/recent?limit=10")
      .then((res) => res.json())
      .then((json) => {
        setItems(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Actividad reciente</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Actividad reciente
      </h3>

      {items.length === 0 ? (
        <div className="py-8 text-center text-gray-500 text-sm">
          Sin actividad todavía
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((item, i) => {
            const status = STATUS_LABELS[item.status] ?? STATUS_LABELS.PENDING;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">
                      {item.court?.name ?? "Cancha"} ·{" "}
                      {item.user?.name || item.user?.email || "Anónimo"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(item.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-emerald-400 font-medium">
                    {formatPrice(item.totalAmount)}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${status.color}`}>
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
