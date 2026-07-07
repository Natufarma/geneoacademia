"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { useLowPower } from "@/lib/useLowPower";

/**
 * ScrollProgress — barra fina superior que refleja el avance del scroll.
 * Usa un spring para que el llenado se sienta fluido, no mecánico.
 */
export default function ScrollProgress() {
  const reduced = useReducedMotion();
  const lowPower = useLowPower();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  // Corre un spring por-frame en JS; lo apagamos en reduced-motion / gama baja.
  if (reduced || lowPower) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-[env(safe-area-inset-top)] left-0 right-0 z-[105] h-[2px] origin-left bg-geneo pointer-events-none"
    />
  );
}
