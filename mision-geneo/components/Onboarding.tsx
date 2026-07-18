"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { Award, Check, Flame, Gift, Star } from "lucide-react";

/**
 * Onboarding animado (se muestra una sola vez, antes del registro).
 *
 * Coreografía (skills motion-framer + apple-design):
 * - Carrusel con drag 1:1 interrumpible: el track sigue al dedo, y al soltar
 *   se proyecta el momentum (deceleración exponencial) para decidir el slide
 *   destino; la velocidad del gesto se entrega al spring (sin "costura"
 *   entre arrastre y animación). Rubber-band en los bordes via dragElastic.
 * - Contenido de cada slide con stagger de entrada (springs, sin tweens).
 * - prefers-reduced-motion: sin stagger ni desplazamientos (solo fades del
 *   kill switch global de globals.css).
 */

export const ONBOARDING_KEY = "mision-geneo:onboarding-v1";

const SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;

/** Proyección de momentum (Apple, Designing Fluid Interfaces). */
function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/* ───────────────────────── Contenido de los slides ───────────────────────── */

const SLIDE_COUNT = 4;

/** Variants compartidas: contenedor con stagger + ítems que suben con spring. */
const stagger = {
  hide: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
} as const;

const rise = {
  hide: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: SPRING },
} as const;

function SlideMarca({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Foto de marca con entrada de escala (spring, una sola vez) */}
      <motion.div
        initial={false}
        animate={active && !reduce ? { scale: 1 } : { scale: 1.08 }}
        transition={{ type: "spring", stiffness: 60, damping: 22 }}
        className="absolute inset-0"
      >
        <Image
          src="/img/onboarding-brand.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 448px"
          className="object-cover"
        />
      </motion.div>
      {/* Scrim para legibilidad del texto */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-geneo-dark/85 via-geneo-dark/15 to-ink/25"
        aria-hidden="true"
      />
      <motion.div
        variants={stagger}
        initial="hide"
        animate={active ? "show" : "hide"}
        className="absolute inset-x-0 bottom-0 px-7 pb-44 flex flex-col gap-3 text-white"
      >
        <motion.p
          variants={rise}
          className="text-white/85 text-[11px] font-bold uppercase tracking-[0.25em]"
        >
          Programa para Farmacias Aliadas
        </motion.p>
        <motion.h2
          variants={rise}
          className="font-extrabold text-4xl leading-[1.08] tracking-tight"
        >
          La belleza
          <br />
          empieza adentro…
        </motion.h2>
        <motion.p variants={rise} className="text-rosa-suave font-bold text-2xl leading-snug">
          y se celebra afuera.
        </motion.p>
      </motion.div>
      {/* Logo arriba */}
      <div className="absolute top-0 inset-x-0 px-7 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <Image src="/img/logo-white.webp" alt="Geneo" width={96} height={32} priority />
      </div>
    </div>
  );
}

