"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Flame, Loader2, X } from "lucide-react";
import { dayKey, type PublicDailyQuestion } from "@/lib/daily";
import { useApp } from "@/lib/store";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; question: PublicDailyQuestion; points: number };

type AnswerResult = { correct: boolean; points: number; feedback: string; correctIndex: number };

/**
 * Card de la pregunta del día (home de misiones). El servidor decide TODO:
 * la pregunta se pide a GET /api/daily (nunca trae la respuesta correcta) y
 * el resultado se pide a POST /api/daily recién cuando el usuario ya eligió
 * una opción — por eso hay un estado "submitting" entre el click y el
 * reveal: no hay nada que adivinar en el cliente.
 */
export default function DailyQuestion() {
  const { answeredToday, streak, daily, answerDaily } = useApp();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [picked, setPicked] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/daily")
      .then(async (res) => {
        if (!res.ok) throw new Error("request failed");
        return (await res.json()) as { question: PublicDailyQuestion; points: number };
      })
      .then((data) => {
        if (!cancelled) setState({ status: "ready", question: data.question, points: data.points });
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            status: "error",
            message: "No pudimos cargar la pregunta de hoy. Revisá tu conexión.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const todayEntry = daily[dayKey()];
  const justAnswered = result !== null;

  const onPick = async (index: number) => {
    if (answeredToday || picked !== null || submitting) return;
    setPicked(index);
    setSubmitting(true);
    setError(null);
    const res = await answerDaily(index);
    setSubmitting(false);
    if (!res.ok) {
      setPicked(null);
      setError(res.error);
      return;
    }
    setResult(res);
  };

  if (state.status === "loading") {
    return (
      <section className="bg-paper rounded-3xl shadow-card p-5 flex items-center justify-center gap-2 text-muted text-sm min-h-24">
        <Loader2 size={16} className="animate-spin" />
        Cargando la pregunta de hoy…
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="bg-paper rounded-3xl shadow-card p-5 flex flex-col items-center gap-1 text-center">
        <p className="text-ink font-bold text-sm">{state.message}</p>
      </section>
    );
  }

  const { question } = state;

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
            Sumá un día a tu racha · 1 intento por día
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
              ? "¡Respondiste bien hoy! 🔥"
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
              const isPicked = picked === i;
              const revealed = justAnswered;
              const isCorrectRevealed = revealed && result.correctIndex === i;
              return (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => onPick(i)}
                  disabled={picked !== null}
                  initial={false}
                  animate={{ scale: isPicked ? 1.02 : 1 }}
                  transition={spring}
                  className={`flex items-center justify-between gap-3 min-h-11 rounded-2xl border-2 px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                    isCorrectRevealed
                      ? "border-geneo bg-rosa-suave/60 text-geneo"
                      : revealed && isPicked
                        ? "border-line bg-surface text-soft"
                        : revealed
                          ? "border-line bg-surface text-soft"
                          : isPicked && submitting
                            ? "border-geneo/50 bg-surface text-ink"
                            : "border-line bg-surface text-ink hover:border-geneo/50 active:border-geneo/50"
                  }`}
                >
                  {option}
                  {isPicked && submitting && <Loader2 size={16} className="animate-spin shrink-0" />}
                  {isCorrectRevealed && <Check size={17} strokeWidth={3} className="shrink-0" />}
                  {revealed && isPicked && !isCorrectRevealed && <X size={17} strokeWidth={3} className="shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {error && (
            <p className="text-geneo text-sm font-semibold" role="alert">
              {error}
            </p>
          )}

          {justAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="flex flex-col gap-1 rounded-2xl bg-rosa-suave/50 px-4 py-3"
            >
              <p className="text-ink font-bold text-sm">
                {result.correct
                  ? "¡Correcto! Tu racha sigue creciendo. 🔥"
                  : "Esta vez no fue, pero tu racha sigue viva. 🔥"}
              </p>
              <p className="text-muted text-sm leading-snug">{result.feedback}</p>
            </motion.div>
          )}
        </div>
      )}
    </motion.section>
  );
}
