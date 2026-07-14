"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";

interface RevenuePoint {
  month: string;
  revenue: number;
  reservations: number;
}

interface RevenueChartProps {
  from?: string;
  to?: string;
}

function formatMonth(iso: string): string {
  const [year, month] = iso.split("-");
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
}

function formatTooltip(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RevenueChart({ from, to }: RevenueChartProps) {
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    fetch(`/api/admin/stats/revenue?${params}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [from, to]);

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ingresos</h3>
        <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Ingresos por mes</h3>
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          Sin datos en este período
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "13px",
                }}
                formatter={(value) => [formatTooltip(value as number), "Ingresos"]}
                labelFormatter={(label) => String(label)}
              />
              <Bar
                dataKey="revenue"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
