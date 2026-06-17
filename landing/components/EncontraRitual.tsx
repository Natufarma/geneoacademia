"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, Zap, Heart, Check, ArrowRight, Droplets, Star } from "lucide-react";
import Reveal from "@/components/Reveal";

/* Cada objetivo mapea a un ritual real con sus productos. El resultado
   se calcula en vivo según lo que elige la persona. */
const opcionesPotenciar = [
  "Glow y luminosidad",
  "Firmeza y elasticidad",
  "Pelo y uñas",
  "Bronceado",
  "Nueva etapa 45+",
] as const;

type Objetivo = (typeof opcionesPotenciar)[number];

const opcionesNotar = ["Hidratación", "Más energía", "Piel más lisa", "Uñas más fuertes"];

const rituales: Record<Objetivo, { nombre: string; desc: string; productos: string[] }> = {
  "Glow y luminosidad": {
    nombre: "Glow",
    desc: "Luminosidad e hidratación profunda desde adentro.",
    productos: ["Geneo Piel Saludable", "Geneo Beauty"],
  },
  "Firmeza y elasticidad": {
    nombre: "Firmeza",
    desc: "Estructura, densidad y elasticidad de la piel.",
    productos: ["Geneo Piel Saludable", "Geneo 45+"],
  },
  "Pelo y uñas": {
    nombre: "Fuerza",
    desc: "Pelo más fuerte y uñas saludables desde la raíz.",
    productos: ["Geneo Beauty"],
  },
  Bronceado: {
    nombre: "Sol",
    desc: "Bronceado parejo y protección desde adentro.",
    productos: ["Geneo Solar"],
  },
  "Nueva etapa 45+": {
    nombre: "Renovación",
    desc: "Renovación y firmeza para tu nueva etapa.",
    productos: ["Geneo 45+", "Geneo Piel Saludable"],
  },
};

const badges = [
  { icono: Sparkles, titulo: "Ingredientes premium", subtitulo: "Ciencia + naturaleza" },
  { icono: Shield, titulo: "Resultados reales", subtitulo: "Con constancia" },
  { icono: Zap, titulo: "Rutinas simples", subtitulo: "Fáciles de incorporar" },
  { icono: Heart, titulo: "Belleza desde adentro", subtitulo: "Por fuera y por dentro" },
];

const timeline = [
  { dias: "20", desc: "hidratación" },
  { dias: "40", desc: "glow natural" },
  { dias: "90", desc: "más firmeza" },
];

function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`rounded-full px-5 h-11 text-xs font-medium transition-colors duration-300 cursor-pointer ${
        selected
          ? "bg-geneo text-white"
          : "bg-black/[0.05] text-ink hover:bg-geneo/10 hover:text-geneo"
      }`}
    >
      {label}
    </motion.button>
  );
}

function Paso({
  numero,
  pregunta,
  children,
}: {
  numero: string;
  pregunta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-geneo font-medium text-xl leading-none">{numero}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <p className="font-medium text-ink text-base tracking-tight">{pregunta}</p>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </div>
  );
}

