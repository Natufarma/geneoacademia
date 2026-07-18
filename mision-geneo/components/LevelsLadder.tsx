"use client";

import { motion } from "framer-motion";
import { Award, Check, Lock } from "lucide-react";
import { LEVELS, getLevel, getNextLevel } from "@/lib/levels";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

/**
 * Escalera de niveles de Especialista Geneo. Muestra los 3 niveles, resalta
 * el actual y el progreso hacia el siguiente. La lámina de Lakhu menciona
 * "Niveles de Especialista Geneo" como parte de la Academia (etapa 2).
 */
export default function LevelsLadder({ points }: { points: number }) {
  const current = getLevel(points);
  const next = getNextLevel(points);
  const toNext = next
    ? Math.min(1, Math.max(0, (points - current.min) / (next.min - current.min)))
    : 1;

  return (
    <div className="flex flex-col gap-3">
      {LEVELS.map((lvl, i) => {
        const reached = points >= lvl.min;
        const isCurrent = lvl.n === current.n;
        const isTop = lvl.n === LEVELS.length;

        return (
          <motion.div
            key={lvl.n}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { ...spring, delay: i * 0.06 } }}
            className={`flex items-start gap-4 rounded-3xl px-4 py-4 ${
              isCurrent
                ? "bg-gradient-to-br from-geneo to-geneo-dark text-white shadow-card"
                : reached
                  ? "bg-rosa-suave/60"
                  : "bg-paper/60"
            }`}
          >
            <span
              className={`flex items-center justify-center w-11 h-11 rounded-full font-extrabold shrink-0 ${
                isCurrent
                  ? "bg-white/20 text-white"
                  : reached
                    ? "bg-geneo text-white"
                    : "bg-line text-soft"
              }`}
            >
              {isTop ? (
                reached ? (
                  <Award size={20} />
                ) : (
                  <Lock size={17} />
                )
              ) : reached && !isCurrent ? (
                <Check size={20} strokeWidth={3} />
              ) : (
                lvl.n
              )}
            </span>

            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`font-bold leading-tight ${isCurrent ? "text-white" : "text-ink"}`}
                >
                  Nivel {lvl.n} · {lvl.name}
                </span>
                <span
                  className={`text-xs font-bold shrink-0 ${
                    isCurrent ? "text-white/85" : "text-soft"
                  }`}
                >
                  {lvl.min} pts
                </span>
              </div>
              <p
                className={`text-sm leading-snug ${
                  isCurrent ? "text-white/85" : "text-muted"
                }`}
              >
                {lvl.blurb}
              </p>

              {isCurrent && next && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="h-2 rounded-full bg-white/25 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${toNext * 100}%` }}
                      transition={spring}
                    />
                  </div>
                  <span className="text-white/85 text-xs font-semibold">
                    Te faltan {next.min - points} pts para {next.name}
                  </span>
                </div>
              )}
              {isCurrent && !next && (
                <span className="text-white/85 text-xs font-semibold pt-1">
                  ¡Nivel máximo alcanzado!
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
