import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { TIENDA_URL } from "@/lib/site";

const productos = [
  {
    nombre: "Piel saludable",
    formula: "COLÁGENO + Q10",
    beneficio: "Glow + Hidratación + Firmeza",
    img: "/img/rit-piel.webp",
  },
  {
    nombre: "Beauty",
    formula: "HIALURÓNICO + Q10 + RESVERATROL",
    beneficio: "Piel firme + Pelo fuerte + Uñas saludables",
    img: "/img/rit-beauty.webp",
  },
  {
    nombre: "45+",
    formula: "GENISTEÍNA + HIALURÓNICO",
    beneficio: "Elasticidad + Renovación",
    img: "/img/rit-45.webp",
  },
  {
    nombre: "Solar",
    formula: "COLÁGENO + CAROTENO + LICOPENO",
    beneficio: "Piel bronceada desde adentro",
    img: "/img/rit-solar.webp",
  },
];

/* z-index progresivo para el apilamiento sticky (cada producto pisa al anterior).
   Clases estáticas para que Tailwind las genere. */
const zClasses = ["z-[20]", "z-[30]", "z-[40]", "z-[50]"];

export default function Rituales() {
  return (
    <>
      {productos.map((p, i) => (
        <section
          key={p.nombre}
          id={i === 0 ? "rituales" : undefined}
          className={`sticky top-0 ${zClasses[i]} min-h-[100svh] overflow-hidden`}
        >
          {/* Imagen full-bleed (o bloque magenta para Solar) */}
          {p.img ? (
            <Image
              src={p.img}
              alt={`Geneo ${p.nombre}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-geneo via-geneo to-[#8a0038]" />
          )}

          {/* Velo de legibilidad a la izquierda */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

          {/* Info arriba a la izquierda */}
          <div className="relative z-10 h-full w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-20 sm:pt-32">
            <Reveal blur={10} className="max-w-lg text-white">
              <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-white/70">
                Nuestros rituales · {String(i + 1).padStart(2, "0")} / {String(productos.length).padStart(2, "0")}
              </p>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/90 mt-6">
                {p.formula}
              </p>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.02] mt-2">
                {p.nombre}
              </h2>
              <p className="text-white/85 mt-4 text-base sm:text-lg max-w-sm leading-relaxed">
                {p.beneficio}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8">
                {p.img ? (
                  <a
                    href={TIENDA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Comprar Geneo ${p.nombre} en la tienda online`}
                    className="group/btn inline-flex items-center justify-center gap-1.5 bg-white text-geneo rounded-full px-7 h-12 text-sm font-medium hover:bg-white/90 transition-colors duration-300"
                  >
                    Comprar ahora
                    <ArrowRight size={15} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </a>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-white/40 px-6 h-12 text-[11px] font-medium tracking-[0.18em] uppercase text-white/90">
                    Próximamente
                  </span>
                )}
                <a
                  href="#ciencia"
                  className="group/link inline-flex items-center gap-1.5 text-white text-sm font-medium"
                >
                  Conocer más
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-1" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      ))}
    </>
  );
}
