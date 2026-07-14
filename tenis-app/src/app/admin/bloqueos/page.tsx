"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface BlockedSlot {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  createdAt: string;
  Court: { name: string } | null;
}

interface Court {
  id: string;
  name: string;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8 a 23

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BloqueosPage() {
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [courtId, setCourtId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startHour, setStartHour] = useState("8");
  const [endHour, setEndHour] = useState("9");
  const [reason, setReason] = useState("Mantenimiento");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadBlockedSlots() {
    try {
      const res = await fetch("/api/admin/blocked-slots");
      const json = await res.json();
      setBlockedSlots(json.blockedSlots ?? []);
    } catch (e) {
      console.error("Error loading blocked slots:", e);
    }
  }

  async function loadCourts() {
    try {
      const res = await fetch("/api/admin/courts");
      const data = await res.json();
      const courtsList = Array.isArray(data) ? data : data.courts ?? [];
      setCourts(courtsList);
      if (courtsList.length > 0 && !courtId) setCourtId(courtsList[0].id);
    } catch (e) {
      console.error("Error loading courts:", e);
    }
  }

  useEffect(() => {
    Promise.all([loadBlockedSlots(), loadCourts()]).finally(() =>
      setLoading(false)
    );
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!courtId || !date || !startHour || !endHour) return;

    setSubmitting(true);
    setError("");

    // Build ISO dates for Argentina timezone
    const startTime = new Date(`${date}T${startHour.padStart(2, "0")}:00:00`);
    const endTime = new Date(`${date}T${endHour.padStart(2, "0")}:00:00`);

    if (endTime <= startTime) {
      setError("La hora de fin debe ser posterior a la hora de inicio");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId,
          date,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          reason,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear bloqueo");
      }

      // Reset form and reload
      setReason("Mantenimiento");
      setStartHour("8");
      setEndHour("9");
      await loadBlockedSlots();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este bloqueo?")) return;

    setDeletingId(id);
    try {
      await fetch(`/api/admin/blocked-slots/${id}`, { method: "DELETE" });
      await loadBlockedSlots();
    } catch (e) {
      console.error("Error deleting blocked slot:", e);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bloqueo de Horarios</h1>
        <p className="text-gray-400 mt-1">
          Bloqueá canchas por mantenimiento, torneos o eventos especiales
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">
            Nuevo bloqueo
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cancha
              </label>
              <select
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                required
              >
                {courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Desde
                </label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                >
                  {HOURS.slice(0, -1).map((h) => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Hasta
                </label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                >
                  {HOURS.slice(1).map((h) => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Motivo
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
              >
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Torneo">Torneo</option>
                <option value="Evento especial">Evento especial</option>
                <option value="Reparación">Reparación</option>
                <option value="Clausura temporal">Clausura temporal</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Guardando..." : "Bloquear horario"}
            </Button>
          </form>
        </Card>

        {/* Lista de bloqueos */}
        <div className="lg:col-span-2 space-y-3">
          {blockedSlots.length === 0 ? (
            <Card className="p-8 text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-600 mb-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              <p className="text-gray-400">
                No hay bloqueos registrados
              </p>
            </Card>
          ) : (
            <AnimatePresence>
              {blockedSlots.map((slot) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Icono */}
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                        <svg
                          className="w-5 h-5 text-amber-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {slot.Court?.name ?? "Cancha eliminada"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatDateShort(slot.date)} &middot;{" "}
                          {formatHour(slot.startTime)} -{" "}
                          {formatHour(slot.endTime)}
                        </p>
                        <span className="inline-block mt-1 text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                          {slot.reason}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      disabled={deletingId === slot.id}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 ml-4"
                      title="Eliminar bloqueo"
                    >
                      {deletingId === slot.id ? (
                        <div className="animate-spin w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full" />
                      ) : (
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      )}
                    </button>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
