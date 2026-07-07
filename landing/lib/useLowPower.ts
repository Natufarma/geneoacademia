"use client";

import { useEffect, useState } from "react";

/**
 * useLowPower — detecta dispositivos de bajo poder para degradar los efectos
 * más caros (parallax, video de fondo) SIN tocar el resto de la experiencia.
 *
 * Heurística (cualquiera basta): poca RAM (deviceMemory ≤ 4GB, solo Chromium),
 * ahorro de datos activado, o prefers-reduced-motion.
 * NO usamos hardwareConcurrency: Safari lo marca como fingerprinting y muestra
 * un aviso de privacidad, y deviceMemory ya detecta la gama baja de Android.
 * Arranca en `false` (asume equipo capaz) y se corrige tras montar en cliente,
 * así el SSR no degrada de más.
 */
export function useLowPower(): boolean {
  const [low, setLow] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const mem = nav.deviceMemory; // solo Chromium; undefined en Safari
    const saveData = nav.connection?.saveData ?? false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lowMem = typeof mem === "number" && mem <= 4;

    setLow(lowMem || saveData || reduced);
  }, []);

  return low;
}
