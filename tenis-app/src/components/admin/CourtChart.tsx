"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Card from "@/components/ui/Card";

interface CourtData {
  name: string;
  count: number;
  revenue: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899"];

function formatTooltip(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CourtChart() {
  const [data, setData] = useState<CourtData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats/courts")
      .then((res) => res.json())
      .then((json) => {
        setData(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Reservas por cancha</h3>
        <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
      </Card>
    );
  }

  const totalReservations = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Reservas por cancha
      </h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          Sin datos todavía
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "13px",
                }}
                formatter={(value, name) => [
                  `${name} · ${(((value as number) / totalReservations) * 100).toFixed(0)}%`,
                  "Reservas",
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
