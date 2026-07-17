"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";

/**
 * Material de consulta rápida para el mostrador: los 4 productos y los
 * rituales sugeridos (contenido reutilizado de la landing).
 */

type Producto = {
  nombre: string;
  beneficio: string;
  img: string;
  accent: string;
};

const PRODUCTOS: Producto[] = [
  {
    nombre: "Piel Saludable",
    beneficio: "Colágeno + Q10. Glow, hidratación y firmeza.",
    img: "/img/prod-piel.webp",
    accent: "text-geneo",
  },
  {
    nombre: "Beauty",
    beneficio: "Pelo fuerte, uñas saludables.",
    img: "/img/prod-beauty.webp",
    accent: "text-geneo",
  },
  {
    nombre: "45+",
    beneficio: "Nutrición para tu piel en cada etapa.",
    img: "/img/prod-45.webp",
    accent: "text-geneo",
  },
  {
    nombre: "Solar",
    beneficio: "Bronceado saludable desde adentro.",
    img: "/img/prod-solar.webp",
    accent: "text-solar",
  },
];

type Ritual = {
  nombre: string;
  combo: string;
  para: string;
};

const RITUALES: Ritual[] = [
  {
    nombre: "Ritual Glow",
    combo: "Piel Saludable + Beauty",
    para: "Para quien busca luminosidad integral: piel, pelo y uñas.",
  },
  {
    nombre: "Ritual Verano",
    combo: "Solar + Piel Saludable",
    para: "Para preparar la piel para el sol y broncear desde adentro.",
  },
  {
    nombre: "Ritual 45+",
    combo: "45+ + Piel Saludable",
    para: "Para acompañar la piel en etapas de cambio con nutrición extra.",
  },
];

export default function Productos() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-ink font-extrabold text-2xl tracking-tight">
            Nuestros <span className="text-geneo">rituales</span>
          </h1>
          <p className="text-muted text-sm">
            Tu guía rápida para recomendar en el mostrador.
          </p>
        </header>

        {/* Productos */}
        <section className="grid grid-cols-2 gap-3.5">
          {PRODUCTOS.map((p, i) => (
            <motion.article
              key={p.nombre}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28, delay: i * 0.06 }}
              className="bg-paper rounded-3xl shadow-soft p-3.5 flex flex-col gap-2.5"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface">
                <Image
                  src={p.img}
                  alt={`Geneo ${p.nombre}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 220px"
                  className="object-contain p-3"
                />
              </div>
              <div className="px-1 pb-1">
                <h2 className={`uppercase ${p.accent} font-bold text-sm tracking-wide`}>
                  {p.nombre}
                </h2>
                <p className="text-muted text-[13px] leading-snug mt-1">{p.beneficio}</p>
              </div>
            </motion.article>
          ))}
        </section>

        {/* Rituales combinados */}
        <section className="flex flex-col gap-3">
          <h2 className="text-ink font-bold text-lg tracking-tight">
            Elegí el ideal para cada necesidad
          </h2>
          {RITUALES.map((r, i) => (
            <motion.article
              key={r.nombre}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.2 + i * 0.07 }}
              className="bg-paper rounded-3xl shadow-soft px-5 py-4"
            >
              <p className="text-geneo font-bold text-sm uppercase tracking-wide">{r.nombre}</p>
              <p className="text-ink font-semibold text-sm mt-0.5">{r.combo}</p>
              <p className="text-muted text-[13px] leading-snug mt-1">{r.para}</p>
            </motion.article>
          ))}
        </section>

        <p className="text-soft text-xs leading-relaxed text-center px-4">
          La constancia es la clave: los resultados se construyen a los 20, 40 y
          90 días.
        </p>
      </div>
    </AppShell>
  );
}
