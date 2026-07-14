"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatPrice, formatDate } from "@/lib/utils";

interface Reservation {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  user: { name: string | null; email: string | null } | null;
  court: { name: string | null; id: string } | null;
  payment: {
    id: string;
    amount: number | null;
    status: string | null;
    method: string | null;
    createdAt: string | null;
  } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  CONFIRMED: { label: "Confirmada", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  CANCELLED: { label: "Cancelada", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  COMPLETED: { label: "Completada", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  CANCELLED: [],
  COMPLETED: [],
};

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getPayment(p: any): { amount: number | null; status: string | null; method: string | null; createdAt: string | null } | null {
  if (!p) return null;
  const pay = Array.isArray(p) ? p[0] : p;
  return pay ?? null;
}

function payStatusLabel(status: string | null | undefined): string {
  const s = status?.toLowerCase();
  if (s === "approved" || s === "completed") return "Pagado";
  if (s === "pending") return "Pago pendiente";
  return "—";
}

function payStatusColor(status: string | null): string {
  const s = status?.toLowerCase();
  if (s === "approved" || s === "completed") return "text-emerald-400";
  return "text-yellow-400";
}

function payIsApproved(status: string | null): boolean {
  const s = status?.toLowerCase();
  return s === "approved" || s === "completed";
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [changingId, setChangingId] = useState<string | null>(null);

  function loadReservations() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    if (date) params.set("date", date);

    fetch(`/api/admin/reservations?${params}`)
      .then((res) => res.json())
      .then((data: Reservation[]) => {
        setReservations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadReservations();
  }, [filter, date]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  async function changeStatus(reservationId: string, newStatus: string) {
    setChangingId(reservationId);
    try {
      await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      loadReservations();
    } catch {
      alert("Error al cambiar estado");
    } finally {
      setChangingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Reservas</h1>
        <Button size="sm" variant="outline" onClick={loadReservations}>
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="CONFIRMED">Confirmada</option>
          <option value="CANCELLED">Cancelada</option>
          <option value="COMPLETED">Completada</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
        />
        {(filter || date) && (
          <button
            onClick={() => {
              setFilter("");
              setDate("");
            }}
            className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-400">No se encontraron reservas</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const st = STATUS_LABELS[r.status] ?? STATUS_LABELS.PENDING;
            const transitions = STATUS_TRANSITIONS[r.status] ?? [];
            const isExpanded = expandedId === r.id;

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Fila principal */}
                <button
                  onClick={() => toggleExpand(r.id)}
                  className="w-full text-left"
                >
                  <Card className={`p-4 transition-colors ${isExpanded ? "border-emerald-500/30 bg-white/10" : ""}`}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white truncate">
                            {r.court?.name ?? "Sin cancha"}
                          </h3>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {r.user?.name || r.user?.email || "Anónimo"} ·{" "}
                          {formatDateShort(r.startTime)} – {formatHour(r.endTime)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-emerald-400 font-medium text-sm">
                            {formatPrice(r.totalAmount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payStatusLabel(getPayment(r.payment)?.status)}
                          </p>
                        </div>
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                </button>

                {/* Panel expandido */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Card className="p-6 mt-2 border-emerald-500/20 bg-emerald-500/5">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Detalle */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              Detalle
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Cancha</span>
                                <span className="text-white">{r.court?.name ?? "—"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Fecha</span>
                                <span className="text-white">{formatDate(r.startTime)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Horario</span>
                                <span className="text-white">
                                  {formatHour(r.startTime)} – {formatHour(r.endTime)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Usuario</span>
                                <span className="text-white">{r.user?.name || r.user?.email || "—"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Email</span>
                                <span className="text-white text-xs">{r.user?.email || "—"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Monto</span>
                                <span className="text-emerald-400 font-medium">
                                  {formatPrice(r.totalAmount)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Pago */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              Pago
                            </h4>
                            {(() => {
                              const pay = getPayment(r.payment);
                              return pay ? (
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Estado</span>
                                    <span className={payStatusColor(pay.status)}>
                                      {payIsApproved(pay.status) ? "Aprobado" : "Pendiente"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Monto</span>
                                    <span className="text-white">{formatPrice(pay.amount ?? 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Método</span>
                                    <span className="text-white">{pay.method || "—"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Fecha</span>
                                    <span className="text-white text-xs">{formatDateShort(pay.createdAt ?? new Date().toISOString())}</span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Sin pago registrado</p>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Cambio de estado */}
                        {transitions.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-white/10">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              Cambiar estado
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {transitions.map((newStatus) => {
                                const label =
                                  newStatus === "CONFIRMED"
                                    ? "Marcar como Confirmada"
                                    : newStatus === "COMPLETED"
                                      ? "Marcar como Completada"
                                      : "Cancelar reserva";
                                const variant =
                                  newStatus === "CANCELLED"
                                    ? "outline"
                                    : "outline";
                                const cls =
                                  newStatus === "CANCELLED"
                                    ? "text-red-400 hover:text-red-300 border-red-500/20"
                                    : "";
                                return (
                                  <Button
                                    key={newStatus}
                                    size="sm"
                                    variant={variant}
                                    className={cls}
                                    loading={changingId === r.id}
                                    onClick={() => changeStatus(r.id, newStatus)}
                                  >
                                    {label}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}