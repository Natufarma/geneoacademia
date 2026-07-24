"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, Gift } from "lucide-react";

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
  prize: string;
  status: "requested" | "approved" | "delivered";
  createdAt: string;
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" });

export default function PremiosVendedor() {
  const [prizes, setPrizes] = useState<Prize[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [delivering, setDelivering] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

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

      {!loadError && sorted !== null && sorted.length > 0 && (
        <ul className="flex flex-col gap-3">
          {sorted.map((p, i) => {
            const delivered = p.status === "delivered";
            return (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28, delay: Math.min(i, 8) * 0.05 }}
                className="flex flex-col gap-3 rounded-3xl px-5 py-4 bg-paper shadow-soft"
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
                    <p className="font-bold text-ink text-sm leading-tight truncate">{p.prize}</p>
                    <p className="text-muted text-xs truncate">
                      {p.employeeName} · {p.pharmacyName}
                    </p>
                    <p className="text-soft text-[11px]">{dateFormatter.format(new Date(p.createdAt))}</p>
                  </div>
                  {delivered && (
                    <span className="flex items-center gap-1 text-geneo text-xs font-bold shrink-0">
                      <Check size={16} strokeWidth={3} />
                      Entregado
                    </span>
                  )}
                </div>

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
