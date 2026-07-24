"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { AlertCircle, MapPin, Plus, Store } from "lucide-react";

/**
 * "Mis puntos de venta" del vendedor: lista las farmacias y dietéticas que
 * sumó (vendor_pharmacies) y permite alta rápida (tipo + nombre + ciudad,
 * sucursal opcional). El código único y el vínculo al vendedor los resuelve
 * el servidor — acá no se generan ni se envían.
 */

type PharmacyType = "farmacia" | "dietetica";

type Pharmacy = {
  id: string;
  name: string;
  type: PharmacyType;
  city: string | null;
  branch: string | null;
  created_at: string;
};

const TYPE_LABELS: Record<PharmacyType, string> = {
  farmacia: "Farmacia",
  dietetica: "Dietética",
};

const inputClass =
  "w-full rounded-full border border-line bg-surface px-5 py-3 text-base text-ink placeholder:text-soft focus:border-geneo focus:outline-none";

export default function FarmaciasVendedor() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [type, setType] = useState<PharmacyType>("farmacia");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [branch, setBranch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/vendedor/farmacias")
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json() as Promise<{ pharmacies?: Pharmacy[] }>;
      })
      .then((json) => {
        if (cancelled) return;
        setPharmacies(json.pharmacies ?? []);
        setLoadError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const cleanName = name.trim();
    const cleanCity = city.trim();
    if (!cleanName) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    if (!cleanCity) {
      setFormError("La ciudad es obligatoria.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendedor/farmacias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: cleanName,
          city: cleanCity,
          branch: branch.trim() || undefined,
        }),
      });
      const result: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !result.ok) {
        setFormError(result.error ?? "No pudimos crear el punto de venta.");
        setSubmitting(false);
        return;
      }
      setName("");
      setCity("");
      setBranch("");
      setSubmitting(false);
      setReloadKey((k) => k + 1);
    } catch {
      setFormError("No pudimos crear el punto de venta.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Mis puntos de venta</h1>
        <p className="text-muted text-sm">Las farmacias y dietéticas que sumaste al programa Geneo.</p>
      </header>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        onSubmit={onSubmit}
        className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4"
      >
        <h2 className="text-ink font-bold text-base flex items-center gap-2">
          <Plus size={18} className="text-geneo" />
          Agregar punto de venta
        </h2>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted text-sm font-semibold">Tipo</span>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as PharmacyType);
              setFormError("");
            }}
            className={inputClass}
          >
            <option value="farmacia">Farmacia</option>
            <option value="dietetica">Dietética</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted text-sm font-semibold">Nombre</span>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormError("");
            }}
            placeholder="Ej: Farmacia San Martín"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted text-sm font-semibold">Ciudad</span>
          <input
            type="text"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setFormError("");
            }}
            placeholder="Ej: Rosario"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted text-sm font-semibold">Sucursal (opcional)</span>
          <input
            type="text"
            value={branch}
            onChange={(e) => {
              setBranch(e.target.value);
              setFormError("");
            }}
            placeholder="Ej: Centro, Sucursal Norte (opcional)"
            className={inputClass}
          />
        </label>

        {formError && (
          <p role="alert" className="text-geneo text-sm font-medium">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !name.trim() || !city.trim()}
          className="inline-flex items-center justify-center rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
        >
          {submitting ? "Un momento…" : "Agregar punto de venta"}
        </button>
      </motion.form>

      {loadError && (
        <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-3">
          <AlertCircle size={28} className="text-soft" />
          <p className="text-ink font-bold text-sm">No pudimos cargar tus puntos de venta</p>
          <p className="text-muted text-sm">Revisá tu conexión e intentá de nuevo.</p>
        </div>
      )}

      {!loadError && pharmacies === null && (
        <ul className="flex flex-col gap-3" aria-hidden>
          {[0, 1].map((i) => (
            <li key={i} className="flex items-center gap-4 rounded-3xl px-4 py-4 bg-paper shadow-soft">
              <span className="w-11 h-11 rounded-full bg-line/60 animate-pulse shrink-0" />
              <span className="flex-1 h-4 rounded-full bg-line/60 animate-pulse" />
            </li>
          ))}
        </ul>
      )}

      {!loadError && pharmacies !== null && pharmacies.length === 0 && (
        <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-1">
          <p className="text-ink font-bold text-sm">Todavía no agregaste puntos de venta.</p>
          <p className="text-muted text-sm">
            Sumá el primero cuando visites una farmacia o dietética que se une al programa.
          </p>
        </div>
      )}

      {!loadError && pharmacies !== null && pharmacies.length > 0 && (
        <ul className="flex flex-col gap-3">
          {pharmacies.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28, delay: Math.min(i, 8) * 0.05 }}
              className="flex items-center gap-4 rounded-3xl px-4 py-4 bg-paper shadow-soft"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-rosa-suave text-geneo shrink-0">
                <Store size={19} />
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-ink leading-tight truncate">{p.name}</span>
                  <span className="shrink-0 rounded-full bg-rosa-suave text-geneo text-[11px] font-bold uppercase tracking-wide px-2 py-0.5">
                    {TYPE_LABELS[p.type]}
                  </span>
                </span>
                {(p.city || p.branch) && (
                  <span className="flex items-center gap-1 text-soft text-xs">
                    <MapPin size={12} />
                    {[p.city, p.branch].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
