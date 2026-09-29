"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AlertCircle, Check, Gift, MapPin, Package, Search } from "lucide-react";
import { Badge, Card } from "@/components/ui";

/**
 * "Premios" del vendedor: lista los premios reclamados por los empleados de
 * sus farmacias (vendor_pharmacies) y permite marcarlos como entregados. Los
 * pendientes se muestran primero; la entrega la resuelve el servidor
 * verificando que el premio sea de una farmacia del vendedor de la sesión.
 */

type Prize = {
  id: string;
  employeeName: string;
  pharmacyName: string;
  pharmacyCity: string | null;
  /** Sucursal: distingue locales de la misma farmacia en una ciudad. */
  pharmacyBranch: string | null;
  prize: string;
  /** Producto que eligió el empleado (solo en "Producto a elección"). */
  product: { name: string; presentacion: string | null; img: string } | null;
  status: "requested" | "approved" | "delivered";
  createdAt: string;
  deliveredAt: string | null;
};

type PrizeFilter = "pending" | "delivered" | "all";

/** "Norte" → "Sucursal Norte"; si ya lo dice ("Sucursal Norte"), no lo repite. */
function branchLabel(branch: string | null) {
  if (!branch) return null;
  return /^sucursal\b/i.test(branch) ? branch : `Sucursal ${branch}`;
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" });

export default function PremiosVendedor() {
  const [prizes, setPrizes] = useState<Prize[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [delivering, setDelivering] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<PrizeFilter>("pending");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/vendedor/premios")
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json() as Promise<{ prizes?: Prize[] }>;
      })
      .then((json) => {
        if (cancelled) return;
        setPrizes(json.prizes ?? []);
        setLoadError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    if (!prizes) return null;
    return [...prizes].sort((a, b) => {
      const aPending = a.status !== "delivered";
      const bPending = b.status !== "delivered";
      if (aPending !== bPending) return aPending ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [prizes]);

  // PENDIENTE = todo lo que no esté "delivered" (ver GET /api/vendedor/premios).
  const pendingCount = useMemo(() => {
    if (!prizes) return null;
    return prizes.filter((p) => p.status !== "delivered").length;
  }, [prizes]);

  // Lista visible: filtrada por búsqueda (empleado/farmacia/premio) y por el
  // toggle "solo pendientes".
  const visible = useMemo(() => {
    if (!sorted) return null;
    const term = q.trim().toLowerCase();
    return sorted.filter((p) => {
      const delivered = p.status === "delivered";
      if (filter === "pending" && delivered) return false;
      if (filter === "delivered" && !delivered) return false;
      if (!term) return true;
      return (
        p.employeeName.toLowerCase().includes(term) ||
        p.pharmacyName.toLowerCase().includes(term) ||
        (p.pharmacyCity ?? "").toLowerCase().includes(term) ||
        (p.pharmacyBranch ?? "").toLowerCase().includes(term) ||
        p.prize.toLowerCase().includes(term) ||
        (p.product?.name.toLowerCase().includes(term) ?? false)
      );
    });
  }, [sorted, q, filter]);

  async function markDelivered(id: string) {
    setRowError(null);
    setDelivering(id);
    try {
      const res = await fetch("/api/vendedor/premios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId: id }),
      });
      const result: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !result.ok) {
        setRowError({ id, message: result.error ?? "No pudimos marcar el premio como entregado." });
        setDelivering(null);
        return;
      }
      setPrizes((prev) => (prev ?? []).map((p) => (p.id === id ? { ...p, status: "delivered" } : p)));
      setDelivering(null);
    } catch {
      setRowError({ id, message: "No pudimos marcar el premio como entregado." });
      setDelivering(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Premios</h1>
        <p className="text-muted text-sm">
          Los premios que reclamaron los empleados de tus farmacias.
        </p>
      </header>

      {/* Tarjeta-resumen: solo si hay al menos un premio. Con cero premios, el
          "Todo entregado ✓" confundía (daba a entender que hubo entregas); el
          estado vacío de abajo ya comunica "todavía no hay premios". */}
      {!loadError && pendingCount !== null && prizes !== null && prizes.length > 0 && (
        <Card
          variant={pendingCount > 0 ? "feature" : "quiet"}
          className="flex items-center gap-4 px-5 py-4"
        >
          <span
            className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${
              pendingCount > 0 ? "bg-geneo text-white" : "bg-rosa-suave/60 text-geneo"
            }`}
          >
            {pendingCount > 0 ? <Package size={20} /> : <Check size={20} strokeWidth={3} />}
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="font-extrabold text-ink text-lg leading-tight">
              {pendingCount > 0
                ? `${pendingCount} premio${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"} de entrega`
                : "Todo entregado ✓"}
            </p>
            <p className="text-muted text-sm leading-snug">
              {pendingCount > 0
                ? "Entregalos a tus empleados y marcalos abajo."
                : "No tenés premios esperando entrega."}
            </p>
          </div>
        </Card>
      )}

      {/* Buscador + toggle "solo pendientes" (solo si hay al menos un premio). */}
      {!loadError && sorted !== null && sorted.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="relative flex items-center">
            <Search size={16} className="absolute left-4 text-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar empleado, farmacia, sucursal…"
              className="w-full min-h-11 rounded-full border border-line bg-paper pl-10 pr-5 text-ink text-sm outline-none focus:border-geneo transition-colors"
            />
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-full bg-surface border border-line p-1">
            {(
              [
                ["pending", "Pendientes"],
                ["delivered", "Entregados"],
                ["all", "Todos"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`min-h-11 rounded-full text-sm font-bold tracking-tight transition-colors ${
                  filter === value
                    ? "bg-geneo text-white"
                    : "text-muted hover:text-geneo active:text-geneo"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loadError && (
        <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-3">
          <AlertCircle size={28} className="text-soft" />
          <p className="text-ink font-bold text-sm">No pudimos cargar los premios</p>
          <p className="text-muted text-sm">Revisá tu conexión e intentá de nuevo.</p>
        </div>
      )}

      {!loadError && sorted === null && (
        <ul className="flex flex-col gap-3" aria-hidden>
          {[0, 1].map((i) => (
            <li key={i} className="flex items-center gap-4 rounded-3xl px-4 py-4 bg-paper shadow-soft">
              <span className="w-11 h-11 rounded-full bg-line/60 animate-pulse shrink-0" />
              <span className="flex-1 h-4 rounded-full bg-line/60 animate-pulse" />
            </li>
          ))}
        </ul>
      )}

      {!loadError && sorted !== null && sorted.length === 0 && (
        <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-1">
          <p className="text-ink font-bold text-sm">
            Todavía no hay premios reclamados en tus farmacias.
          </p>
        </div>
      )}

      {!loadError && sorted !== null && sorted.length > 0 && visible !== null && visible.length === 0 && (
        <div className="bg-paper rounded-3xl shadow-soft px-6 py-8 text-center">
          <p className="text-muted text-sm">
            {q.trim()
              ? `Sin resultados para “${q.trim()}”.`
              : filter === "delivered"
                ? "Todavía no hay premios entregados."
                : filter === "pending"
                  ? "No tenés premios pendientes."
                  : "No hay premios."}
          </p>
        </div>
      )}

      {!loadError && visible !== null && visible.length > 0 && (
        <ul className="flex flex-col gap-3">
          {visible.map((p, i) => {
            const delivered = p.status === "delivered";
            return (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28, delay: Math.min(i, 8) * 0.05 }}
                className="flex flex-col gap-3 rounded-3xl px-4 py-4 bg-paper shadow-soft"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${
                      delivered ? "bg-rosa-suave/60 text-geneo" : "bg-rosa-suave text-geneo"
                    }`}
                  >
                    <Gift size={19} />
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    {/* Con producto, el título va sin el nombre: el producto
                        tiene su propio bloque abajo, sin truncar. */}
                    <p className="font-bold text-ink text-sm leading-tight line-clamp-2">
                      {p.product ? "Producto a elección" : p.prize}
                    </p>
                    <p className="text-muted text-xs truncate">{p.employeeName}</p>
                    <p className="text-soft text-[11px]">
                      {delivered && p.deliveredAt
                        ? `Entregado el ${dateFormatter.format(new Date(p.deliveredAt))}`
                        : dateFormatter.format(new Date(p.createdAt))}
                    </p>
                  </div>
                  {delivered ? (
                    <span className="flex items-center gap-1 text-geneo text-xs font-bold shrink-0">
                      <Check size={16} strokeWidth={3} />
                      Entregado
                    </span>
                  ) : (
                    <Badge tone="solid" className="shrink-0">
                      Pendiente
                    </Badge>
                  )}
                </div>

                {/* Dónde entregar: farmacia + ciudad/sucursal completas, sin
                    truncar, para no tener que ir a "Mis Farmacias" a buscarla. */}
                <div className="flex items-start gap-2.5 px-1">
                  <MapPin size={16} className="text-geneo shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <p className="text-ink text-sm font-bold leading-snug">{p.pharmacyName}</p>
                    {(p.pharmacyBranch || p.pharmacyCity) && (
                      <p className="text-muted text-xs leading-snug">
                        {[branchLabel(p.pharmacyBranch), p.pharmacyCity]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </div>

                {p.product && (
                  <div className="flex items-center gap-3 rounded-2xl bg-surface border border-line px-3 py-3">
                    <span className="relative w-14 h-14 shrink-0 rounded-xl bg-paper">
                      <Image src={p.product.img} alt="" fill sizes="56px" className="object-contain p-1" />
                    </span>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <p className="text-soft text-[11px] font-bold uppercase tracking-wide">Eligió</p>
                      <p className="text-ink font-bold text-sm leading-snug">{p.product.name}</p>
                      {p.product.presentacion && (
                        <p className="text-muted text-xs leading-snug">{p.product.presentacion}</p>
                      )}
                    </div>
                  </div>
                )}

                {!delivered && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => markDelivered(p.id)}
                      disabled={delivering === p.id}
                      className="inline-flex items-center justify-center rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-xs px-5 min-h-11 self-start transition-colors"
                    >
                      {delivering === p.id ? "Un momento…" : "Marcar entregado"}
                    </button>
                    {rowError?.id === p.id && (
                      <p role="alert" className="text-geneo text-sm font-medium">
                        {rowError.message}
                      </p>
                    )}
                  </div>
                )}
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