export default function EncontraRitual() {
  const [potenciar, setPotenciar] = useState<Objetivo>("Glow y luminosidad");
  const [notar, setNotar] = useState<string | null>(null);

  const ritual = rituales[potenciar];

  return (
    <section id="ritual-finder" className="relative z-[30] bg-surface py-16 sm:py-36 px-4 sm:px-6">
      <div className="relative w-full max-w-[1440px] mx-auto flex flex-col gap-16">
        {/* Header */}
        <Reveal className="text-center flex flex-col items-center gap-4" blur={8}>
          <p className="text-xs font-semibold tracking-[0.2em] text-geneo uppercase">
            Tu ritual Geneo
          </p>
          <h2 className="uppercase text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[1.05] tracking-tight text-ink">
            Encontrá <span className="text-geneo">tu ritual</span>
          </h2>
          <p className="text-muted text-base max-w-md">
            Respondé 2 preguntas y descubrí qué Geneo es para vos.
          </p>
        </Reveal>

        <Reveal blur={10}>
          <div className="grid lg:grid-cols-[1.25fr_1fr] bg-white rounded-3xl shadow-card overflow-hidden">
            {/* Preguntas */}
            <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-center gap-10 sm:gap-12">
              <Paso numero="01" pregunta="¿Qué querés potenciar?">
                {opcionesPotenciar.map((op) => (
                  <Pill
                    key={op}
                    label={op}
                    selected={potenciar === op}
                    onClick={() => setPotenciar(op)}
                  />
                ))}
              </Paso>

              <Paso numero="02" pregunta="¿Qué te gustaría notar primero?">
                {opcionesNotar.map((op) => (
                  <Pill
                    key={op}
                    label={op}
                    selected={notar === op}
                    onClick={() => setNotar((prev) => (prev === op ? null : op))}
                  />
                ))}
              </Paso>
            </div>

            {/* Resultado — bloque magenta */}
            <div className="relative bg-geneo p-6 sm:p-10 lg:p-12 text-white flex flex-col gap-6">
              {/* Encabezado del resultado: label + nombre + descripción, agrupados */}
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/85">
                  Tu ritual
                </p>

                <div className="h-[3.5rem] sm:h-20">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={ritual.nombre}
                      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                      transition={{ type: "spring", stiffness: 200, damping: 26 }}
                      className="text-[clamp(2.25rem,6vw,3.75rem)] font-medium leading-none tracking-tight text-white"
                    >
                      {ritual.nombre}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <p className="text-white/85 text-sm min-h-[2.5rem]">{ritual.desc}</p>
              </div>

              {/* Recomendado: label + productos + nota, agrupados con gap */}
              <div className="flex flex-col gap-3">
                <p className="text-[11px] uppercase tracking-wider font-medium text-white/75">
                  Recomendado para vos
                </p>
                <div className="flex flex-col gap-2.5">
                  <AnimatePresence mode="popLayout">
                    {ritual.productos.map((p) => (
                      <motion.div
                        key={p}
                        layout
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        className="flex items-center gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span className="text-sm font-medium">{p}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {notar && (
                  <p className="text-xs text-white/75">
                    Vas a notar primero:{" "}
                    <span className="font-medium text-white">{notar.toLowerCase()}</span>.
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-auto pt-8 border-t border-white/15">
                {timeline.map((step, i) => (
                  <div key={step.dias} className="flex flex-col items-center flex-1 gap-1">
                    {i === 0 ? (
                      <Droplets size={16} className="text-white" />
                    ) : i === 1 ? (
                      <Sparkles size={16} className="text-white" />
                    ) : (
                      <Star size={16} className="text-white" />
                    )}
                    <span className="text-sm font-medium leading-none">+{step.dias}</span>
                    <span className="text-[10px] text-white/75 text-center leading-tight">
                      {step.desc}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="#rituales"
                className="group bg-white text-geneo w-full h-12 rounded-full flex items-center justify-center gap-2 font-medium text-sm hover:bg-white/90 active:bg-white/90 transition-colors duration-300"
              >
                Ver mi ritual
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1" />
              </a>
            </div>
          </div>
        </Reveal>

        {/* Trust badges — bento blanco flotante */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {badges.map((b, i) => {
            const Icono = b.icono;
            return (
              <Reveal key={b.titulo} delay={i * 0.08} y={14}>
                <div className="h-full bg-white rounded-3xl shadow-soft p-6 flex flex-col items-start gap-3 hover:shadow-card hover:-translate-y-1 transition-all duration-300">
                  <span className="w-10 h-10 rounded-full bg-geneo/8 flex items-center justify-center">
                    <Icono className="text-geneo" size={18} aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-ink">{b.titulo}</p>
                    <p className="text-xs text-muted leading-snug">{b.subtitulo}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
