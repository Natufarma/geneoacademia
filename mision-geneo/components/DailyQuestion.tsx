"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Flame, X } from "lucide-react";
import { DAILY_POINTS, dayKey, questionForToday } from "@/lib/daily";
import { useApp } from "@/lib/store";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

/**
 * Card de la pregunta del día (home de misiones). Un intento por día:
 * participar mantiene la racha, acertar suma DAILY_POINTS.
 */
export default function DailyQuestion() {
  const { answeredToday, streak, daily, answerDaily } = useApp();
  const question = questionForToday();
  const [picked, setPicked] = useState<number | null>(null);

  const todayEntry = daily[dayKey()];
  const justAnswered = picked !== null;

  const onPick = (index: number) => {
    if (answeredToday || picked !== null) return;
    const result = answerDaily(index);
    if (result) setPicked(index);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.05 } }}
      transition={spring}
      className="bg-paper rounded-3xl shadow-card p-5 flex flex-col gap-4"
    >
      <header className="flex items-center gap-3">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-rosa-suave text-geneo shrink-0">
          <Flame size={20} />
        </span>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <h2 className="text-ink font-bold text-base leading-tight">Pregunta del día</h2>
          <p className="text-muted text-xs">
            +{DAILY_POINTS} pts por acertar · 1 intento por día
          </p>
        </div>
        {streak >= 1 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rosa-suave text-geneo font-extrabold text-sm px-3.5 py-1.5 shrink-0">
            <Flame size={15} />
            {streak}
          </span>
        )}
      </header>

      {answeredToday && !justAnswered ? (
        // Ya respondió hoy (en otra sesión): estado de descanso.
        <div className="flex flex-col gap-1.5 rounded-2xl bg-rosa-suave/50 px-4 py-3.5">
          <p className="text-ink font-bold text-sm">
            {todayEntry?.correct
              ? `¡Hoy sumaste ${todayEntry.points} pts! 🔥`
              : "Hoy participaste y tu racha sigue viva. 🔥"}
          </p>
          <p className="text-muted text-sm">
            ¡Volvé mañana por la próxima!{streak >= 1 ? ` Racha: ${streak} ${streak === 1 ? "día" : "días"}.` : ""}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-ink font-semibold text-[15px] leading-snug">{question.question}</p>
          <div className="flex flex-col gap-2">
            {question.options.map((option, i) => {
              const isCorrect = i === question.correctIndex;
              const isPicked = picked === i;
              const revealed = justAnswered;
              return (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => onPick(i)}
                  disabled={revealed}
                  initial={false}
                  animate={{ scale: isPicked ? 1.02 : 1 }}
                  transition={spring}
                  className={`flex items-center justify-between gap-3 min-h-11 rounded-2xl border-2 px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                    revealed && isCorrect
                      ? "border-geneo bg-rosa-suave/60 text-geneo"
                      : revealed && isPicked
                        ? "border-line bg-surface text-soft"
                        : revealed
                          ? "border-line bg-surface text-soft"
                          : "border-line bg-surface text-ink hover:border-geneo/50 active:border-geneo/50"
                  }`}
                >
                  {option}
                  {revealed && isCorrect && <Check size={17} strokeWidth={3} className="shrink-0" />}
                  {revealed && isPicked && !isCorrect && <X size={17} strokeWidth={3} className="shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {justAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="flex flex-col gap-1 rounded-2xl bg-rosa-suave/50 px-4 py-3"
            >
              <p className="text-ink font-bold text-sm">
                {picked === question.correctIndex
                  ? `¡Correcto! +${DAILY_POINTS} pts 🔥`
                  : "Esta vez no fue, pero tu racha sigue viva. 🔥"}
              </p>
              <p className="text-muted text-sm leading-snug">{question.feedback}</p>
            </motion.div>
          )}
        </div>
      )}
    </motion.section>
  );
}
