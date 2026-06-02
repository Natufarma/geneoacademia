"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * ScrollProgress — barra fina superior que refleja el avance del scroll.
 * Usa un spring para que el llenado se sienta fluido, no mecánico.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[105] h-[2px] origin-left bg-geneo"
    />
  );
}
