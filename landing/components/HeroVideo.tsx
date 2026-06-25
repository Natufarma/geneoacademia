"use client";

import { useEffect, useState } from "react";

/**
 * HeroVideo — video de fondo en loop para el Hero, RESPONSIVE.
 *
 * - Desktop (≥768px): video horizontal 16:9  → /video/hero-loop.mp4
 * - Mobile (<768px):  video vertical 9:16     → /video/hero-loop-mobile.mp4
 *
 * Se monta solo si el visitante no pidió `prefers-reduced-motion`. Si el video
 * falla, se oculta y queda la foto-poster que vive debajo en el Hero.
 * `key` fuerza el remonte al cruzar el breakpoint para cargar la fuente correcta.
 */
type Mode = "off" | "desktop" | "mobile";

export default function HeroVideo() {
  const [mode, setMode] = useState<Mode>("off");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Gama baja / datos: no cargamos el video si el visitante pidió ahorro de
    // datos o está en una conexión lenta (queda la foto-poster del Hero).
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setMode(mq.matches ? "mobile" : "desktop");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (mode === "off" || failed) return null;

  const base =
    mode === "mobile" ? "/video/hero-loop-mobile" : "/video/hero-loop";
  const position =
    mode === "mobile" ? "object-center" : "object-[68%_30%]";
  const poster =
    mode === "mobile" ? "/img/hero-mobile.webp" : "/img/hero.webp";

  return (
    <video
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
