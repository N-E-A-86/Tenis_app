"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

interface AdminCourt {
  id: string;
  name: string;
  surfaceType: string;
  pricePerHour: number;
  isActive: boolean;
  _count: { reservations: number };
}

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<AdminCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    surfaceType: "CLAY",
    pricePerHour: "",
    imageUrl: "",
  });

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
    try {
      const res = await fetch("/api/admin/courts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowForm(false);
        setForm({ name: "", description: "", surfaceType: "CLAY", pricePerHour: "", imageUrl: "" });
        loadCourts();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function toggleActive(court: AdminCourt) {
    try {
      await fetch(`/api/admin/courts/${court.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !court.isActive }),
      });
      loadCourts();
    } catch (error) {
      console.error(error);
    }
  }

  const surfaceOptions = [
    { value: "CLAY", label: "Polvo de ladrillo" },
    { value: "HARD", label: "Dura" },
    { value: "GRASS", label: "Césped" },
    { value: "SYNTHETIC", label: "Sintética" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Canchas</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nueva cancha"}
        </Button>
      </div>

      {/* Formulario nueva cancha */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-8"
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tipo de superficie</label>
                  <select
                    value={form.surfaceType}
                    onChange={(e) => setForm({ ...form, surfaceType: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    {surfaceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Precio por hora (ARS)</label>
                  <input
                    type="number"
                    value={form.pricePerHour}
                    onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">URL de imagen (opcional)</label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción (opcional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  rows={3}
                />
              </div>
              <Button type="submit">Crear cancha</Button>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Lista de canchas */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {courts.map((court) => (
            <motion.div
              key={court.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">
                      🎾
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{court.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatPrice(court.pricePerHour)}/h · {court._count.reservations} reservas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        court.isActive
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {court.isActive ? "Activa" : "Inactiva"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(court)}
                    >
                      {court.isActive ? "Desactivar" : "Activar"}
                    </Button>
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
