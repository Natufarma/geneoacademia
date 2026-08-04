"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  MapPin,
  Pencil,
  Store,
  Trash2,
  Users,
  X,
} from "lucide-react";

/** Tipos y constantes compartidos por "Puntos de venta" (alta) y "Mis Farmacias" (lista). */
export type PharmacyType = "farmacia" | "dietetica";

export type EmployeeLite = {
  id: string;
  name: string;
  points: number;
  certified: boolean;
};

export type Pharmacy = {
  id: string;
  name: string;
  type: PharmacyType;
  city: string | null;
  branch: string | null;
  created_at: string;
  employees: EmployeeLite[];
};

export const TYPE_LABELS: Record<PharmacyType, string> = {
  farmacia: "Farmacia",
  dietetica: "Dietética",
};

export const vendorInputClass =
  "w-full rounded-full border border-line bg-surface px-5 py-3 text-base text-ink placeholder:text-soft focus:border-geneo focus:outline-none";

/**
 * Fila de un punto de venta con acciones de editar y eliminar.
 * - Editar: cambia tipo/nombre/ciudad/sucursal en línea (PATCH).
 * - Eliminar: pide confirmación y borra (DELETE); el servidor rechaza si la
 *   farmacia ya tiene empleados registrados y ese mensaje se muestra acá.
 */
