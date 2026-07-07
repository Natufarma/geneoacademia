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
      className="relative z-[40] bg-geneo py-16 sm:py-36 px-6 overflow-hidden"
    >
      {/* Foto de rostro a la derecha, con parallax y fundida con el magenta */}
      <Parallax speed={50} className="absolute right-0 inset-y-0 w-1/2 sm:w-1/2 lg:w-2/5 pointer-events-none">
        <div className="relative h-full w-full">
          {/* Retrato a color en mobile y desktop (la foto ya trae el magenta de marca) */}
          <Image
            src="/img/timeline-face.webp"
            alt="Piel luminosa tras el ritual Geneo"
            fill
            sizes="(max-width: 767px) 50vw, 40vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-geneo via-geneo/45 to-transparent" />
        </div>
      </Parallax>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto">
        <Reveal blur={8}>
          <h2 className="uppercase text-[clamp(1.875rem,4.5vw,3rem)] font-medium leading-[1.1] tracking-tight max-w-2xl text-white">
            Tu piel no cambia de un día para otro,{" "}
            <span className="text-white/85">pero sí cambia con constancia.</span>
          </h2>
        </Reveal>

        {/* Timeline */}
        <div ref={lineRef} className="relative mt-16 lg:max-w-[62%]">
          {/* Línea que se "carga" cuando la sección entra. El trigger lo da el
              contenedor (lineInView), NO la línea de 1px (que el observer no
              detecta). Animamos clip-path: la caja queda full-size y solo se
              revela. reduced-motion → línea estática completa. */}
          {/* Desktop: se dibuja de izquierda a derecha */}
          <motion.div
            className="hidden lg:block absolute top-3 left-0 right-0 h-px bg-white/70"
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
            className="lg:hidden absolute top-3 bottom-3 left-3 w-px -translate-x-1/2 bg-white/70"
            initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={
              reduced || lineInView
                ? { clipPath: "inset(0 0 0% 0)" }
                : { clipPath: "inset(0 0 100% 0)" }
            }
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          />

          <div className="flex flex-col lg:flex-row lg:gap-0">
            {nodos.map((nodo, i) => (
              <Reveal key={nodo.dias} delay={0.3 + i * 0.15} className="relative flex-1 lg:pr-8" blur={6}>
                <div className="flex flex-row items-start gap-4 lg:flex-col lg:gap-0 mb-8 lg:mb-0">
                  {/* Dot con anillo de pulso */}
                  <div className="relative w-6 h-6 flex-shrink-0 z-10 lg:mb-5">
                    <span className="absolute inset-0 rounded-full bg-white/60 pulse-ring" />
                    <span className="absolute inset-0 rounded-full bg-white" />
                  </div>
                  {/* Icono + label + descripción */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                      <nodo.Icon size={38} strokeWidth={1.5} className="text-white shrink-0" aria-hidden="true" />
                      <p className="font-semibold text-white text-3xl sm:text-4xl tracking-tight leading-none">
                        +<CountUp to={nodo.dias} /> <span className="text-xl sm:text-2xl font-medium">días</span>
                      </p>
                    </div>
                    <p className="text-white/90 text-lg max-w-[280px] leading-relaxed">
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
