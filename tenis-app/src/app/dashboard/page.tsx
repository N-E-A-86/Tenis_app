"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

interface UserReservation {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  court: { name: string; id: string } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  CONFIRMED: { label: "Confirmada", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  CANCELLED: { label: "Cancelada", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  COMPLETED: { label: "Completada", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
};

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/reservations")
      .then((res) => res.json())
      .then((data) => {
        setReservations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, router]);

  async function cancelReservation(id: string) {
    if (!confirm("¿Cancelar esta reserva?")) return;
    setCancellingId(id);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (!res.ok) throw new Error();
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r))
      );
    } catch {
      alert("Error al cancelar la reserva");
    } finally {
      setCancellingId(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-black pt-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-white/10 rounded-lg" />
            <div className="h-24 bg-white/5 rounded-xl" />
            <div className="h-24 bg-white/5 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Mis Reservas</h1>

        {reservations.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No tenés reservas todavía</p>
            <Button onClick={() => router.push("/canchas")}>
              Reservar una cancha
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => {
              const st = STATUS_LABELS[r.status] ?? STATUS_LABELS.PENDING;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Icono */}
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {r.court?.name ?? "Cancha"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {formatDate(r.startTime)} · {formatHour(r.startTime)} – {formatHour(r.endTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${st.color}`}>
                          {st.label}
                        </span>
                        <span className="text-emerald-400 font-medium">
                          {formatPrice(r.totalAmount)}
                        </span>
                        {r.status === "PENDING" && (
                          <button
                            onClick={() => cancelReservation(r.id)}
                            disabled={cancellingId === r.id}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Cancelar reserva"
                          >
                            {cancellingId === r.id ? (
                              <div className="animate-spin w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full" />
                            ) : (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
