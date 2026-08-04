"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Plus, Search } from "lucide-react";
import VendorPharmacyItem, { type Pharmacy } from "../_components/VendorPharmacyItem";

/**
 * "Mis Farmacias" del vendedor: lista las farmacias y dietéticas que sumó
 * (vendor_pharmacies) con buscador, edición y baja. El alta vive en la pestaña
 * "Puntos de venta".
 */
export default function MisFarmacias() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [q, setQ] = useState("");

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

  // Lista filtrada por búsqueda (nombre, ciudad o sucursal).
  const term = q.trim().toLowerCase();
  const visible =
    pharmacies == null
      ? null
      : pharmacies.filter(
          (p) =>
            !term ||
            p.name.toLowerCase().includes(term) ||
            (p.city ?? "").toLowerCase().includes(term) ||
            (p.branch ?? "").toLowerCase().includes(term),
        );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Mis Farmacias</h1>
        <p className="text-muted text-sm">
          Las farmacias y dietéticas que sumaste al programa Geneo.
        </p>
      </header>

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
        <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-3">
          <p className="text-ink font-bold text-sm">Todavía no agregaste puntos de venta.</p>
          <p className="text-muted text-sm">
            Sumá el primero desde <span className="font-semibold text-ink">Puntos de venta</span>.
          </p>
          <Link
            href="/vendedor/farmacias"
            className="inline-flex items-center gap-2 min-h-11 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-xs px-5 transition-colors"
          >
            <Plus size={16} />
            Agregar punto de venta
          </Link>
        </div>
      )}

      {/* Buscador (solo si hay puntos de venta). */}
      {!loadError && pharmacies !== null && pharmacies.length > 0 && (
        <label className="relative flex items-center">
          <Search size={16} className="absolute left-4 text-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o ciudad…"
            className="w-full min-h-11 rounded-full border border-line bg-paper pl-10 pr-5 text-ink text-sm outline-none focus:border-geneo transition-colors"
          />
        </label>
      )}

      {!loadError &&
        pharmacies !== null &&
        pharmacies.length > 0 &&
        visible !== null &&
        visible.length === 0 && (
          <div className="bg-paper rounded-3xl shadow-soft px-6 py-8 text-center">
            <p className="text-muted text-sm">Sin resultados para “{q.trim()}”.</p>
          </div>
        )}

      {!loadError && visible !== null && visible.length > 0 && (
        <ul className="flex flex-col gap-3">
          {visible.map((p, i) => (
            <VendorPharmacyItem
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
