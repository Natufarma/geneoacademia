"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { useLowPower } from "@/lib/useLowPower";

/**
 * Reveal — primitivo de animación de entrada por scroll.
 *
 * Encapsula la física de Framer Motion (spring orgánico) en un único
 * Client Component reutilizable. Los Server Components lo importan y
 * envuelven su contenido SIN volverse clientes ellos mismos: así el
 * JS de cliente se mantiene mínimo.
 *
 * Para efecto cascada (stagger), pasar `delay={i * 0.08}` en un .map().
 * `blur` añade un desenfoque de entrada (estética Framer premium).
 */

const spring = {
  type: "spring" as const,
  damping: 28,
  stiffness: 55,
  mass: 1.1,
};

type RevealProps = {
  children: ReactNode;
  /** Retardo en segundos. Útil para stagger: delay={i * 0.08} */
  delay?: number;
  /** Desplazamiento vertical inicial en px (default 30) */
  y?: number;
  /** Desplazamiento horizontal inicial en px (default 0) */
  x?: number;
  /** Desenfoque de entrada (px). 0 = desactivado */
  blur?: number;
  className?: string;
  /** Tag a renderizar. Usar "span" dentro de headings (un <div> dentro de
   *  <h1> es HTML inválido). Default "div". */
  as?: "div" | "span";
};

export default function Reveal({
  children,
  delay = 0,
  y = 30,
  x = 0,
  blur = 6,
  className,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const lowPower = useLowPower();
  const MotionTag = as === "span" ? motion.span : motion.div;

  // En mobile desactivamos el desenfoque de entrada: animar filter:blur dispara
  // repaint y penaliza a los dispositivos de gama media/baja (transform/opacity
  // sí son compositados por GPU).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);
  const effectiveBlur = isMobile ? 0 : blur;

  // Reduced motion o gama baja: render sin animación. Framer corre en JS (rAF),
  // así que la regla CSS de globals.css no lo alcanza — hay que cortarlo acá.
  // En gama baja evita correr decenas de springs en paralelo (uno por Reveal).
  if (reduced || lowPower) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{
        opacity: 0,
        y,
        x,
        filter: effectiveBlur ? `blur(${effectiveBlur}px)` : "blur(0px)",
      }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...spring, delay }}
    >
      {children}
    </MotionTag>
  );
}
