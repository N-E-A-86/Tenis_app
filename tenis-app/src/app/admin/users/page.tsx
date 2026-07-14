"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
  reservationCount: number;
  totalSpent: number;
}

interface UserDetail {
  user: AdminUser;
  reservations: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    totalAmount: number;
    court: { name: string } | null;
    payment: { amount: number; status: string } | null;
  }[];
  stats: {
    totalReservations: number;
    totalSpent: number;
  };
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

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  function loadUsers() {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function toggleExpand(userId: string) {
    if (expandedId === userId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(userId);
    setDetailLoading(true);
    setDetail(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      setDetail(data);
    } catch {
      // skip
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Usuarios</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const isExpanded = expandedId === user.id;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Fila principal */}
                <button
                  onClick={() => toggleExpand(user.id)}
                  className="w-full text-left"
                >
                  <Card className={`p-4 transition-colors ${isExpanded ? "border-emerald-500/30 bg-white/10" : ""}`}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-400 font-bold text-sm">
                            {(user.name || user.email)[0].toUpperCase()}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white truncate">
                              {user.name || "Sin nombre"}
                            </p>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs ${
                                user.role === "ADMIN"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-white/10 text-gray-300"
                              }`}
                            >
                              {user.role === "ADMIN" ? "Admin" : "Usuario"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm flex-shrink-0">
                        <div className="text-right">
                          <span className="text-gray-300">{user.reservationCount} reservas</span>
                          <br />
                          <span className="text-emerald-400 text-xs">
                            {formatPrice(user.totalSpent)}
                          </span>
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
                        {detailLoading ? (
                          <div className="space-y-3">
                            <div className="h-8 bg-white/5 rounded animate-pulse" />
                            <div className="h-8 bg-white/5 rounded animate-pulse" />
                          </div>
                        ) : detail ? (
                          <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Total reservas</p>
                                <p className="text-lg font-bold text-white">{detail.stats.totalReservations}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Total gastado</p>
                                <p className="text-lg font-bold text-emerald-400">{formatPrice(detail.stats.totalSpent)}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Teléfono</p>
                                <p className="text-sm text-white">
                                  {detail.user.phone || "—"}
                                </p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Registrado</p>
                                <p className="text-sm text-white">{formatDateShort(detail.user.createdAt)}</p>
                              </div>
                            </div>

                            {/* Historial de reservas */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                                Últimas reservas
                              </h4>
                              {detail.reservations.length === 0 ? (
                                <p className="text-sm text-gray-500 py-4">Sin reservas todavía</p>
                              ) : (
                                <div className="space-y-2">
                                  {detail.reservations.slice(0, 15).map((r, i) => {
                                    const st = STATUS_LABELS[r.status] ?? STATUS_LABELS.PENDING;
                                    return (
                                      <motion.div
                                        key={r.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                                      >
                                        <div className="min-w-0">
                                          <p className="text-sm text-white truncate">
                                            {r.court?.name ?? "Cancha"}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {formatDateShort(r.startTime)} · {formatHour(r.startTime)} – {formatHour(r.endTime)}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                          <span className="text-sm text-emerald-400 font-medium">
                                            {formatPrice(r.totalAmount)}
                                          </span>
                                          <span className={`px-1.5 py-0.5 rounded text-xs ${st.color}`}>
                                            {st.label}
                                          </span>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 py-4">Error al cargar</p>
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