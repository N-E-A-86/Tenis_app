"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/animations/PageTransition";
import { formatPrice, formatDate } from "@/lib/utils";

interface UserReservation {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  court: { id: string; name: string } | null;
  payment: { id: string; amount: number; status: string; method: string | null; createdAt: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; isActive: boolean }> = {
  PENDING: { label: "Pendiente de pago", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", isActive: true },
  CONFIRMED: { label: "Confirmada", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", isActive: true },
  CANCELLED: { label: "Cancelada", color: "bg-red-500/20 text-red-300 border-red-500/30", isActive: false },
  COMPLETED: { label: "Completada", color: "bg-gray-500/20 text-gray-300 border-gray-500/30", isActive: false },
};

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/reservations")
        .then((res) => res.json())
        .then((data) => {
          setReservations(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const upcoming = reservations.filter(
    (r) => r.status === "CONFIRMED" || r.status === "PENDING"
  );
  const past = reservations.filter(
    (r) => r.status === "COMPLETED" || r.status === "CANCELLED"
  );

  async function handleCancel(reservationId: string) {
    if (!confirm("¿Cancelar esta reserva? Se liberará la cancha y se procesará el reembolso si corresponde.")) return;
    setCancellingId(reservationId);
    try {
      await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: "CANCELLED" } : r))
      );
      if (expandedId === reservationId) setExpandedId(null);
    } catch {
      alert("Error al cancelar");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Mis Reservas</h1>
        <p className="text-gray-400 mt-1">
          Bienvenido, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Próximas reservas */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">Próximas reservas</h2>
        {upcoming.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">
              No tenés reservas próximas.{" "}
              <a href="/canchas" className="text-emerald-400 hover:text-emerald-300">
                Reservá una cancha
              </a>
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((reservation, i) => {
              const st = STATUS_CONFIG[reservation.status] ?? STATUS_CONFIG.PENDING;
              const isExpanded = expandedId === reservation.id;

              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`p-4 transition-all ${isExpanded ? "border-emerald-500/30 bg-emerald-500/5" : ""}`}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : reservation.id)}
                      className="w-full text-left flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {reservation.court?.name ?? "Cancha"}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {formatDateShort(reservation.startTime)} · {formatHour(reservation.startTime)} – {formatHour(reservation.endTime)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${st.color}`}>
                          {st.label}
                        </span>
                        <span className="text-emerald-400 font-medium whitespace-nowrap">
                          {formatPrice(reservation.totalAmount)}
                        </span>
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
                    </button>

                    {/* Panel expandido */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="pt-4 border-t border-white/10 space-y-4">
                            {/* Pago */}
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">Pago</h4>
                              {reservation.payment ? (
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Estado</span>
                                    <span className={reservation.payment.status === "APPROVED" ? "text-emerald-400" : "text-yellow-400"}>
                                      {reservation.payment.status === "APPROVED" ? "Aprobado" : "Pendiente"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Monto</span>
                                    <span className="text-white">{formatPrice(reservation.payment.amount)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Método</span>
                                    <span className="text-white">{reservation.payment.method || "—"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Fecha</span>
                                    <span className="text-white text-xs">{formatDateShort(reservation.payment.createdAt)}</span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Sin pago registrado</p>
                              )}
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-2">
                              {st.isActive && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-400 hover:text-red-300 border-red-500/20"
                                  loading={cancellingId === reservation.id}
                                  onClick={() => handleCancel(reservation.id)}
                                >
                                  Cancelar reserva
                                </Button>
                              )}
                              {reservation.status === "PENDING" && !reservation.payment && (
                                <Button
                                  size="sm"
                                  onClick={() => router.push(`/canchas/${reservation.court?.id}`)}
                                >
                                  Pagar ahora
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Historial */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Historial</h2>
          <div className="space-y-3">
            {past.slice(0, 10).map((reservation, i) => {
              const st = STATUS_CONFIG[reservation.status] ?? STATUS_CONFIG.CANCELLED;
              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="p-4 opacity-70">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{reservation.court?.name ?? "Cancha"}</h3>
                        <p className="text-sm text-gray-500">{formatDateShort(reservation.startTime)}</p>
                      </div>
                      <span className={`text-xs font-medium ${st.color.replace("border-", "").replace("bg-", "text-")}`}>
                        {st.label}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </PageTransition>
  );
}