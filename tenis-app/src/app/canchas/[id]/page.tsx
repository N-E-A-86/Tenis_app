"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import PageTransition from "@/components/animations/PageTransition";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import type { CourtData, TimeSlot } from "@/types";

const surfaceLabels: Record<string, string> = {
  CLAY: "Polvo de ladrillo",
  HARD: "Dura",
  GRASS: "Césped",
  SYNTHETIC: "Sintética",
};

export default function CourtDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [court, setCourt] = useState<CourtData | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`/api/courts`)
      .then((res) => res.json())
      .then((courts: CourtData[]) => {
        const found = courts.find((c) => c.id === id);
        setCourt(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !selectedDate) return;
    fetch(
      `/api/courts/available?courtId=${id}&date=${selectedDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots || []);
        setSelectedSlot(null);
      })
      .catch(() => {});
  }, [id, selectedDate]);

  async function handleReserve() {
    if (!session) {
      router.push("/login");
      return;
    }

    if (selectedSlot === null) return;

    setReserving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: id,
          date: selectedDate,
          hour: selectedSlot,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al reservar");
        setReserving(false);
        return;
      }

      const reservation = await res.json();

      // Crear preferencia de pago
      const payRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: reservation.id }),
      });

      if (!payRes.ok) {
        setSuccess(
          "Reserva creada. Pero hubo un error al generar el pago. Contactá al administrador."
        );
        setReserving(false);
        return;
      }

      const payData = await payRes.json();

      // Redirigir a Mercado Pago
      if (payData.initPoint) {
        window.location.href = payData.initPoint;
      } else if (payData.sandboxInitPoint) {
        window.location.href = payData.sandboxInitPoint;
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!court) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl text-white">Cancha no encontrada</h1>
        <a href="/canchas" className="text-emerald-400 mt-4 inline-block">
          Volver a canchas
        </a>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info de la cancha */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="h-72 rounded-xl bg-gradient-to-br from-emerald-900/50 to-black border border-white/10 flex items-center justify-center mb-6">
                {court.imageUrl ? (
                  <img
                    src={court.imageUrl}
                    alt={court.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-8xl opacity-20">🎾</span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-white">{court.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 text-sm rounded-full border border-amber-700/50 bg-amber-700/30 text-amber-300">
                  {surfaceLabels[court.surfaceType] || court.surfaceType}
                </span>
                <span className="text-emerald-400 font-bold text-xl">
                  {formatPrice(court.pricePerHour)}
                  <span className="text-sm text-gray-500 font-normal">
                    /hora
                  </span>
                </span>
              </div>
              {court.description && (
                <p className="mt-4 text-gray-400">{court.description}</p>
              )}

              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { label: "Horario", value: "08:00 - 00:00" },
                  { label: "Duración", value: "1 hora" },
                  { label: "Pago", value: "Mercado Pago" },
                ].map((info) => (
                  <div key={info.label} className="p-3 bg-white/5 rounded-lg text-center">
                    <div className="text-xs text-gray-500">{info.label}</div>
                    <div className="text-sm text-white font-medium mt-1">
                      {info.value}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Reserva */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-4">
                Reservar
              </h2>

              {/* Selector de fecha */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Slots horarios */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Horario disponible
                </label>
                {slots.length === 0 ? (
                  <p className="text-sm text-gray-500">Cargando horarios...</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.hour}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.hour)}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedSlot === slot.hour
                            ? "bg-emerald-500 text-white"
                            : slot.available
                              ? "bg-white/10 hover:bg-white/20 text-white"
                              : "bg-white/5 text-gray-600 cursor-not-allowed line-through"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumen */}
              {selectedSlot !== null && court && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-6 p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cancha</span>
                    <span className="text-white">{court.name}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-400">Fecha</span>
                    <span className="text-white">
                      {new Date(selectedDate).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-400">Horario</span>
                    <span className="text-white">
                      {`${selectedSlot.toString().padStart(2, "0")}:00`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-white/10">
                    <span className="text-gray-400">Total</span>
                    <span className="text-emerald-400 font-bold">
                      {formatPrice(court.pricePerHour)}
                    </span>
                  </div>
                </motion.div>
              )}

              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}
              {success && (
                <p className="text-emerald-400 text-sm mb-4">{success}</p>
              )}

              <Button
                onClick={handleReserve}
                disabled={selectedSlot === null}
                loading={reserving}
                className="w-full"
                size="lg"
              >
                {session
                  ? "Reservar y pagar"
                  : "Iniciar sesión para reservar"}
              </Button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Pagás solo si confirmás la reserva
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
