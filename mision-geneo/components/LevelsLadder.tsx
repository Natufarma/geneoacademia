"use client";

import { motion } from "framer-motion";
import { Award, Check, Lock } from "lucide-react";
import { LEVELS, getLevel, getNextLevel } from "@/lib/levels";
import { Card, type CardVariant } from "@/components/ui";

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
        // El "pico" de la escalera: nivel máximo alcanzado. Único hero posible
        // acá, y solo puede darse para un nivel a la vez.
        const maxed = isCurrent && isTop;
        const variant: CardVariant = maxed ? "hero" : isCurrent ? "feature" : reached ? "quiet" : "base";

        return (
          <Card
            as={motion.div}
            key={lvl.n}
            variant={variant}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { ...spring, delay: i * 0.06 } }}
            className="flex items-start gap-4 px-4 py-4"
          >
            <span
              className={`flex items-center justify-center w-11 h-11 rounded-full font-extrabold shrink-0 ${
                maxed
                  ? "bg-white/20 text-white"
                  : isCurrent
                    ? "bg-rosa-suave text-geneo"
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
                  className={`font-bold leading-tight ${maxed ? "text-white" : "text-ink"}`}
                >
                  Nivel {lvl.n} · {lvl.name}
                </span>
                <span
                  className={`text-xs font-bold shrink-0 ${
                    maxed ? "text-white/85" : "text-soft"
                  }`}
                >
                  {lvl.min} pts
                </span>
              </div>
              <p
                className={`text-sm leading-snug ${
                  maxed ? "text-white/85" : "text-muted"
                }`}
              >
                {lvl.blurb}
              </p>

              {isCurrent && next && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="h-2 rounded-full bg-line/60 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-geneo"
                      initial={{ width: 0 }}
                      animate={{ width: `${toNext * 100}%` }}
                      transition={spring}
                    />
                  </div>
                  <span className="text-muted text-xs font-semibold">
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
          </Card>
        );
      })}
    </div>
  );
}
