"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";
import type { ReservationData } from "@/types";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<(ReservationData & { user?: { name: string | null; email: string } })[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");

  function loadReservations() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    if (date) params.set("date", date);

    fetch(`/api/admin/reservations?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setReservations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadReservations();
  }, [filter, date]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Reservas</h1>

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
          {reservations.map((reservation) => (
            <motion.div
              key={reservation.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">
                        {reservation.court.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          reservation.status === "CONFIRMED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : reservation.status === "PENDING"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : reservation.status === "CANCELLED"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {reservation.status === "CONFIRMED"
                          ? "Confirmada"
                          : reservation.status === "PENDING"
                            ? "Pendiente"
                            : reservation.status === "CANCELLED"
                              ? "Cancelada"
                              : "Completada"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {reservation.user?.name || reservation.user?.email} ·{" "}
                      {formatDate(reservation.startTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-medium">
                      {formatPrice(reservation.totalPrice)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reservation.payment?.status === "APPROVED"
                        ? "Pagado"
                        : reservation.payment?.status === "PENDING"
                          ? "Pendiente de pago"
                          : "—"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
