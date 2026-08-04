"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Plus } from "lucide-react";
import { TYPE_LABELS, vendorInputClass, type PharmacyType } from "../_components/VendorPharmacyItem";

/**
 * "Puntos de venta" del vendedor: alta rápida de una farmacia o dietética
 * (tipo + nombre + ciudad, sucursal opcional). El código único y el vínculo al
 * vendedor los resuelve el servidor — acá no se generan ni se envían. La lista
 * de puntos de venta cargados vive en la pestaña "Mis Farmacias".
 */
export default function AltaPuntoDeVenta() {
  const [type, setType] = useState<PharmacyType>("farmacia");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [branch, setBranch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [added, setAdded] = useState<string | null>(null);

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
      setAdded(cleanName);
      setName("");
      setCity("");
      setBranch("");
      setSubmitting(false);
    } catch {
      setFormError("No pudimos crear el punto de venta.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Mis puntos de venta</h1>
        <p className="text-muted text-sm">
          Sumá las farmacias y dietéticas que se unen al programa Geneo. Las que ya cargaste las ves
          en <span className="font-semibold text-ink">Mis Farmacias</span>.
        </p>
      </header>

      <AnimatePresence>
        {added && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-rosa-suave/60 px-4 py-3.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-geneo text-white shrink-0">
                <Check size={18} strokeWidth={3} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-ink font-bold text-sm leading-tight truncate">
                  “{added}” agregado
                </p>
                <p className="text-muted text-xs">Ya forma parte de tus puntos de venta.</p>
              </div>
              <Link
                href="/vendedor/mis-farmacias"
                className="shrink-0 inline-flex items-center gap-1 text-geneo font-bold text-xs uppercase tracking-wide hover:underline"
              >
                Ver
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            className={vendorInputClass}
          >
            <option value="farmacia">{TYPE_LABELS.farmacia}</option>
            <option value="dietetica">{TYPE_LABELS.dietetica}</option>
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
            className={vendorInputClass}
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
            className={vendorInputClass}
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
            className={vendorInputClass}
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
    </div>
  );
}
