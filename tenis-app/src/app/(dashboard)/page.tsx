"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/animations/PageTransition";
import { formatPrice, formatDate } from "@/lib/utils";
import type { ReservationData } from "@/types";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Mis Reservas
        </h1>
        <p className="text-gray-400 mt-1">
          Bienvenido, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Próximas reservas */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">
          Próximas reservas
        </h2>
        {upcoming.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">
              No tenés reservas próximas.{" "}
              <a
                href="/canchas"
                className="text-emerald-400 hover:text-emerald-300"
              >
                Reservá una cancha
              </a>
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcoming.map((reservation, i) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-semibold text-white">
                        {reservation.court.name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(reservation.startTime)} -{" "}
                        {formatDate(reservation.endTime).split(",")[1]?.trim() || "1 hora"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          reservation.status === "CONFIRMED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        }`}
                      >
                        {reservation.status === "CONFIRMED"
                          ? "Confirmada"
                          : "Pendiente de pago"}
                      </span>
                      <span className="text-emerald-400 font-medium">
                        {formatPrice(reservation.totalPrice)}
                      </span>
                      {reservation.status === "PENDING" && !reservation.payment && (
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(`/canchas/${reservation.courtId}`)
                          }
                        >
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Historial */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Historial</h2>
          <div className="space-y-3">
            {past.slice(0, 5).map((reservation, i) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">
                        {reservation.court.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(reservation.startTime)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        reservation.status === "COMPLETED"
                          ? "text-gray-400"
                          : "text-red-400"
                      }`}
                    >
                      {reservation.status === "COMPLETED"
                        ? "Completada"
                        : "Cancelada"}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </PageTransition>
  );
}
