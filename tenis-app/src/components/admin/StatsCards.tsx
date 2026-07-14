"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";

interface StatsData {
  totalUsers: number;
  totalCourts: number;
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  todayReservations: number;
  revenue: number;
}

interface StatsCardsProps {
  stats: StatsData | null;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Canchas activas",
      value: stats?.totalCourts ?? "—",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="8" opacity="0.3" />
        </svg>
      ),
      color: "from-emerald-900/40",
    },
    {
      label: "Reservas hoy",
      value: stats?.todayReservations ?? "—",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      color: "from-blue-900/40",
    },
    {
      label: "Confirmadas",
      value: stats?.confirmedReservations ?? "—",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: "from-green-900/40",
    },
    {
      label: "Pendientes",
      value: stats?.pendingReservations ?? "—",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      color: "from-yellow-900/40",
    },
    {
      label: "Usuarios",
      value: stats?.totalUsers ?? "—",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      color: "from-purple-900/40",
    },
    {
      label: "Ingresos totales",
      value: stats?.revenue ? formatPrice(stats.revenue) : "$0",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      color: "from-emerald-900/40",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <Card className={`p-5 bg-gradient-to-br ${card.color} to-black/50`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {card.value}
                </p>
              </div>
              <span className="text-emerald-400/60">{card.icon}</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
