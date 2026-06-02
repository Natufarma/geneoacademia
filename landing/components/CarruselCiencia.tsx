"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

/* Carrusel full-width de fotos editoriales. Crossfade automático cada 6s,
   con flechas y dots para control manual. */
const slides = [
  { src: "/img/carrusel-producto.webp", alt: "Mujer sosteniendo Geneo Colágeno & Q-10" },
  { src: "/img/carrusel-45.webp", alt: "Mujer con Geneo 45+, piel firme y renovada" },
  { src: "/img/ciencia-band-1.webp", alt: "Mujer disfrutando su ritual Geneo" },
  { src: "/img/ciencia-band-2.webp", alt: "Piel luminosa con Geneo" },
];

export default function CarruselCiencia({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  // Pausado por defecto si el usuario pidió menos movimiento.
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir: number) => setIndex((p) => (p + dir + slides.length) % slides.length),
    []
  );

  useEffect(() => {
    if (reduced || paused) return; // no auto-avanza con reduced-motion ni en pausa
    const id = setInterval(() => setIndex((p) => (p + 1) % slides.length), 3500);
    return () => clearInterval(id);
  }, [reduced, paused]);

  return (
    <div
      className={`relative w-full h-full min-h-[480px] overflow-hidden ${className}`}
    >
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slides[index].src}
            alt={slides[index].alt}
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Flechas */}
      <button
        onClick={() => go(-1)}
        aria-label="Foto anterior"
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/80 backdrop-blur-md text-ink flex items-center justify-center hover:bg-white transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-geneo focus-visible:outline-offset-2"
      >
        <ArrowLeft size={18} aria-hidden="true" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Foto siguiente"
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/80 backdrop-blur-md text-ink flex items-center justify-center hover:bg-white transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-geneo focus-visible:outline-offset-2"
      >
        <ArrowRight size={18} aria-hidden="true" />
      </button>

      {/* Pausa / reproducir auto-avance (WCAG 2.2.2) */}
      {!reduced && (
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Reproducir presentación automática" : "Pausar presentación automática"}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/80 backdrop-blur-md text-ink flex items-center justify-center hover:bg-white transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-geneo focus-visible:outline-offset-2"
        >
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      )}

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, j) => (
          <button
            key={j}
            onClick={() => setIndex(j)}
            aria-label={`Ir a la foto ${j + 1}`}
            className="p-3 -m-1.5 flex items-center focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded-full"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                j === index ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
