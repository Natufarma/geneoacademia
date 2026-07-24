"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles, X } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card } from "@/components/ui";
import { ACTIVES } from "@/lib/actives";
import { buildActivesQuiz } from "@/lib/practica";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

export default function Practica() {
  return (
    <AppShell>
      <PracticaContent />
    </AppShell>
  );
}

type Mode = "flashcards" | "quiz";

function PracticaContent() {
  const [mode, setMode] = useState<Mode>("flashcards");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">
          Práctica <span className="text-geneo">sin presión</span>
        </h1>
        <p className="text-muted text-sm">
          Repasá los 9 activos a tu ritmo. Acá no se pierde nada: es para aprender.
        </p>
      </header>

      <nav aria-label="Modo de práctica" className="flex gap-1 bg-paper rounded-full shadow-soft p-1">
        {(
          [
            { id: "flashcards" as const, label: "Flashcards" },
            { id: "quiz" as const, label: "Quiz" },
          ]
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            aria-current={mode === id ? "page" : undefined}
            className={`relative flex-1 inline-flex items-center justify-center min-h-11 rounded-full text-sm font-bold tracking-tight transition-colors ${
              mode === id
                ? "text-white"
                : "text-muted hover:text-geneo active:text-geneo"
            }`}
          >
            {mode === id && (
              <motion.span
                layoutId="practica-tab-pill"
                className="absolute inset-0 bg-geneo rounded-full"
                transition={spring}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        {mode === "flashcards" ? (
          <motion.div
            key="flashcards"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={spring}
          >
            <Flashcards />
          </motion.div>
        ) : (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={spring}
          >
            <Quiz />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── Flashcards ───────────────────────── */

function Flashcards() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const active = ACTIVES[index];

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((i) => (i + delta + ACTIVES.length) % ACTIVES.length);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-soft text-xs font-bold uppercase tracking-widest text-center">
        {index + 1} / {ACTIVES.length}
      </p>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Ver el nombre" : "Ver la explicación"}
        className="relative w-full aspect-[4/5] [perspective:1200px]"
      >
        <motion.div
          className="absolute inset-0 [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={spring}
        >
          {/* Frente: foto + nombre */}
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl bg-paper shadow-card overflow-hidden flex flex-col">
            <div className="relative flex-1 bg-surface">
              <Image src={active.img} alt="" fill sizes="(max-width: 480px) 100vw, 448px" className="object-cover" />
            </div>
            <div className="p-5 flex items-center justify-between gap-3">
              <span className="text-ink font-extrabold text-lg leading-tight tracking-tight">
                {active.name}
              </span>
              <span className="text-soft text-xs font-semibold shrink-0">Tocá para ver ›</span>
            </div>
          </div>

          {/* Dorso: explicación */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl bg-gradient-to-br from-geneo to-geneo-dark text-white shadow-card p-6 flex flex-col gap-3 justify-center">
            <span className="text-white/75 text-[11px] font-bold uppercase tracking-widest">
              {active.name}
            </span>
            <p className="text-base leading-relaxed">{active.description}</p>
            {active.products.length > 0 && (
              <p className="text-white/85 text-sm">
                Está en: <strong>{active.products.join(" · ")}</strong>
              </p>
            )}
          </div>
        </motion.div>
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Anterior"
          className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-line text-muted hover:border-geneo hover:text-geneo active:border-geneo active:text-geneo transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="flex-1 inline-flex items-center justify-center gap-2 min-h-12 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 transition-colors"
        >
          Siguiente
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Quiz de práctica ───────────────────────── */

function Quiz() {
  const questions = useMemo(() => buildActivesQuiz(), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const answered = selected !== null;

  const pick = (i: number) => {
    if (answered) return;
    setSelected(i);
    if (i === q.correctIndex) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setDone(false);
  };

  if (done) {
    return (
      <Card variant="feature" className="flex flex-col items-center text-center gap-4 p-8">
        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-rosa-suave text-geneo">
          <Sparkles size={30} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-ink font-extrabold text-2xl tracking-tight">
            {correct} / {questions.length}
          </p>
          <p className="text-muted text-sm leading-snug">
            {correct === questions.length
              ? "¡Perfecto! Dominás los activos."
              : "Buen repaso. Volvé a intentarlo para afianzar lo que falta."}
          </p>
        </div>
        <button
          type="button"
          onClick={restart}
          className="w-full inline-flex items-center justify-center gap-2 min-h-11 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
        >
          <RotateCcw size={16} />
          Practicar de nuevo
        </button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-soft text-xs font-bold uppercase tracking-widest text-center">
        Pregunta {index + 1} / {questions.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={spring}
          className="flex flex-col gap-4"
        >
          <Card variant="feature" className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-geneo text-[11px] font-bold uppercase tracking-widest">
                ¿De qué activo hablamos?
              </span>
              <p className="text-ink font-bold text-base leading-snug">{q.prompt}</p>
            </div>

            <div className="flex flex-col gap-2.5" role="group" aria-label="Opciones">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correctIndex;
                const isChosen = selected === i;
                const revealCorrect = answered && isCorrect;
                const revealWrong = answered && isChosen && !isCorrect;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => pick(i)}
                    disabled={answered}
                    className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-[15px] font-semibold transition-colors ${
                      revealCorrect
                        ? "border-geneo bg-rosa-suave text-geneo"
                        : revealWrong
                          ? "border-geneo/40 bg-surface text-soft line-through"
                          : answered
                            ? "border-line bg-surface text-soft"
                            : "border-line bg-surface text-ink hover:border-geneo/50 active:border-geneo/50"
                    }`}
                  >
                    {opt}
                    {revealCorrect && <Check size={18} strokeWidth={3} className="shrink-0" />}
                    {revealWrong && <X size={18} strokeWidth={3} className="shrink-0" />}
                  </button>
                );
              })}
            </div>

            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                className="flex flex-col gap-1 rounded-2xl bg-rosa-suave/50 px-4 py-3"
              >
                <p className="text-ink font-bold text-sm">
                  {selected === q.correctIndex ? "¡Correcto! 🎉" : `Era: ${q.active.name}`}
                </p>
                <p className="text-muted text-sm leading-snug">{q.active.description}</p>
              </motion.div>
            )}
          </Card>

          <button
            type="button"
            onClick={next}
            disabled={!answered}
            className="w-full inline-flex items-center justify-center gap-2 min-h-12 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 transition-colors"
          >
            {index < questions.length - 1 ? "Siguiente" : "Ver resultado"}
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
