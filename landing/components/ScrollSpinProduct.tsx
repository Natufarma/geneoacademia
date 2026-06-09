"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * ScrollSpinProduct — placeholder limpio: el frente del pouch flotando con
 * sombra suave. Provisorio hasta tener el turntable en video (que se procesará
 * a frames/loop transparente). Sin dependencias 3D.
 *
 * Con `prefers-reduced-motion` queda estático.
 */
const FRENTE = "/img/pouch-frente.webp";

export default function ScrollSpinProduct({
  className = "",
}: {
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className={`relative ${className}`}>
      {/* Sombra de contacto */}
      <div
        aria-hidden
        className="absolute left-1/2 bottom-[5%] -translate-x-1/2 w-[55%] h-[5%] rounded-[50%] bg-black/25 blur-xl"
      />
      <motion.div
        className="relative h-full w-full"
        animate={reduced ? undefined : { y: -14 }}
        transition={{
          type: "spring",
          stiffness: 26,
          damping: 14,
          mass: 1.2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FRENTE}
          alt="Geneo Colágeno & Q-10"
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
