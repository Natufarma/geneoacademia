"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";

/**
 * ScrollSpinProduct — el pouch (con fondo recortado a transparencia) "da
 * vueltas" según el avance del scroll. Técnica de secuencia de frames (estilo
 * Apple): precarga N PNG/WebP transparentes y muestra el que corresponde a la
 * posición de scroll. Suave, sin decodificar video, transparente de verdad.
 *
 * Con `prefers-reduced-motion` muestra un único frame estático.
 *
 * Frames en: public/img/spin/f_001.webp ... f_048.webp
 */
const FRAME_COUNT = 48;
const frames = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/img/spin/f_${String(i + 1).padStart(3, "0")}.webp`
);

export default function ScrollSpinProduct({
  className = "",
}: {
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    const i = Math.round(p * (FRAME_COUNT - 1));
    setActive(Math.min(FRAME_COUNT - 1, Math.max(0, i)));
  });

  // Reduced motion → un solo frame, estático.
  if (reduced) {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <Image
          src="/img/prod-colageno.webp"
          alt="Geneo Colágeno & Q-10"
          fill
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {frames.map((src, i) => (
        // Plano: todos apilados, solo el activo visible. El frame 0 carga eager
        // (es el que se ve primero); el resto es lazy + low priority para no
        // competir con el LCP del hero (1.9 MB de frames diferidos hasta que la
        // sección se acerca al viewport).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={i === 0 ? "Geneo Colágeno & Q-10 girando" : ""}
          aria-hidden={i !== 0}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={i === 0 ? "auto" : "low"}
          className="absolute inset-0 h-full w-full object-contain"
          style={{ opacity: i === active ? 1 : 0 } as CSSProperties}
          draggable={false}
        />
      ))}
    </div>
  );
}