function SlideJugar({ active }: { active: boolean }) {
  return (
    <div className="h-full w-full bg-surface flex flex-col justify-center px-7">
      <motion.div
        variants={stagger}
        initial="hide"
        animate={active ? "show" : "hide"}
        className="flex flex-col gap-6 pb-36"
      >
        <div className="flex flex-col gap-2.5">
          <motion.h2
            variants={rise}
            className="text-ink font-extrabold text-3xl leading-tight tracking-tight"
          >
            Aprendé <span className="text-geneo">jugando</span>
          </motion.h2>
          <motion.p variants={rise} className="text-muted text-base leading-relaxed">
            Misiones cortas e interactivas para volverte experta en Geneo, en
            minutos y desde el mostrador.
          </motion.p>
        </div>

        {/* Mini-card de misión (insinúa la UI real) */}
        <motion.div variants={rise} className="relative">
          <div
            className="absolute inset-0 translate-y-3 rotate-2 rounded-3xl bg-rosa-suave"
            aria-hidden="true"
          />
          <div className="relative bg-paper rounded-3xl shadow-card p-5 flex flex-col gap-3.5">
            <p className="text-geneo text-[10px] font-bold uppercase tracking-widest">
              Misión 3 · Recomendación
            </p>
            <p className="text-ink font-bold text-base leading-snug">
              ¿Qué Geneo le recomendarías a Camila?
            </p>
            <div className="flex flex-col gap-2">
              <motion.div
                initial={false}
                animate={
                  active
                    ? { scale: 1, transition: { ...SPRING, delay: 0.55 } }
                    : { scale: 0.97 }
                }
                className="flex items-center justify-between rounded-2xl border-2 border-geneo bg-rosa-suave/60 px-4 py-3"
              >
                <span className="text-ink font-semibold text-sm">Piel Saludable</span>
                <motion.span
                  initial={false}
                  animate={
                    active
                      ? { scale: 1, rotate: 0, transition: { ...SPRING, delay: 0.65 } }
                      : { scale: 0, rotate: -30 }
                  }
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-geneo text-white"
                >
                  <Check size={14} strokeWidth={3.5} />
                </motion.span>
              </motion.div>
              <div className="flex items-center rounded-2xl border-2 border-line px-4 py-3">
                <span className="text-soft font-semibold text-sm">Solar</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function SlideSumar({ active }: { active: boolean }) {
  const chips = [
    { icon: Star, label: "+100 pts por misión" },
    { icon: Flame, label: "Racha de la pregunta del día" },
    { icon: Gift, label: "Canjeá premios reales" },
  ];
  return (
    <div className="h-full w-full bg-gradient-to-br from-geneo to-geneo-dark flex flex-col justify-center px-7 text-white">
      <motion.div
        variants={stagger}
        initial="hide"
        animate={active ? "show" : "hide"}
        className="flex flex-col gap-6 pb-36"
      >
        <div className="flex flex-col gap-2.5">
          <motion.h2 variants={rise} className="font-extrabold text-3xl leading-tight tracking-tight">
            Sumá puntos,
            <br />
            canjeá premios
          </motion.h2>
          <motion.p variants={rise} className="text-white/85 text-base leading-relaxed">
            Cada misión y cada pregunta del día suman. Subí en el ranking con tu
            farmacia y desbloqueá beneficios.
          </motion.p>
        </div>
        <div className="flex flex-col gap-3">
          {chips.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              variants={rise}
              className="flex items-center gap-3.5 rounded-full bg-white/12 px-5 py-3.5"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 shrink-0">
                <Icon size={18} />
              </span>
              <span className="font-bold text-[15px]">{label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SlideEspecialista({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-full w-full bg-surface flex flex-col justify-center px-7 overflow-hidden">
      <div
        className="anim-breathe absolute -top-24 -right-24 w-80 h-80 rounded-full bg-rosa-suave blur-3xl"
        aria-hidden="true"
      />
      <motion.div
        variants={stagger}
        initial="hide"
        animate={active ? "show" : "hide"}
        className="relative flex flex-col items-center text-center gap-6 pb-36"
      >
        <motion.span
          initial={false}
          animate={
            active
              ? {
                  scale: 1,
                  rotate: 0,
                  transition: reduce
                    ? SPRING
                    : { type: "spring", stiffness: 260, damping: 18, delay: 0.15 },
                }
              : { scale: 0, rotate: -20 }
          }
          className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-geneo to-geneo-dark text-white shadow-card"
        >
          <Award size={38} />
        </motion.span>
        <div className="flex flex-col gap-2.5">
          <motion.h2
            variants={rise}
            className="text-ink font-extrabold text-3xl leading-tight tracking-tight"
          >
            Convertite en
            <br />
            <span className="text-geneo">Especialista Geneo</span>
          </motion.h2>
          <motion.p variants={rise} className="text-muted text-base leading-relaxed">
            Completá tu viaje, obtené tu certificado oficial y llevá tu farmacia
            al siguiente nivel.
          </motion.p>
        </div>
        {/* Mini certificado (el payoff del programa) */}
        <motion.div
          variants={rise}
          className="w-full max-w-[300px] bg-paper rounded-3xl shadow-card overflow-hidden"
        >
          <div className="h-2 bg-gradient-to-r from-geneo to-geneo-dark" aria-hidden="true" />
          <div className="px-6 py-5 flex flex-col items-center gap-1.5">
            <Image src="/img/logo-fuxia.webp" alt="" width={72} height={24} />
            <p className="text-soft text-[10px] font-bold uppercase tracking-[0.22em]">
              Certificado
            </p>
            <p className="text-geneo font-extrabold text-sm uppercase tracking-wide">
              Especialista Geneo
            </p>
          </div>
        </motion.div>
        <motion.p variants={rise} className="text-ink font-semibold text-sm leading-snug">
          Cada recomendación transforma la vida de alguien.
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ───────────────────────────── Onboarding ───────────────────────────── */

export default function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const isLast = index === SLIDE_COUNT - 1;

  const width = () => viewportRef.current?.offsetWidth ?? 0;

  const goTo = (next: number, velocity = 0) => {
    const clamped = Math.max(0, Math.min(SLIDE_COUNT - 1, next));
    setIndex(clamped);
    animate(x, -clamped * width(), { ...SPRING, velocity });
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    // Momentum: proyectamos a dónde IBA el gesto y elegimos ese slide.
    const projected = x.get() + project(info.velocity.x);
    goTo(Math.round(-projected / Math.max(1, width())), info.velocity.x);
  };

  const onFirstSlide = index === 0;
  const onDark = index === 0 || index === 2; // slides con fondo oscuro/foto

  return (
    <motion.div
      exit={{ opacity: 0, y: -24, transition: SPRING }}
      className="fixed inset-0 z-50 bg-surface"
    >
      <div className="relative h-dvh max-w-md mx-auto overflow-hidden" ref={viewportRef}>
        {/* Track deslizable */}
        <motion.div
          drag="x"
          dragConstraints={viewportRef}
          dragElastic={0.12}
          onDragEnd={onDragEnd}
          style={{ x }}
          className="flex h-full cursor-grab active:cursor-grabbing"
        >
          {[SlideMarca, SlideJugar, SlideSumar, SlideEspecialista].map((Slide, i) => (
            <div key={i} className="h-full w-full shrink-0">
              <Slide active={index === i} />
            </div>
          ))}
        </motion.div>

        {/* Saltar */}
        <div className="absolute top-0 right-0 pt-[max(1rem,env(safe-area-inset-top))] pr-4">
          <button
            type="button"
            onClick={onFinish}
            className={`inline-flex items-center min-h-11 px-4 rounded-full text-sm font-bold transition-colors ${
              onFirstSlide
                ? "text-white/90 hover:text-white active:text-white"
                : onDark
                  ? "text-white/85 hover:text-white active:text-white"
                  : "text-muted hover:text-ink active:text-ink"
            }`}
          >
            Saltar
          </button>
        </div>

        {/* Controles inferiores */}
        <div className="absolute inset-x-0 bottom-0 px-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-5">
          {/* Dots (el activo se estira a píldora) */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Progreso">
            {Array.from({ length: SLIDE_COUNT }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={index === i}
                aria-label={`Pantalla ${i + 1}`}
                onClick={() => goTo(i)}
                className="flex items-center justify-center min-w-11 min-h-11 -mx-3"
              >
                <motion.span
                  initial={false}
                  animate={{
                    width: index === i ? 26 : 8,
                    opacity: index === i ? 1 : 0.45,
                    transition: SPRING,
                  }}
                  className={`h-2 rounded-full ${onDark ? "bg-white" : "bg-geneo"}`}
                />
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="relative w-full">
            {isLast && (
              <div
                className="anim-breathe absolute -inset-1.5 rounded-full bg-geneo/25 blur-lg"
                aria-hidden="true"
              />
            )}
            <motion.button
              type="button"
              onClick={() => (isLast ? onFinish() : goTo(index + 1))}
              whileTap={{ scale: 0.97 }}
              transition={SPRING}
              className={`relative w-full inline-flex items-center justify-center min-h-11 rounded-full font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors ${
                onDark
                  ? "bg-white text-geneo hover:bg-rosa-suave active:bg-rosa-suave"
                  : "bg-geneo text-white hover:bg-geneo-hover active:bg-geneo-hover"
              }`}
            >
              {isLast ? "Comenzar" : "Continuar"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
