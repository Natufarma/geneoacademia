"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Heart, Star } from "lucide-react";

/**
 * Celebración de acierto: un estallido radial de corazones y estrellas en
 * magenta Geneo + una carita de remate. Liviana y breve (se disipa sola en ~1s)
 * para NO competir con la confeti grande de "misión completada". Respeta
 * prefers-reduced-motion (no anima; el check y los puntos ya comunican el
 * acierto). Va dentro de un contenedor `relative`: irradia desde su centro.
 */

// Partículas en distribución radial DETERMINISTA (evita Math.random → sin
// mismatch de hidratación y con un reparto parejo).
const PARTICLES = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const distance = 40 + (i % 3) * 14;
  return {
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance,
    Icon: i % 2 === 0 ? Heart : Star,
    color: i % 3 === 0 ? "text-rosa-claro" : "text-geneo",
    size: 12 + (i % 3) * 3,
  };
});

export function CorrectBurst({ face = "😍" }: { face?: string }) {
  const reduce = useReducedMotion();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setGone(true), 1000);
    return () => window.clearTimeout(t);
  }, []);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {!gone && (
        <motion.span
          aria-hidden
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
        >
          {PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className={`absolute ${p.color}`}
              initial={{ x: 0, y: 0, scale: 0.3, opacity: 1 }}
              animate={{ x: p.dx, y: p.dy, scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
              <p.Icon size={p.size} className="fill-current" strokeWidth={0} />
            </motion.span>
          ))}
          <motion.span
            className="text-2xl leading-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
          >
            {face}
          </motion.span>
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/**
 * Número que sube de 0 a `to` (~0,6s). Tween sobre un valor numérico (no es
 * desplazamiento espacial). Con reduced-motion aparece directo en `to`.
 */
export function CountUp({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const value = useMotionValue(0);
  const rounded = useTransform(value, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(value, to, { duration: reduce ? 0 : 0.6, ease: "easeOut" });
    return () => controls.stop();
  }, [to, reduce, value]);

  return <motion.span>{rounded}</motion.span>;
}