export default function VendorPharmacyItem({
  pharmacy,
  index,
  onChanged,
}: {
  pharmacy: Pharmacy;
  index: number;
  onChanged: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showEmployees, setShowEmployees] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [eType, setEType] = useState<PharmacyType>(pharmacy.type);
  const [eName, setEName] = useState(pharmacy.name);
  const [eCity, setECity] = useState(pharmacy.city ?? "");
  const [eBranch, setEBranch] = useState(pharmacy.branch ?? "");

  function startEdit() {
    setEType(pharmacy.type);
    setEName(pharmacy.name);
    setECity(pharmacy.city ?? "");
    setEBranch(pharmacy.branch ?? "");
    setError("");
    setConfirmingDelete(false);
    setMode("edit");
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const cleanName = eName.trim();
    const cleanCity = eCity.trim();
    if (!cleanName) return setError("El nombre es obligatorio.");
    if (!cleanCity) return setError("La ciudad es obligatoria.");
    setBusy(true);
    try {
      const res = await fetch("/api/vendedor/farmacias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId: pharmacy.id,
          type: eType,
          name: cleanName,
          city: cleanCity,
          branch: eBranch.trim() || undefined,
        }),
      });
      const result: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !result.ok) {
        setError(result.error ?? "No pudimos guardar los cambios.");
        setBusy(false);
        return;
      }
      setBusy(false);
      setMode("view");
      onChanged();
    } catch {
      setError("No pudimos guardar los cambios.");
      setBusy(false);
    }
  }

  async function doDelete() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/vendedor/farmacias", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pharmacyId: pharmacy.id }),
      });
      const result: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !result.ok) {
        setError(result.error ?? "No pudimos eliminar el punto de venta.");
        setBusy(false);
        setConfirmingDelete(false);
        return;
      }
      onChanged(); // la fila desaparece al recargar la lista
    } catch {
      setError("No pudimos eliminar el punto de venta.");
      setBusy(false);
      setConfirmingDelete(false);
    }
  }

  const iconBtn =
    "flex items-center justify-center w-11 h-11 rounded-full text-soft hover:text-geneo active:text-geneo transition-colors shrink-0";

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay: Math.min(index, 8) * 0.05 }}
      className="flex flex-col gap-3 rounded-3xl px-4 py-4 bg-paper shadow-soft"
    >
      {mode === "view" ? (
        <>
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center w-11 h-11 rounded-full bg-rosa-suave text-geneo shrink-0">
              <Store size={19} />
            </span>
            <span className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-ink leading-tight truncate">{pharmacy.name}</span>
                <span className="shrink-0 rounded-full bg-rosa-suave text-geneo text-[11px] font-bold uppercase tracking-wide px-2 py-0.5">
                  {TYPE_LABELS[pharmacy.type]}
                </span>
              </span>
              {(pharmacy.city || pharmacy.branch) && (
                <span className="flex items-center gap-1 text-soft text-xs">
                  <MapPin size={12} />
                  {[pharmacy.city, pharmacy.branch].filter(Boolean).join(" · ")}
                </span>
              )}
            </span>
            {!confirmingDelete && (
              <span className="flex items-center shrink-0">
                <button type="button" onClick={startEdit} aria-label="Editar punto de venta" className={iconBtn}>
                  <Pencil size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setConfirmingDelete(true);
                  }}
                  aria-label="Eliminar punto de venta"
                  className={iconBtn}
                >
                  <Trash2 size={17} />
                </button>
              </span>
            )}
          </div>

          {/* Empleados registrados en esta farmacia (nombre + puntos + certificado). */}
          {pharmacy.employees.length === 0 ? (
            <p className="border-t border-line pt-2 text-soft text-xs">
              Sin empleados registrados aún.
            </p>
          ) : (
            <div className="border-t border-line pt-2">
              <button
                type="button"
                onClick={() => setShowEmployees((s) => !s)}
                aria-expanded={showEmployees}
                className="flex items-center gap-1.5 min-h-11 text-muted text-xs font-bold hover:text-geneo active:text-geneo transition-colors"
              >
                <Users size={14} className="text-geneo" />
                {pharmacy.employees.length} empleado{pharmacy.employees.length === 1 ? "" : "s"}
                <motion.span
                  animate={{ rotate: showEmployees ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  className="inline-flex"
                >
                  <ChevronDown size={14} />
                </motion.span>
              </button>
              {showEmployees && (
                <ul className="flex flex-col divide-y divide-line">
                  {pharmacy.employees.map((emp) => (
                    <li key={emp.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="text-ink text-sm truncate">{emp.name}</span>
                      <span className="shrink-0 flex items-center gap-2">
                        <span className="text-geneo font-bold text-xs">
                          {emp.points.toLocaleString("es-AR")} pts
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            emp.certified ? "bg-rosa-suave text-geneo" : "bg-line/60 text-soft"
                          }`}
                        >
                          {emp.certified ? "Certificado" : "En curso"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {confirmingDelete && (
            <div className="flex flex-col gap-2 rounded-2xl bg-surface border border-line px-4 py-3">
              <p className="text-ink text-sm font-semibold">¿Eliminar “{pharmacy.name}”?</p>
              <p className="text-muted text-xs leading-snug">Esta acción no se puede deshacer.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={doDelete}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-xs px-4 min-h-11 transition-colors"
                >
                  <Trash2 size={14} />
                  {busy ? "Eliminando…" : "Sí, eliminar"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={busy}
                  className="inline-flex items-center rounded-full border border-line text-muted font-bold uppercase tracking-wide text-xs px-4 min-h-11 transition-colors hover:text-geneo active:text-geneo"
                >
                  No
                </button>
              </div>
              {error && (
                <p role="alert" className="text-geneo text-sm font-medium">
                  {error}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <form onSubmit={saveEdit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-muted text-sm font-semibold">Tipo</span>
            <select
              value={eType}
              onChange={(e) => setEType(e.target.value as PharmacyType)}
              className={vendorInputClass}
            >
              <option value="farmacia">Farmacia</option>
              <option value="dietetica">Dietética</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-muted text-sm font-semibold">Nombre</span>
            <input
              type="text"
              value={eName}
              onChange={(e) => {
                setEName(e.target.value);
                setError("");
              }}
              className={vendorInputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-muted text-sm font-semibold">Ciudad</span>
            <input
              type="text"
              value={eCity}
              onChange={(e) => {
                setECity(e.target.value);
                setError("");
              }}
              className={vendorInputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-muted text-sm font-semibold">Sucursal (opcional)</span>
            <input
              type="text"
              value={eBranch}
              onChange={(e) => setEBranch(e.target.value)}
              placeholder="Ej: Centro, Sucursal Norte (opcional)"
              className={vendorInputClass}
            />
          </label>
          {error && (
            <p role="alert" className="text-geneo text-sm font-medium">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-xs px-5 min-h-11 transition-colors"
            >
              <Check size={15} strokeWidth={3} />
              {busy ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-line text-muted font-bold uppercase tracking-wide text-xs px-5 min-h-11 transition-colors hover:text-geneo active:text-geneo"
            >
              <X size={15} />
              Cancelar
            </button>
          </div>
        </form>
      )}
    </motion.li>
  );
}
