"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RotateCcw, Trophy } from "lucide-react";

/**
 * Ranking del vendedor: solo lectura. Reusa el mismo endpoint /api/ranking
 * que la pantalla de empleados (app/ranking/page.tsx), pero acá solo se
 * muestra el ranking de farmacias — es lo que le importa al vendedor.
 */

type PharmacyRankRow = {
  position: number;
  name: string;
  city: string | null;
  score: number;
  activeCount: number;
};

type RankingResponse = {
  period: string;
  employees: unknown[];
  pharmacies: PharmacyRankRow[];
};

const MEDAL: Record<number, { bg: string }> = {
  1: { bg: "bg-oro" },
  2: { bg: "bg-plata" },
  3: { bg: "bg-bronce" },
};

/** "2026-07" → "julio 2026" */
function periodLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return new Date(y, m - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export default function RankingVendedor() {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ranking")
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json() as Promise<RankingResponse>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
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

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Ranking del mes</h1>
        <p className="text-muted text-sm">
          {data ? (
            <>
              Período de <span className="font-semibold text-ink">{periodLabel(data.period)}</span> ·
              resetea cada mes
            </>
          ) : (
            "El ranking mensual de todas las farmacias del programa."
          )}
        </p>
      </header>

      {loadError && (
        <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-3">
          <AlertCircle size={28} className="text-soft" />
          <p className="text-ink font-bold text-sm">No pudimos cargar el ranking</p>
          <p className="text-muted text-sm">Revisá tu conexión e intentá de nuevo.</p>
          <button
            type="button"
            onClick={() => {
              setLoadError(false);
              setData(null);
              setReloadKey((k) => k + 1);
            }}
            className="inline-flex items-center gap-2 min-h-11 rounded-full border-2 border-line text-muted hover:border-geneo hover:text-geneo active:border-geneo active:text-geneo font-bold uppercase tracking-wide text-xs px-5 transition-colors"
          >
            <RotateCcw size={14} />
            Reintentar
          </button>
        </div>
      )}

      {!loadError && data === null && (
        <ol className="flex flex-col gap-3" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="flex items-center gap-4 rounded-3xl px-4 py-4 bg-paper shadow-soft">
              <span className="w-11 h-11 rounded-full bg-line/60 animate-pulse shrink-0" />
              <span className="flex-1 h-4 rounded-full bg-line/60 animate-pulse" />
              <span className="w-12 h-4 rounded-full bg-line/60 animate-pulse shrink-0" />
            </li>
          ))}
        </ol>
      )}

      {!loadError && data !== null && data.pharmacies.length === 0 && (
        <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-1">
          <p className="text-ink font-bold text-sm">Ninguna farmacia sumó puntos todavía</p>
          <p className="text-muted text-sm">En cuanto un equipo empiece a jugar, aparece acá.</p>
        </div>
      )}

      {!loadError && data !== null && data.pharmacies.length > 0 && (
        <ol className="flex flex-col gap-3">
          {data.pharmacies.map((p, i) => {
            const medal = MEDAL[p.position];
            return (
              <motion.li
                key={p.position}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28, delay: Math.min(i, 8) * 0.05 }}
                className="flex items-center gap-4 rounded-3xl px-4 py-4 bg-paper shadow-soft"
              >
                <span
                  className={`flex items-center justify-center w-11 h-11 rounded-full font-extrabold text-sm shrink-0 ${
                    medal ? `${medal.bg} text-white` : "bg-rosa-suave text-geneo"
                  }`}
                >
                  {medal ? <Trophy size={19} /> : `${p.position}º`}
                </span>
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="font-bold text-ink leading-tight truncate">{p.name}</span>
                  <span className="text-soft text-xs">
                    {p.activeCount} {p.activeCount === 1 ? "empleado activo" : "empleados activos"}
                  </span>
                </span>
                <span className="text-ink font-extrabold text-base shrink-0">
                  {p.score.toLocaleString("es-AR")} <span className="text-soft text-xs font-semibold">pts</span>
                </span>
              </motion.li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
