"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Droplets, Sparkles, Waves, type LucideIcon } from "lucide-react";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import CountUp from "@/components/CountUp";

const nodos: { dias: number; descripcion: string; Icon: LucideIcon }[] = [
  {
    dias: 20,
    descripcion: "Piel más hidratada, se siente más suave y nutrida.",
    Icon: Droplets,
  },
  {
    dias: 40,
    descripcion: "Más glow natural. La piel se ve más luminosa.",
    Icon: Sparkles,
  },
  {
    dias: 90,
    descripcion: "Más firmeza. Una piel con mejor estructura.",
    Icon: Waves,
  },
];

export default function Timeline() {
  const reduced = useReducedMotion();
  // Observamos el CONTENEDOR (grande → el observer dispara siempre), no la
  // línea de 1px. Desde acá manejamos el "dibujado" de la línea.
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-80px" });
  return (
    <section
      id="resultados"
      className="relative z-[40] bg-gradient-to-r from-lavanda via-lavanda to-rosa-claro py-16 sm:py-36 px-6 overflow-hidden"
    >
      {/* Foto de rostro a la derecha, fundida hacia el fondo lavanda */}
      <Parallax speed={50} className="absolute right-0 inset-y-0 w-2/5 sm:w-1/2 lg:w-2/5 pointer-events-none">
        <div className="relative h-full w-full">
          <Image
            src="/img/timeline-face.webp"
            alt="Piel luminosa tras el ritual Geneo"
            fill
            sizes="(max-width: 1024px) 50vw, 40vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rosa-claro via-rosa-claro/40 to-transparent" />
        </div>
      </Parallax>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto">
        <Reveal blur={8}>
          <h2 className="uppercase text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight max-w-2xl text-geneo">
            Tu piel no cambia de un día para otro, pero sí cambia con constancia.
          </h2>
        </Reveal>

        {/* Timeline */}
        <div ref={lineRef} className="relative mt-16">
          {/* Línea que se "carga" cuando la sección entra. El trigger lo da el
              contenedor (lineInView), NO la línea de 1px (que el observer no
              detecta). Animamos clip-path: la caja queda full-size y solo se
              revela. reduced-motion → línea estática completa. */}
          {/* Desktop: se dibuja de izquierda a derecha */}
          <motion.div
            className="hidden md:block absolute top-3 left-0 right-0 h-px bg-ink/20"
            initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
            animate={
              reduced || lineInView
                ? { clipPath: "inset(0 0% 0 0)" }
                : { clipPath: "inset(0 100% 0 0)" }
            }
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Mobile: se dibuja de arriba hacia abajo */}
          <motion.div
            className="md:hidden absolute top-3 bottom-3 left-3 w-px -translate-x-1/2 bg-ink/20"
            initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={
              reduced || lineInView
                ? { clipPath: "inset(0 0 0% 0)" }
                : { clipPath: "inset(0 0 100% 0)" }
            }
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          />

          <div className="flex flex-col md:flex-row md:gap-0">
            {nodos.map((nodo, i) => (
              <Reveal key={nodo.dias} delay={0.3 + i * 0.15} className="relative flex-1 md:pr-8" blur={6}>
                <div className="flex flex-row items-start gap-4 md:flex-col md:gap-0 mb-8 md:mb-0">
                  {/* Dot con anillo de pulso — magenta sobre lavanda */}
                  <div className="relative w-6 h-6 flex-shrink-0 z-10 md:mb-5">
                    <span className="absolute inset-0 rounded-full bg-geneo/40 pulse-ring" />
                    <span className="absolute inset-0 rounded-full bg-geneo" />
                  </div>
                  {/* Icono + label + descripción */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <nodo.Icon size={18} strokeWidth={1.75} className="text-geneo shrink-0" aria-hidden="true" />
                      <p className="font-semibold text-ink text-lg tracking-tight">
                        +<CountUp to={nodo.dias} /> días
                      </p>
                    </div>
                    <p className="text-ink/65 text-sm max-w-[180px] leading-relaxed">
                      {nodo.descripcion}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
