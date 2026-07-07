"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Intro — preloader de marca LIGADO AL SCROLL.
 *
 * Al cargar: bloque magenta full-screen con el logo "geneo" gigante (blanco).
 * Al scrollear el primer viewport: el magenta se desvanece y el logo se achica
 * y sube, integrándose al hero / la barra de navegación. Sin barra de carga.
 *
 * Respeta `prefers-reduced-motion` (no se monta).
 */
export default function Intro() {
  const [vh, setVh] = useState(900);
  const [skip, setSkip] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // No mostramos la intro en mobile: el splash full-screen es pesado en el
    // primer viewport del teléfono. En desktop sí queda como entrada de marca.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 767px)").matches
    ) {
      setSkip(true);
      return;
    }
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    // Salvavidas: si en 6s el usuario no scrolleó (trackpad muy fino, etc.),
    // liberamos el preloader para no dejar el contenido tapado.
    const safety = window.setTimeout(() => setGone(true), 3500);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(safety);
    };
  }, []);

  const { scrollY } = useScroll();

  // El intro se resuelve rápido (~0.28 viewport): con un poco de scroll el logo
  // ya se achicó, subió y se desvaneció. Evita tener que "scrollear demasiado".
  const bgOpacity = useTransform(scrollY, [0, vh * 0.18], [1, 0]);
  const scale = useTransform(scrollY, [0, vh * 0.28], [1, 0.16]);
  const y = useTransform(scrollY, [0, vh * 0.28], [0, -vh * 0.42]);
  const logoOpacity = useTransform(scrollY, [vh * 0.18, vh * 0.28], [1, 0]);
  const hintOpacity = useTransform(scrollY, [0, vh * 0.08], [1, 0]);

  // Una vez que el intro se fue, NO vuelve: es una entrada de marca de una sola
  // vez. Así no queda "perdido" al volver al top ni al saltar al final.
  useMotionValueEvent(scrollY, "change", (v) => {
    if (v > vh * 0.3 && !gone) setGone(true);
  });

  if (skip || gone) return null;

  return (
    <div aria-hidden="true" className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {/* Fondo magenta que se desvanece */}
      <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 bg-geneo" />

      {/* Logo gigante que se achica y sube */}
      <motion.div
        style={{ scale, y, opacity: logoOpacity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Image
          src="/img/logo-fuxia.webp"
          alt="Geneo"
          width={627}
          height={211}
          priority
          className="w-[72vw] max-w-[820px] h-auto brightness-0 invert"
        />
      </motion.div>

      {/* Hint de scroll, se desvanece enseguida */}
      <motion.div
        style={{ opacity: hintOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase">Scrollá</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} />
        </motion.span>
      </motion.div>
    </div>
  );
}
