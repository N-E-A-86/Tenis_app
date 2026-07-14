"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatPrice, cn } from "@/lib/utils";

type ReportType = "reservations" | "revenue" | "courts" | "daily";

const TABS: { key: ReportType; label: string }[] = [
  { key: "reservations", label: "Reservas" },
  { key: "revenue", label: "Ingresos" },
  { key: "courts", label: "Por cancha" },
  { key: "daily", label: "Diario" },
];

const COLUMN_LABELS: Record<string, string> = {
  date: "Fecha",
  hour: "Hora",
  court: "Cancha",
  user: "Usuario",
  status: "Estado",
  amount: "Monto",
  payment: "Pago",
  name: "Cancha",
  count: "Reservas",
  revenue: "Ingresos",
  day: "Día",
  confirmed: "Confirmadas",
  cancelled: "Canceladas",
  totalReservations: "Total",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
  APPROVED: "Aprobado",
};

function formatAmount(v: unknown): string {
  if (typeof v === "number") return formatPrice(v);
  return String(v ?? "—");
}

function formatCell(key: string, value: unknown): string {
  if (key === "amount" || key === "revenue") return formatAmount(value);
  if (key === "status" || key === "payment") return STATUS_LABELS[String(value)] ?? String(value ?? "—");
  return String(value ?? "—");
}

export default function ReportesPage() {
  const [tab, setTab] = useState<ReportType>("reservations");
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchReport = useCallback(async (exportCsv = false) => {
    setLoading(true);
    const params = new URLSearchParams({ type: tab });
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    if (exportCsv) params.set("format", "csv");

    try {
      if (exportCsv) {
        setExporting(true);
        const res = await fetch(`/api/admin/reports/export?${params}`);
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reporte-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        return;
      }

      const res = await fetch(`/api/admin/reports/export?${params}`);
      const json = await res.json();
      setData(json.data ?? []);
      setHeaders(json.headers ?? []);
      setTotal(json.total ?? 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setExporting(false);
    }
  }, [tab, from, to]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Reportes</h1>
        {data.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            loading={exporting}
            onClick={() => fetchReport(true)}
          >
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setData([]);
            }}
            className={cn(
              "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-gray-400 hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            />
          </div>
          <Button size="sm" onClick={() => fetchReport()} loading={loading}>
            Generar
          </Button>
          {(from || to) && (
            <button
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              className="text-sm text-gray-400 hover:text-white"
            >
              Limpiar
            </button>
          )}
        </div>
      </Card>

      {/* Tabla */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-400">
            {from || to
              ? "Sin datos para el período seleccionado"
              : "Seleccioná un rango y presioná Generar"}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {headers.map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-gray-400 font-medium whitespace-nowrap"
                  >
                    {COLUMN_LABELS[h] ?? h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {headers.map((h) => (
                    <td key={h} className="px-4 py-3 text-white whitespace-nowrap">
                      {formatCell(h, row[h])}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
            <span>{total} registros</span>
            {tab === "revenue" && (
              <span className="text-emerald-400 font-medium">
                Total: {formatPrice(
                  data.reduce((sum: number, r: Record<string, unknown>) => sum + Number(r.amount ?? 0), 0)
                )}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}