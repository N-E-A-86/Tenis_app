"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  totalCourts: number;
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  todayReservations: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = [
    {
      label: "Canchas activas",
      value: stats?.totalCourts ?? "—",
      icon: "🎾",
      color: "from-emerald-900/40",
    },
    {
      label: "Reservas hoy",
      value: stats?.todayReservations ?? "—",
      icon: "📅",
      color: "from-blue-900/40",
    },
    {
      label: "Confirmadas",
      value: stats?.confirmedReservations ?? "—",
      icon: "✅",
      color: "from-green-900/40",
    },
    {
      label: "Pendientes",
      value: stats?.pendingReservations ?? "—",
      icon: "⏳",
      color: "from-yellow-900/40",
    },
    {
      label: "Usuarios",
      value: stats?.totalUsers ?? "—",
      icon: "👥",
      color: "from-purple-900/40",
    },
    {
      label: "Ingresos totales",
      value: stats?.revenue ? formatPrice(stats.revenue) : "$0",
      icon: "💰",
      color: "from-emerald-900/40",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`p-6 bg-gradient-to-br ${card.color} to-black/50`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{card.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {card.value}
                  </p>
                </div>
                <span className="text-3xl">{card.icon}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
