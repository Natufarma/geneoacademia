"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { TIENDA_URL } from "@/lib/site";

/* Imagen de cada producto recomendado (para mostrar el resultado con foto). */
const prodImg: Record<string, string> = {
  "Geneo Piel Saludable": "/img/prod-piel.webp",
  "Geneo Beauty": "/img/prod-beauty.webp",
  "Geneo 45+": "/img/prod-45.webp",
  "Geneo Solar": "/img/prod-solar.webp",
};

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

const rituales: Record<Objetivo, { nombre: string; productos: string[] }> = {
  "Glow y luminosidad": { nombre: "Glow", productos: ["Geneo Piel Saludable", "Geneo Beauty"] },
  "Firmeza y elasticidad": { nombre: "Firmeza", productos: ["Geneo Piel Saludable", "Geneo 45+"] },
  "Pelo y uñas": { nombre: "Fuerza", productos: ["Geneo Beauty"] },
  Bronceado: { nombre: "Sol", productos: ["Geneo Solar"] },
  "Nueva etapa 45+": { nombre: "Renovación", productos: ["Geneo 45+", "Geneo Piel Saludable"] },
};

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
      whileTap={{ scale: 0.97 }}
      className={`w-full text-left rounded-full px-5 h-11 text-sm font-medium transition-colors duration-300 cursor-pointer ${
        selected
          ? "bg-geneo text-white"
          : "bg-black/[0.04] text-ink hover:bg-geneo/10 hover:text-geneo"
      }`}
    >
      {label}
    </motion.button>
  );
}

/* Tarjeta blanca de un paso del quiz (01 / 02) */
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
    <div className="bg-paper rounded-3xl shadow-soft p-6 sm:p-7 flex flex-col gap-5 h-full">
      <div className="flex items-center gap-3">
        <span className="text-geneo font-medium text-xl leading-none">{numero}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <p className="font-medium text-ink text-base tracking-tight">{pregunta}</p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

export default function EncontraRitual() {
  const [potenciar, setPotenciar] = useState<Objetivo>("Glow y luminosidad");
  const [notar, setNotar] = useState<string | null>(null);

  const ritual = rituales[potenciar];

  return (
    <section id="ritual-finder" className="relative z-[30] bg-surface py-16 sm:py-28 px-4 sm:px-6">
      <div className="relative w-full max-w-[1440px] mx-auto grid gap-8 lg:gap-7 lg:grid-cols-4 items-start">

        {/* Columna 1 — encabezado + CTA */}
        <Reveal className="flex flex-col gap-5" blur={8}>
          <h2 className="uppercase text-[clamp(2rem,3.5vw,3rem)] font-medium leading-[1.05] tracking-tight text-ink">
            Encontrá <span className="text-geneo">tu ritual</span>
          </h2>
          <p className="text-muted text-base max-w-xs">
            Respondé 2 preguntas y descubrí qué Geneo es para vos.
          </p>
          <a
            href={TIENDA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex w-fit items-center gap-2 bg-geneo text-white rounded-full pl-6 pr-5 h-12 font-medium text-sm uppercase tracking-wide hover:bg-geneo-hover active:bg-geneo-hover transition-colors duration-300"
          >
            Comenzar
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1" />
          </a>
        </Reveal>

        {/* Columna 2 — Paso 01 */}
        <Reveal blur={8} delay={0.08}>
          <Paso numero="01" pregunta="¿Qué querés potenciar?">
            {opcionesPotenciar.map((op) => (
              <Pill key={op} label={op} selected={potenciar === op} onClick={() => setPotenciar(op)} />
            ))}
          </Paso>
        </Reveal>

        {/* Columna 3 — Paso 02 */}
        <Reveal blur={8} delay={0.16}>
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
        </Reveal>

        {/* Columna 4 — resultado en vivo */}
        <Reveal blur={8} delay={0.24} className="flex flex-col gap-5">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-geneo">
            Tu ritual
          </p>

          <div className="min-h-[3rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={ritual.nombre}
                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                transition={{ type: "spring", stiffness: 200, damping: 26 }}
                className="text-[clamp(2.5rem,5vw,3.5rem)] font-medium leading-none tracking-tight text-geneo"
              >
                {ritual.nombre}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="text-[11px] uppercase tracking-wider font-medium text-muted">
              Recomendado para vos
            </p>
            <AnimatePresence mode="popLayout">
              {ritual.productos.map((p) => (
                <motion.div
                  key={p}
                  layout
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  className="flex items-center gap-3"
                >
                  <div className="relative w-12 h-12 shrink-0 rounded-xl bg-paper shadow-soft overflow-hidden">
                    <Image src={prodImg[p]} alt={p} fill sizes="48px" className="object-contain p-1" />
                  </div>
                  <span className="text-sm font-medium text-ink">{p}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {notar && (
              <p className="text-xs text-muted">
                Vas a notar primero:{" "}
                <span className="font-medium text-ink">{notar.toLowerCase()}</span>.
              </p>
            )}
          </div>

          {/* Progresión 20 / 40 / 90 días */}
          <div className="flex items-center gap-3 border-t border-line pt-5">
            {timeline.map((step, i) => (
              <div key={step.dias} className="flex items-center gap-3">
                {i > 0 && <span className="text-geneo font-medium" aria-hidden>+</span>}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-ink leading-none">
                    {step.dias} <span className="text-[11px] font-normal text-muted">días</span>
                  </span>
                  <span className="text-[11px] text-muted leading-tight mt-0.5">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <a
            href="#rituales"
            className="group inline-flex w-fit items-center gap-2 bg-geneo text-white rounded-full pl-6 pr-5 h-12 font-medium text-sm uppercase tracking-wide hover:bg-geneo-hover active:bg-geneo-hover transition-colors duration-300"
          >
            Ver ritual
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
