"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";
import { useLowPower } from "@/lib/useLowPower";

/**
 * SmoothScroll — capa de scroll con inercia (Lenis), firma del look Framer.
 *
 * - Respeta `prefers-reduced-motion`: si el usuario lo pide, Lenis no suaviza.
 * - Intercepta los enlaces ancla (#seccion) para llevarlos con scroll suave.
 * - `autoRaf` deja que Lenis maneje su propio loop de animación.
 */

function AnchorScroll() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!target) return;

      const id = target.getAttribute("href");
      if (!id || id === "#") return;

      const el = document.querySelector(id);
      if (!el) return;

      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -72, duration: 1.4 });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  // En dispositivos táctiles dejamos el scroll NATIVO del SO (más fluido y
  // liviano en gama baja); el suavizado de Lenis queda solo para wheel/desktop.
  const [isTouch, setIsTouch] = useState(false);
  const lowPower = useLowPower();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Táctil o gama baja: sin Lenis. El scroll es nativo (ya lo era en touch por
  // syncTouch:false) y los anchors quedan suaves por scroll-behavior +
  // scroll-padding-top de globals.css. Elimina el loop por-frame de Lenis.
  if (isTouch || lowPower) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.07,
        duration: 1.6,
        smoothWheel: !reduced && !isTouch,
        syncTouch: false,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
      }}
    >
      <AnchorScroll />
      {children}
    </ReactLenis>
  );
}
