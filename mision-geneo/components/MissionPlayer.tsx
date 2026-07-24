"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, ArrowRight, Lock, Star, Award } from "lucide-react";
import Confetti from "@/components/Confetti";
import { CorrectBurst, CountUp } from "@/components/CorrectCelebration";
import { MISSIONS, getMission, stepPoints, type Mission, type StepContent, type StepMatch, type StepQuiz } from "@/lib/missions";
import { useApp } from "@/lib/store";

/**
 * Motor de misiones: renderiza cualquier misión definida como datos en
 * lib/missions.ts (pasos content | quiz | match). Al completar el último paso
 * registra la misión en el store y muestra la celebración.
 */
export default function MissionPlayer({ slug }: { slug: string }) {
  const mission = getMission(slug);
  const router = useRouter();
  const { pharmacyName, progress, completeMission, points, isSpecialist } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  // Un intento por pregunta: si erra, la misión vuelve a empezar. `attempt`
  // remonta los pasos para resetear su estado interno; `failed` muestra el aviso.
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  if (!mission) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-surface px-6">
        <p className="text-ink font-bold text-lg text-center">Esa misión no existe.</p>
        <Link
          href="/misiones"
          className="inline-flex min-h-11 items-center text-geneo font-semibold underline"
        >
          Volver a mis misiones
        </Link>
      </div>
    );
  }

  // Gate de la Academia: la prueba avanzada exige ser Especialista, incluso
  // entrando por URL directa. La guía de estudio, en cambio, es libre.
  if (mission.advanced && !isSpecialist) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-rosa-suave text-geneo">
          <Lock size={24} />
        </span>
        <p className="text-ink font-bold text-lg">
          Esta prueba se desbloquea al completar las 6 misiones.
        </p>
        <Link
          href="/academia/activos"
          className="inline-flex min-h-11 items-center text-geneo font-semibold underline"
        >
          Mientras tanto, repasá la guía de activos
        </Link>
        <Link
          href="/misiones"
          className="inline-flex min-h-11 items-center text-muted font-semibold underline"
        >
          Volver a mis misiones
        </Link>
      </div>
    );
  }

  const step = mission.steps[stepIndex];
  const isLast = stepIndex === mission.steps.length - 1;

  const advance = async () => {
    if (!isLast) {
      setStepIndex((i) => i + 1);
      return;
    }
    if (completing) return; // evita doble submit mientras espera al servidor
    setCompleting(true);
    setCompleteError(null);
    // El puntaje lo decide el servidor (catálogo de lib/missions.ts, nunca un
    // número que mande el cliente); acá solo mandamos el slug.
    const result = await completeMission(mission.slug);
    setCompleting(false);
    if (!result.ok) {
      setCompleteError(result.error);
      return;
    }
    setFinished(true);
  };

  // Respuesta incorrecta: no hay descarte ni segunda chance dentro de la
  // pregunta. Se avisa y se reinicia la misión desde el paso 1 (sin revelar la
  // correcta), para que completarla exija saber de verdad.
  const failMission = () => setFailed(true);
  const restart = () => {
    setFailed(false);
    setStepIndex(0);
    setAttempt((a) => a + 1);
  };

  if (finished) {
    return (
      <MissionComplete
        mission={mission}
        totalPoints={points}
        progress={progress}
        pharmacyName={pharmacyName ?? undefined}
      />
    );
  }

  return (
    <>
      <div className="min-h-dvh bg-surface">
        <div className="max-w-md mx-auto px-5 pt-5 pb-12 flex flex-col gap-6">
        {/* Header con progreso de pasos */}
        <header className="flex items-center gap-4">
          {/* Área táctil 44px (Mobile §2.1); el círculo visible queda de 36px. */}
          <button
            type="button"
            onClick={() => router.push("/misiones")}
            aria-label="Salir de la misión"
            className="flex items-center justify-center w-11 h-11 -m-1 shrink-0 text-muted hover:text-ink active:text-ink transition-colors"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-paper shadow-soft">
              <X size={18} />
            </span>
          </button>
          <div className="flex-1 h-2 rounded-full bg-rosa-suave overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-geneo"
              initial={false}
              animate={{ width: `${((stepIndex + 1) / mission.steps.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            />
          </div>
          <span className="text-soft text-xs font-bold shrink-0">
            {stepIndex + 1}/{mission.steps.length}
          </span>
        </header>

        <div className="flex flex-col gap-1">
          <p className="text-geneo text-[11px] font-bold uppercase tracking-widest">
            {mission.advanced
              ? `Academia Geneo · Avanzada`
              : mission.campaign
                ? `Campaña · ${mission.season}`
                : `Misión ${mission.order} · ${mission.short}`}
          </p>
          <h1 className="text-ink font-extrabold text-2xl tracking-tight leading-tight">
            {mission.title}
          </h1>
          {mission.advanced && (
            <Link
              href="/academia/activos"
              className="self-start inline-block py-3 -my-3 text-geneo text-sm font-semibold underline underline-offset-2"
            >
              Repasá la guía de activos
            </Link>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${attempt}-${stepIndex}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {step.type === "content" && (
              <ContentStep step={step} onNext={advance} isLast={isLast} busy={completing} />
            )}
            {step.type === "quiz" && (
              <QuizStep
                key={`quiz-${stepIndex}`}
                step={step}
                onNext={advance}
                onWrong={failMission}
                isLast={isLast}
                busy={completing}
              />
            )}
            {step.type === "match" && (
              <MatchStep
                key={`match-${stepIndex}`}
                step={step}
                onNext={advance}
                onWrong={failMission}
                isLast={isLast}
                busy={completing}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {completeError && (
          <p role="alert" className="text-geneo text-sm font-semibold text-center -mt-2">
            {completeError} Probá de nuevo.
          </p>
        )}
        </div>
      </div>

      {/* Respuesta incorrecta → volver a empezar (sin revelar la correcta) */}
      <AnimatePresence>
        {failed && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fail-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <motion.div
              className="w-full max-w-xs bg-paper rounded-3xl shadow-card p-6 flex flex-col items-center text-center gap-5"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <motion.span
                initial={{ scale: 0, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 16 }}
                className="text-5xl leading-none"
              >
                😢
              </motion.span>
              <div className="flex flex-col gap-1.5">
                <h2 id="fail-title" className="text-ink font-extrabold text-lg tracking-tight">
                  Respuesta incorrecta
                </h2>
                <p className="text-muted text-sm leading-snug">
                  Para completar la misión hay que responder todo bien. Volvés a empezar desde el
                  principio.
                </p>
              </div>
              <button
                type="button"
                onClick={restart}
                className="w-full inline-flex items-center justify-center rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
              >
                Volver a empezar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ───────────────────────── Paso: contenido ───────────────────────── */

function NextButton({
  onClick,
  isLast,
  disabled,
  busy,
}: {
  onClick: () => void;
  isLast: boolean;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
    >
      {isLast && busy ? "Guardando…" : isLast ? "Completar misión" : "Continuar"}
      <ArrowRight size={18} />
    </button>
  );
}

function ContentStep({
  step,
  onNext,
  isLast,
  busy,
}: {
  step: StepContent;
  onNext: () => void;
  isLast: boolean;
  busy?: boolean;
}) {
  return (
    <div className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4">
      {step.image && (
        <div className="relative -mx-6 -mt-6 h-56 overflow-hidden rounded-t-3xl">
          <Image src={step.image} alt="" fill className="object-cover object-[50%_66%]" />
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        <h2 className="text-ink font-bold text-lg leading-snug">{step.title}</h2>
        <p className="text-muted text-[15px] leading-relaxed">{step.body}</p>
      </div>
      {step.bullets && (
        <ul className="flex flex-col gap-2.5">
          {step.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 rounded-2xl bg-rosa-suave/60 px-4 py-3">
              <Check size={16} strokeWidth={3} className="text-geneo mt-0.5 shrink-0" />
              <span className="text-ink text-sm font-medium leading-snug">{b}</span>
            </li>
          ))}
        </ul>
      )}
      <NextButton onClick={onNext} isLast={isLast} busy={busy} />
    </div>
  );
}

/* ───────────────────────── Paso: quiz ───────────────────────── */

function QuizStep({
  step,
  onNext,
  onWrong,
  isLast,
  busy,
}: {
  step: StepQuiz;
  onNext: () => void;
  onWrong: () => void;
  isLast: boolean;
  busy?: boolean;
}) {
  // Una sola elección: si acierta queda "solved"; si erra, avisa al padre para
  // reiniciar la misión. No hay descarte ni segundo intento dentro de la pregunta.
  const [chosen, setChosen] = useState<number | null>(null);
  const solved = chosen !== null && Boolean(step.options[chosen]?.correct);

  const pick = (i: number) => {
    if (chosen !== null) return; // ya respondió
    setChosen(i);
    if (!step.options[i].correct) onWrong();
  };

  return (
    <div className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4">
      {step.context && (
        <p className="text-muted text-sm italic leading-relaxed bg-rosa-suave/60 rounded-2xl px-4 py-3">
          {step.context}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <h2 className="text-ink font-bold text-lg leading-snug">{step.question}</h2>
        <p className="text-soft text-xs font-semibold">
          Una sola respuesta. Si errás, la misión vuelve a empezar.
        </p>
      </div>

      <div className="flex flex-col gap-2.5" role="group" aria-label="Opciones">
        {step.options.map((opt, i) => {
          const isChosen = chosen === i;
          const chosenCorrect = isChosen && Boolean(opt.correct);
          const chosenWrong = isChosen && !opt.correct;
          return (
            <motion.button
              key={opt.label}
              type="button"
              onClick={() => pick(i)}
              disabled={chosen !== null}
              animate={{ scale: chosenCorrect ? 1.03 : 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className={`relative flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-[15px] font-semibold transition-colors ${
                chosenCorrect
                  ? "border-geneo bg-rosa-suave text-geneo"
                  : chosenWrong
                    ? "border-geneo/60 bg-surface text-ink"
                    : "border-line bg-surface text-ink hover:border-geneo/50 active:border-geneo/50 disabled:opacity-50"
              }`}
            >
              {opt.label}
              {chosenCorrect && <Check size={18} strokeWidth={3} className="shrink-0" />}
              {chosenWrong && <X size={18} strokeWidth={3} className="shrink-0" />}
              {chosenCorrect && <CorrectBurst />}
            </motion.button>
          );
        })}
      </div>

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <p className="flex items-center gap-2 text-geneo font-bold text-sm">
            <Star size={16} className="fill-geneo" />
            <span className="tabular-nums">
              +<CountUp to={step.points} /> puntos
            </span>
            {step.feedback && <span className="text-muted font-medium">· {step.feedback}</span>}
          </p>
        </motion.div>
      )}

      <NextButton onClick={onNext} isLast={isLast} disabled={!solved} busy={busy} />
    </div>
  );
}

/* ───────────────────────── Paso: match (unir pares) ───────────────────────── */

function MatchStep({
  step,
  onNext,
  onWrong,
  isLast,
  busy,
}: {
  step: StepMatch;
  onNext: () => void;
  onWrong: () => void;
  isLast: boolean;
  busy?: boolean;
}) {
  // Orden pseudo-aleatorio pero DETERMINISTA de la columna derecha (evita
  // mismatch de hidratación; con 4 pares alcanza para que no quede espejado).
  const rightOrder = useMemo(() => {
    const n = step.pairs.length;
    // (1 - i) mod n: derangement simple — ninguna fila queda alineada con su par.
    return step.pairs.map((_, i) => (((1 - i) % n) + n) % n);
  }, [step.pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const done = matched.size === step.pairs.length;

  const pickRight = (pairIndex: number) => {
    if (selectedLeft === null || matched.has(pairIndex)) return;
    if (pairIndex === selectedLeft) {
      setMatched((prev) => new Set(prev).add(pairIndex));
      setSelectedLeft(null);
    } else {
      // Par equivocado: sin reintentos, la misión vuelve a empezar.
      onWrong();
    }
  };

  return (
    <div className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-ink font-bold text-lg leading-snug">{step.prompt}</h2>
        <p className="text-muted text-sm">
          Tocá un activo y después su beneficio. Cada par suma {step.pointsPerPair} pts.
        </p>
        <p className="text-soft text-xs font-semibold">
          Si errás un par, la misión vuelve a empezar.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Columna izquierda: activos */}
        <div className="flex flex-col gap-2.5">
          {step.pairs.map((pair, i) => {
            const isMatched = matched.has(i);
            const isSelected = selectedLeft === i;
            return (
              <button
                key={pair.left}
                type="button"
                onClick={() => !isMatched && setSelectedLeft(i)}
                disabled={isMatched}
                className={`rounded-2xl border-2 px-3 py-3 text-left text-[13px] font-bold leading-snug transition-colors min-h-16 ${
                  isMatched
                    ? "border-geneo/30 bg-rosa-suave/60 text-geneo/60"
                    : isSelected
                      ? "border-geneo bg-rosa-suave text-geneo"
                      : "border-line bg-surface text-ink hover:border-geneo/50 active:border-geneo/50"
                }`}
              >
                {pair.left}
                {isMatched && <Check size={14} strokeWidth={3} className="inline ml-1.5 -mt-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Columna derecha: beneficios (orden mezclado) */}
        <div className="flex flex-col gap-2.5">
          {rightOrder.map((pairIndex) => {
            const pair = step.pairs[pairIndex];
            const isMatched = matched.has(pairIndex);
            return (
              <button
                key={pair.right}
                type="button"
                onClick={() => pickRight(pairIndex)}
                disabled={isMatched || selectedLeft === null}
                className={`rounded-2xl border-2 px-3 py-3 text-left text-[13px] font-medium leading-snug transition-colors min-h-16 ${
                  isMatched
                    ? "border-geneo/30 bg-rosa-suave/60 text-geneo/60"
                    : selectedLeft === null
                      ? "border-line bg-surface text-soft"
                      : "border-line bg-surface text-ink hover:border-geneo/50 active:border-geneo/50"
                }`}
              >
                {pair.right}
                {isMatched && <Check size={14} strokeWidth={3} className="inline ml-1.5 -mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {done ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="relative flex items-center gap-2 text-geneo font-bold text-sm"
        >
          <Star size={16} className="fill-geneo" />
          <span className="tabular-nums">
            +<CountUp to={stepPoints(step)} /> puntos
          </span>{" "}
          · ¡Todos los pares unidos!
          <CorrectBurst />
        </motion.p>
      ) : (
        matched.size > 0 && (
          <p className="text-muted text-sm font-medium">
            {matched.size}/{step.pairs.length} pares unidos.
          </p>
        )
      )}

      <NextButton onClick={onNext} isLast={isLast} disabled={!done} busy={busy} />
    </div>
  );
}

/* ───────────────────────── Celebración ───────────────────────── */

function MissionComplete({
  mission,
  totalPoints,
  progress,
  pharmacyName,
}: {
  mission: Mission;
  totalPoints: number;
  progress: Record<string, unknown>;
  pharmacyName?: string;
}) {
  const coreDone = MISSIONS.every((m) => Boolean(progress[m.slug]));
  // La celebración de Especialista (premio inmediato + certificado) es solo
  // para el cierre del viaje core: las misiones de Academia y las campañas
  // tienen la suya.
  const allDone = coreDone && !mission.advanced && !mission.campaign;
  const isAdvanced = Boolean(mission.advanced);
  const isCampaign = Boolean(mission.campaign);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-geneo to-geneo-dark text-white flex items-center justify-center px-6">
      <Confetti />
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, type: "spring", bounce: 0.4 }}
        className="max-w-md w-full flex flex-col items-center text-center gap-5 py-14"
      >
        <motion.span
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.55 }}
          className="flex items-center justify-center w-24 h-24 rounded-full bg-white/15"
        >
          {allDone ? <Award size={46} /> : <Star size={46} className="fill-white" />}
        </motion.span>

        <div className="flex flex-col gap-2">
          <h1 className="font-extrabold text-3xl tracking-tight leading-tight">
            {allDone
              ? "¡Sos una ESPECIALISTA GENEO!"
              : isAdvanced
                ? "¡NIVEL EXPERTO SUPERADO!"
                : isCampaign
                  ? "¡CAMPAÑA COMPLETADA!"
                  : "¡MISIÓN COMPLETADA!"}
          </h1>
          <p className="text-white/85 text-base leading-relaxed">
            {allDone
              ? "Completaste el viaje entero. Tu certificado te espera."
              : isAdvanced
                ? `Superaste “${mission.title}”. Ahora dominás la ciencia Geneo como nadie.`
                : isCampaign
                  ? `Sumaste la campaña “${mission.title}”. Atenta a las próximas de temporada.`
                  : `Terminaste “${mission.title}”.`}
          </p>
        </div>

        <div className="flex items-center gap-6 bg-white/10 rounded-3xl px-8 py-4">
          <div className="flex flex-col gap-1">
            <span className="font-extrabold text-2xl leading-none">+{mission.pointsTotal}</span>
            <span className="text-white/75 text-xs font-semibold uppercase tracking-wide">
              esta misión
            </span>
          </div>
          <div className="w-px h-10 bg-white/25" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <span className="font-extrabold text-2xl leading-none">{totalPoints}</span>
            <span className="text-white/75 text-xs font-semibold uppercase tracking-wide">
              puntaje total
            </span>
          </div>
        </div>

        {/* Premio inmediato (lámina Lakhu: "TU PREMIO INMEDIATO") */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.45 }}
            className="w-full flex items-center gap-4 bg-white/10 rounded-3xl px-5 py-4 text-left"
          >
            <span className="relative w-14 h-14 rounded-2xl bg-white/90 overflow-hidden shrink-0">
              <Image src="/img/prod-45.webp" alt="Geneo 45+" fill className="object-contain p-1" />
            </span>
            <span className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="block text-white/75 text-[10px] font-bold uppercase tracking-widest">
                Tu premio inmediato
              </span>
              <span className="block font-bold text-sm leading-tight">
                Pack de muestras Geneo 45+
              </span>
              <span className="block text-white/85 text-xs">
                Envío sin cargo · En camino a {pharmacyName ?? "tu farmacia"}
              </span>
            </span>
          </motion.div>
        )}

        <div className="flex flex-col gap-3 w-full">
          {allDone && (
            <Link
              href="/certificado"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-geneo font-bold uppercase tracking-wide text-sm px-6 py-4"
            >
              Ver mi certificado
              <Award size={18} />
            </Link>
          )}
          {(isAdvanced || isCampaign) && (
            <Link
              href="/recompensas"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-geneo font-bold uppercase tracking-wide text-sm px-6 py-4"
            >
              Canjeá tus puntos
              <Star size={18} />
            </Link>
          )}
          <Link
            href="/misiones"
            className={`w-full inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-wide text-sm px-6 py-4 ${
              allDone || isAdvanced || isCampaign
                ? "text-white/90 underline underline-offset-4"
                : "bg-white text-geneo"
            }`}
          >
            {allDone || isAdvanced || isCampaign ? "Volver a mis misiones" : "Seguir mi viaje"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
