"use client";

import { motion } from "framer-motion";

/**
 * Anillo de progreso (como el "TU PROGRESO 750 puntos" del mockup).
 * SVG puro: el arco se dibuja con stroke-dasharray sobre un círculo.
 */
export default function ProgressRing({
  value,
  max,
  size = 110,
  stroke = 9,
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-rosa-suave)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-geneo)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - ratio) }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-0.5">
        {children}
      </div>
    </div>
  );
}
