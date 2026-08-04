"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Store } from "lucide-react";
import type { VendorSummary } from "@/lib/admin-data";
import { setVendorActive } from "../(protected)/vendedores/actions";
import { fmtDate } from "./ui";

const COLS = "grid grid-cols-[1.1fr_1.3fr_74px_1.3fr_84px_200px] gap-4";

/**
 * Badge de estado + botón dar de baja / reactivar (con confirmación).
 * orientation="row" (tabla de escritorio) pone badge y botón en línea;
 * "col" (tarjeta mobile) los apila.
 */
function VendorControls({
  vendor,
  orientation = "col",
}: {
  vendor: VendorSummary;
  orientation?: "row" | "col";
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  function act(active: boolean) {
    setError("");
    startTransition(async () => {
      const res = await setVendorActive(vendor.id, active);
      if (!res.ok) setError(res.error);
      else setConfirming(false);
    });
  }

  const badge = vendor.active
    ? "bg-rosa-suave text-geneo"
    : "bg-line/60 text-soft";

  const row = orientation === "row";
  const wrap = row
    ? "flex flex-wrap items-center gap-2"
    : "flex flex-col items-start gap-1.5";

  return (
    <div className={wrap}>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${badge}`}
      >
        {vendor.active ? "Activo" : "Dado de baja"}
      </span>

      {vendor.active ? (
        confirming ? (
          <div className={row ? "flex items-center gap-1.5" : "flex flex-col gap-1.5"}>
            <span className="text-muted text-xs">{row ? "¿Seguro?" : "¿Dar de baja a este vendedor?"}</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => act(false)}
                disabled={pending}
                className="inline-flex items-center rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold text-xs px-3 min-h-11 transition-colors"
              >
                {pending ? "Un momento…" : "Sí, dar de baja"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={pending}
                className="inline-flex items-center rounded-full border border-line text-muted hover:text-geneo active:text-geneo font-bold text-xs px-3 min-h-11 transition-colors"
              >
                No
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center rounded-full border border-line text-muted hover:border-geneo hover:text-geneo active:text-geneo font-semibold text-xs px-3 min-h-11 transition-colors"
          >
            Dar de baja
          </button>
        )
      ) : (
        <button
          type="button"
          onClick={() => act(true)}
          disabled={pending}
          className="inline-flex items-center rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold text-xs px-3 min-h-11 transition-colors"
        >
          {pending ? "Un momento…" : "Reactivar"}
        </button>
      )}

      {error && <span className="text-geneo text-xs font-medium">{error}</span>}
    </div>
  );
}

export default function VendorsTable({ vendors }: { vendors: VendorSummary[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return vendors;
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(term) ||
        (v.email ?? "").toLowerCase().includes(term) ||
        v.pharmacyNames.some((n) => n.toLowerCase().includes(term)),
    );
  }, [q, vendors]);

  return (
    <div className="flex flex-col gap-4">
      <label className="relative flex items-center">
        <Search size={16} className="absolute left-4 text-soft" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, email o farmacia…"
          className="w-full min-h-11 rounded-full border-2 border-line bg-paper pl-10 pr-5 text-ink text-sm outline-none focus:border-geneo transition-colors"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="bg-paper rounded-2xl md:rounded-3xl shadow-soft px-5 py-8 text-muted text-sm text-center">
          Sin resultados para “{q}”.
        </p>
      ) : (
        <>
          {/* Mobile: tarjetas apiladas. */}
          <ul className="md:hidden flex flex-col gap-3">
            {filtered.map((v) => (
              <li key={v.id} className="bg-paper rounded-2xl shadow-soft p-4 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-ink font-bold text-sm leading-tight">{v.name}</span>
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-rosa-suave text-geneo px-2.5 py-1 text-xs font-bold">
                    <Store size={12} />
                    {v.pharmacyCount}
                  </span>
                </div>
                {v.email && <span className="text-muted text-xs break-all">{v.email}</span>}
                <div className="flex flex-col gap-0.5">
                  <span className="text-soft text-[10px] font-bold uppercase tracking-widest">
                    Puntos de venta
                  </span>
                  <span className="text-muted text-sm leading-snug">
                    {v.pharmacyNames.length ? v.pharmacyNames.join(" · ") : "—"}
                  </span>
                </div>
                <span className="text-soft text-xs">Alta: {fmtDate(v.createdAt)}</span>
                <div className="border-t border-line pt-2.5">
                  <VendorControls vendor={v} />
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: tabla con las columnas alineadas. */}
          <div className="hidden md:block overflow-x-auto scrollbar-hide bg-paper rounded-3xl shadow-soft">
            <div className="min-w-[880px]">
              <div
                className={`${COLS} px-5 py-3 border-b border-line text-soft text-[11px] font-bold uppercase tracking-widest`}
              >
                <span>Vendedor</span>
                <span>Email</span>
                <span className="text-center">Farmacias</span>
                <span>Puntos de venta</span>
                <span className="text-right">Alta</span>
                <span>Estado</span>
              </div>
              <div className="divide-y divide-line">
                {filtered.map((v) => (
                  <div key={v.id} className={`${COLS} items-center px-5 py-3.5`}>
                    <span className="text-ink font-semibold text-sm truncate">{v.name}</span>
                    <span className="text-muted text-sm truncate">{v.email ?? "—"}</span>
                    <span className="flex justify-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rosa-suave text-geneo px-2.5 py-1 text-xs font-bold">
                        <Store size={12} />
                        {v.pharmacyCount}
                      </span>
                    </span>
                    <span className="text-muted text-sm truncate">
                      {v.pharmacyNames.length ? v.pharmacyNames.join(" · ") : "—"}
                    </span>
                    <span className="text-muted text-sm text-right">{fmtDate(v.createdAt)}</span>
                    <VendorControls vendor={v} orientation="row" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <p className="text-soft text-xs">
        {filtered.length} de {vendors.length} vendedores.
      </p>
    </div>
  );
}
