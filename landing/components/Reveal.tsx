"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

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
  const MotionTag = as === "span" ? motion.span : motion.div;

  // Reduced motion: render sin animación (Framer corre en JS, así que la regla
  // CSS de globals.css no lo alcanza — hay que cortarlo acá explícitamente).
  if (reduced) {
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
        filter: blur ? `blur(${blur}px)` : "blur(0px)",
      }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...spring, delay }}
    >
      {children}
    </MotionTag>
  );
}
