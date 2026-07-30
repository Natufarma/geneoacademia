"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, MapPin, Pencil, Plus, Store, Trash2, X } from "lucide-react";

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
            <PharmacyItem
              key={p.id}
              pharmacy={p}
              index={i}
              onChanged={() => setReloadKey((k) => k + 1)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Fila de un punto de venta con acciones de editar y eliminar.
 * - Editar: cambia tipo/nombre/ciudad/sucursal en línea (PATCH).
 * - Eliminar: pide confirmación y borra (DELETE); el servidor rechaza si la
 *   farmacia ya tiene empleados registrados y ese mensaje se muestra acá.
 */
function PharmacyItem({
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
              value={eName}
              onChange={(e) => {
                setEName(e.target.value);
                setError("");
              }}
              className={inputClass}
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
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-muted text-sm font-semibold">Sucursal (opcional)</span>
            <input
              type="text"
              value={eBranch}
              onChange={(e) => setEBranch(e.target.value)}
              placeholder="Ej: Centro, Sucursal Norte (opcional)"
              className={inputClass}
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
