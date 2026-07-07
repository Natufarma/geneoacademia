"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HeroVideo — video de fondo en loop para el Hero, RESPONSIVE.
 *
 * - Desktop (≥768px): video horizontal 16:9  → /video/hero-loop.mp4
 * - Mobile (<768px):  video vertical 9:16     → /video/hero-loop-mobile.mp4
 *
 * Carga en TODOS los dispositivos. Solo se omite si el usuario pidió
 * `prefers-reduced-motion` (accesibilidad) o `saveData` (ahorro de datos) — que
 * son elecciones del visitante, no gateo por hardware. Si el video falla, se
 * oculta y queda la foto-poster que vive debajo en el Hero.
 *
 * Para no ahogar a los equipos de gama baja, el video se PAUSA cuando el hero
 * deja de estar en pantalla (scrolleaste hacia abajo, y el apilado sticky lo
 * tapa) o cuando la pestaña se oculta; se reanuda al volver.
 *
 * `key` fuerza el remonte al cruzar el breakpoint para cargar la fuente correcta.
 */
type Mode = "off" | "desktop" | "mobile";

export default function HeroVideo() {
  const [mode, setMode] = useState<Mode>("off");
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Ahorro de datos: no descargamos un video si el visitante lo pidió.
    const conn = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (conn?.saveData) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setMode(mq.matches ? "mobile" : "desktop");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Pausa/reanuda según visibilidad del hero. Un scroll listener pasivo,
  // throttleado con rAF, es baratísimo comparado con decodificar un video en
  // loop detrás del apilado sticky. Pausa también al ocultar la pestaña.
  useEffect(() => {
    if (mode === "off" || failed) return;
    let raf = 0;
    const sync = () => {
      raf = 0;
      const v = videoRef.current;
      if (!v) return;
      // El hero queda visible durante ~2 viewports (hero + spacer) antes de que
      // las secciones de producto lo tapen. Más allá de eso, pausamos.
      const visible = !document.hidden && window.scrollY < window.innerHeight * 1.8;
      if (visible) {
        if (v.paused) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", sync);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mode, failed]);

  if (mode === "off" || failed) return null;

  const base =
    mode === "mobile" ? "/video/hero-loop-mobile" : "/video/hero-loop";
  const position =
    mode === "mobile" ? "object-center" : "object-[68%_30%]";
  const poster =
    mode === "mobile" ? "/img/hero-mobile.webp" : "/img/hero.webp";

  return (
    <video
      ref={videoRef}
      key={base}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden="true"
      onError={() => setFailed(true)}
      className={`absolute inset-0 h-full w-full object-cover ${position} motion-safe:animate-[fadeIn_1.2s_ease-out]`}
    >
      <source src={`${base}.mp4`} type="video/mp4" />
    </video>
  );
}
