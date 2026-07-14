"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

interface AdminCourt {
  id: string;
  name: string;
  description: string | null;
  surface: string;
  pricePerHour: number;
  imageUrl: string | null;
  isActive: boolean;
  location: string | null;
  reservation_count: number;
}

const SURFACE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  CLAY: { label: "Polvo de ladrillo", color: "bg-orange-500/20 text-orange-300 border-orange-500/30", icon: "🟠" },
  HARD: { label: "Dura", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: "🔵" },
  GRASS: { label: "Césped", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: "🟢" },
  SYNTHETIC: { label: "Sintética", color: "bg-gray-400/20 text-gray-300 border-gray-400/30", icon: "⚪" },
};

const surfaceOptions = [
  { value: "CLAY", label: "Polvo de ladrillo" },
  { value: "HARD", label: "Dura" },
  { value: "GRASS", label: "Césped" },
  { value: "SYNTHETIC", label: "Sintética" },
];

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<AdminCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<AdminCourt>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    surfaceType: "CLAY",
    pricePerHour: "",
    imageUrl: "",
    location: "",
  });

  const cleanFields = { name: "", description: "", surfaceType: "CLAY", pricePerHour: "", imageUrl: "", location: "" };

  function loadCourts() {
    setLoading(true);
    fetch("/api/admin/courts")
      .then((res) => res.json())
      .then((data) => {
        setCourts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadCourts();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/courts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm(cleanFields);
      loadCourts();
    }
  }

  function startEdit(court: AdminCourt) {
    setEditingId(court.id);
    setEditValues({
      name: court.name,
      description: court.description ?? "",
      surface: court.surface,
      pricePerHour: court.pricePerHour,
      imageUrl: court.imageUrl ?? "",
      location: court.location ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValues({});
  }

  async function saveEdit(courtId: string) {
    await fetch(`/api/admin/courts/${courtId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editValues.name,
        description: editValues.description,
        surface: editValues.surface,
        pricePerHour: editValues.pricePerHour,
        imageUrl: editValues.imageUrl || null,
        location: editValues.location || null,
      }),
    });
    cancelEdit();
    loadCourts();
  }

  async function toggleActive(court: AdminCourt) {
    await fetch(`/api/admin/courts/${court.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !court.isActive }),
    });
    loadCourts();
  }

  async function handleDelete(courtId: string) {
    setDeletingId(courtId);
    await fetch(`/api/admin/courts/${courtId}`, {
      method: "DELETE",
    });
    setDeletingId(null);
    loadCourts();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Canchas</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nueva cancha"}
        </Button>
      </div>

      {/* Formulario nueva cancha */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <Card className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      placeholder="Cancha 1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Ubicación</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      placeholder="Club X, Zona Norte"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Superficie</label>
                    <select
                      value={form.surfaceType}
                      onChange={(e) => setForm({ ...form, surfaceType: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      {surfaceOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Precio/hora (ARS)</label>
                    <input
                      type="number"
                      value={form.pricePerHour}
                      onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      placeholder="5000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">URL imagen</label>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    rows={2}
                    placeholder="Cancha techada, iluminación LED..."
                  />
                </div>
                <Button type="submit">Crear cancha</Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de canchas */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {courts.map((court) => {
            const surfaceCfg = SURFACE_CONFIG[court.surface] ?? SURFACE_CONFIG.CLAY;
            const isEditing = editingId === court.id;

            return (
              <motion.div
                key={court.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="p-4">
                  {isEditing ? (
                    /* Modo edición */
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editValues.name ?? ""}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          placeholder="Nombre"
                        />
                        <input
                          type="number"
                          value={editValues.pricePerHour ?? ""}
                          onChange={(e) => setEditValues({ ...editValues, pricePerHour: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          placeholder="Precio/hora"
                        />
                        <select
                          value={editValues.surface ?? "CLAY"}
                          onChange={(e) => setEditValues({ ...editValues, surface: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        >
                          {surfaceOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editValues.location ?? ""}
                          onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          placeholder="Ubicación"
                        />
                      </div>
                      <input
                        type="text"
                        value={editValues.imageUrl ?? ""}
                        onChange={(e) => setEditValues({ ...editValues, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        placeholder="URL imagen"
                      />
                      <textarea
                        value={editValues.description ?? ""}
                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        rows={2}
                        placeholder="Descripción"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(court.id)}>Guardar</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    /* Modo vista */
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Image preview */}
                        {court.imageUrl ? (
                          <img
                            src={court.imageUrl}
                            alt={court.name}
                            className="w-16 h-16 rounded-lg object-cover border border-white/10 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8 text-emerald-400/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="3" />
                              <circle cx="12" cy="12" r="8" opacity="0.3" />
                            </svg>
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white truncate">{court.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs border ${surfaceCfg.color}`}>
                              {surfaceCfg.label}
                            </span>
                            {!court.isActive && (
                              <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-300 border border-red-500/30">
                                Inactiva
                              </span>
                            )}
                          </div>
                          {court.location && (
                            <p className="text-xs text-gray-500 mb-1">{court.location}</p>
                          )}
                          {court.description && (
                            <p className="text-sm text-gray-400 truncate">{court.description}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {formatPrice(court.pricePerHour)}/h · {court.reservation_count} reservas
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => startEdit(court)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleActive(court)}>
                          {court.isActive ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-500/40"
                          loading={deletingId === court.id}
                          onClick={() => {
                            if (confirm(`¿Eliminar ${court.name}?`)) handleDelete(court.id);
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}