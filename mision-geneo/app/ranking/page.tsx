"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import AppShell from "@/components/AppShell";
import { PHARMACIES } from "@/lib/pharmacies";
import { useApp } from "@/lib/store";

const MEDAL: Record<number, { bg: string; label: string }> = {
  0: { bg: "bg-oro", label: "1º" },
  1: { bg: "bg-plata", label: "2º" },
  2: { bg: "bg-bronce", label: "3º" },
};

export default function Ranking() {
  return (
    <AppShell>
      <RankingContent />
    </AppShell>
  );
}

function RankingContent() {
  const { pharmacyName } = useApp();
  // TODO fase 2: agregado real de puntos por farmacia (compras sell-in +
  // misiones del equipo). Por ahora el ranking usa puntajes de referencia.
  const sorted = [...PHARMACIES].sort((a, b) => b.rankingPoints - a.rankingPoints);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">
          Ranking <span className="text-geneo">mensual</span>
        </h1>
        <p className="text-muted text-sm">¡Tu farmacia puede ser la número 1!</p>
      </header>

      <ol className="flex flex-col gap-3">
        {sorted.map((p, i) => {
          const isMine = p.name === pharmacyName;
          const medal = MEDAL[i];
          return (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28, delay: i * 0.07 }}
              className={`flex items-center gap-4 rounded-3xl px-4 py-4 ${
                isMine
                  ? "bg-paper shadow-card ring-2 ring-geneo"
                  : "bg-paper shadow-soft"
              }`}
            >
              <span
                className={`flex items-center justify-center w-11 h-11 rounded-full font-extrabold text-sm shrink-0 ${
                  medal ? `${medal.bg} text-white` : "bg-rosa-suave text-geneo"
                }`}
              >
                {medal ? <Trophy size={19} /> : `${i + 1}º`}
              </span>
              <span className="flex-1 min-w-0">
                <span className={`block font-bold leading-tight ${isMine ? "text-geneo" : "text-ink"}`}>
                  {p.name}
                  {isMine && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide bg-rosa-suave text-geneo rounded-full px-2 py-0.5 align-middle">
                      Tu farmacia
                    </span>
                  )}
                </span>
              </span>
              <span className="text-ink font-extrabold text-base shrink-0">
                {p.rankingPoints.toLocaleString("es-AR")}{" "}
                <span className="text-soft text-xs font-semibold">pts</span>
              </span>
            </motion.li>
          );
        })}
      </ol>

      <p className="text-soft text-xs leading-relaxed text-center px-4">
        El ranking se actualiza con las compras de tu farmacia y las misiones
        completadas por el equipo.
      </p>
    </div>
  );
}
