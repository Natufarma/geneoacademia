"use client";

import { useMemo } from "react";

// Solo tokens de la paleta @theme (Gentleman §2.2: fidelidad de color).
const COLORS = [
  "var(--color-geneo)",
  "var(--color-rosa-claro)",
  "var(--color-rosa-suave)",
  "var(--color-geneo-dark)",
  "var(--color-oro)",
];

/**
 * PRNG determinista (mulberry32): mismos "papelitos" en cada render con la
 * misma semilla — puro durante el render (sin Math.random) y sin riesgo de
 * mismatch de hidratación.
 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lluvia de confetti en CSS puro (keyframe confetti-fall en globals.css).
 * Liviano a propósito: nada de canvas ni librerías para 40 papelitos.
 */
export default function Confetti({ count = 40, seed = 7 }: { count?: number; seed?: number }) {
  const pieces = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand() * 100,
      size: 6 + rand() * 8,
      color: COLORS[i % COLORS.length],
      drift: (rand() - 0.5) * 160,
      spin: 360 + rand() * 540,
      duration: 2.4 + rand() * 2,
      delay: rand() * 0.8,
      round: rand() > 0.5,
    }));
  }, [count, seed]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.6,
            background: p.color,
            borderRadius: p.round ? "50%" : 2,
            ["--confetti-drift" as string]: `${p.drift}px`,
            ["--confetti-spin" as string]: `${p.spin}deg`,
            ["--confetti-duration" as string]: `${p.duration}s`,
            ["--confetti-delay" as string]: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
