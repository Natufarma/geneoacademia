"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useLowPower } from "@/lib/useLowPower";

/**
 * Parallax — desplaza verticalmente su contenido en función del avance del
 * scroll sobre la propia sección. `speed` positivo = se mueve más lento que
 * la página (sube); negativo = al revés. Inerte con reduced-motion.
 */
export default function Parallax({
  children,
  className = "",
  speed = 60,
}: {
  children: ReactNode;
  className?: string;
  /** Amplitud del desplazamiento en px */
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const lowPower = useLowPower();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);

  // En reduced-motion o equipos de bajo poder el parallax queda estático: el
  // transform por-frame es de los efectos más caros en gama baja.
  const skip = reduced || lowPower;

  return (
    <div ref={ref} className={className}>
      <motion.div style={skip ? undefined : { y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
