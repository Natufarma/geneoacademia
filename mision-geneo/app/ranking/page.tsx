"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Info, RotateCcw, Store, Trophy, Users } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/lib/store";

/**
 * Ranking nacional de empleados y farmacias, alimentado por /api/ranking.
 * Período = mes calendario (resetea todos los meses); el nivel de
 * Especialista, el certificado y el saldo de canjes NO dependen de esto.
 */

type EmployeeRankRow = {
  position: number;
  displayName: string;
  points: number;
  isCurrentUser: boolean;
};

type PharmacyRankRow = {
  position: number;
  name: string;
  city: string | null;
  score: number;
  activeCount: number;
};

type RankingResponse = {
  period: string;
  employees: EmployeeRankRow[];
  pharmacies: PharmacyRankRow[];
};

type Tab = "empleados" | "farmacias";

const MEDAL: Record<number, { bg: string; label: string }> = {
  1: { bg: "bg-oro", label: "1º" },
  2: { bg: "bg-plata", label: "2º" },
  3: { bg: "bg-bronce", label: "3º" },
};

/** "2026-07" → "julio 2026" */
function periodLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return new Date(y, m - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export default function Ranking() {
  return (
    <AppShell>
      <RankingContent />
    </AppShell>
  );
}

function RankingContent() {
  const { pharmacyName } = useApp();
  const [tab, setTab] = useState<Tab>("empleados");
  const [data, setData] = useState<RankingResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
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
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">
          Ranking <span className="text-geneo">mensual</span>
        </h1>
        <p className="text-muted text-sm">
          {data ? (
            <>
              Período de <span className="font-semibold text-ink">{periodLabel(data.period)}</span> ·
              resetea cada mes
            </>
          ) : (
            "¡Tu farmacia puede ser la número 1!"
          )}
        </p>
      </header>

      <nav aria-label="Tipo de ranking" className="flex gap-1 bg-paper rounded-full shadow-soft p-1">
        {(
          [
            { id: "empleados" as const, label: "Empleados", icon: Users },
            { id: "farmacias" as const, label: "Farmacias", icon: Store },
          ]
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={`relative flex-1 inline-flex items-center justify-center gap-1.5 min-h-11 rounded-full text-sm font-bold tracking-tight transition-colors ${
              tab === id
                ? "text-white"
                : "text-muted hover:bg-rosa-suave/60 hover:text-geneo active:bg-rosa-suave/60 active:text-geneo"
            }`}
          >
            {tab === id && (
              <motion.span
                layoutId="ranking-tab-pill"
                className="absolute inset-0 bg-geneo rounded-full"
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              />
            )}
            <Icon size={16} className="relative z-10" />
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence initial={false}>
        {tab === "farmacias" && (
          <motion.p
            key="farmacias-note"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="flex items-center gap-2 text-muted text-xs leading-relaxed bg-rosa-suave/50 rounded-2xl px-4 py-3"
          >
            <Info size={15} className="text-geneo shrink-0" />
            El puntaje de cada farmacia es el promedio de sus <strong>3 empleados con más
            puntos</strong> este mes: así una farmacia chica puede competir de igual a igual con una
            más grande.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <RankingSkeleton />
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-3"
          >
            <AlertCircle size={28} className="text-soft" />
            <p className="text-ink font-bold text-sm">No pudimos cargar el ranking</p>
            <p className="text-muted text-sm">Revisá tu conexión e intentá de nuevo.</p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                setReloadKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-2 min-h-11 rounded-full border-2 border-line text-muted hover:border-geneo hover:text-geneo active:border-geneo active:text-geneo font-bold uppercase tracking-wide text-xs px-5 transition-colors"
            >
              <RotateCcw size={14} />
              Reintentar
            </button>
          </motion.div>
        )}

        {status === "ready" && data && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <AnimatePresence mode="wait">
              {tab === "empleados" ? (
                <motion.div
                  key="empleados"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  <EmployeesList rows={data.employees} />
                </motion.div>
              ) : (
                <motion.div
                  key="farmacias"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  <PharmaciesList rows={data.pharmacies} myPharmacyName={pharmacyName} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RankingSkeleton() {
  return (
    <ol className="flex flex-col gap-3" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          className="flex items-center gap-4 rounded-3xl px-4 py-4 bg-paper shadow-soft"
        >
          <span className="w-11 h-11 rounded-full bg-line/60 animate-pulse shrink-0" />
          <span className="flex-1 h-4 rounded-full bg-line/60 animate-pulse" />
          <span className="w-12 h-4 rounded-full bg-line/60 animate-pulse shrink-0" />
        </li>
      ))}
    </ol>
  );
}

function EmployeesList({ rows }: { rows: EmployeeRankRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-1">
        <p className="text-ink font-bold text-sm">Todavía nadie sumó puntos este mes</p>
        <p className="text-muted text-sm">Completá una misión o la pregunta del día para abrir el ranking.</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {rows.map((r, i) => {
        const medal = MEDAL[r.position];
        return (
          <motion.li
            key={r.position}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, delay: Math.min(i, 8) * 0.05 }}
            className={`flex items-center gap-4 rounded-3xl px-4 py-4 ${
              r.isCurrentUser ? "bg-paper shadow-card ring-2 ring-geneo" : "bg-paper shadow-soft"
            }`}
          >
            <span
              className={`flex items-center justify-center w-11 h-11 rounded-full font-extrabold text-sm shrink-0 ${
                medal ? `${medal.bg} text-white` : "bg-rosa-suave text-geneo"
              }`}
            >
              {medal ? <Trophy size={19} /> : `${r.position}º`}
            </span>
            <span className="flex-1 min-w-0">
              <span className={`flex items-center gap-2 font-bold leading-tight ${r.isCurrentUser ? "text-geneo" : "text-ink"}`}>
                {r.displayName}
                {r.isCurrentUser && (
                  <span className="text-xs font-bold uppercase tracking-wide bg-rosa-suave text-geneo rounded-full px-2 py-0.5 shrink-0">
                    Vos
                  </span>
                )}
              </span>
            </span>
            <span className="text-ink font-extrabold text-base shrink-0">
              {r.points.toLocaleString("es-AR")} <span className="text-soft text-xs font-semibold">pts</span>
            </span>
          </motion.li>
        );
      })}
    </ol>
  );
}

function PharmaciesList({
  rows,
  myPharmacyName,
}: {
  rows: PharmacyRankRow[];
  myPharmacyName: string | null;
}) {
  if (rows.length === 0) {
    return (
      <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-1">
        <p className="text-ink font-bold text-sm">Ninguna farmacia sumó puntos todavía</p>
        <p className="text-muted text-sm">En cuanto un equipo empiece a jugar, aparece acá.</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {rows.map((p, i) => {
        const isMine = p.name === myPharmacyName;
        const medal = MEDAL[p.position];
        return (
          <motion.li
            key={p.position}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, delay: Math.min(i, 8) * 0.05 }}
            className={`flex items-center gap-4 rounded-3xl px-4 py-4 ${
              isMine ? "bg-paper shadow-card ring-2 ring-geneo" : "bg-paper shadow-soft"
            }`}
          >
            <span
              className={`flex items-center justify-center w-11 h-11 rounded-full font-extrabold text-sm shrink-0 ${
                medal ? `${medal.bg} text-white` : "bg-rosa-suave text-geneo"
              }`}
            >
              {medal ? <Trophy size={19} /> : `${p.position}º`}
            </span>
            <span className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="flex items-center gap-2 min-w-0">
                <span className={`font-bold leading-tight truncate ${isMine ? "text-geneo" : "text-ink"}`}>
                  {p.name}
                </span>
                {isMine && (
                  <span className="text-xs font-bold uppercase tracking-wide bg-rosa-suave text-geneo rounded-full px-2 py-0.5 shrink-0">
                    Tu farmacia
                  </span>
                )}
              </span>
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
  );
}
