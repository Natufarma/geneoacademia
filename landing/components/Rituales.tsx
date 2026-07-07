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
    imgMobile: "/img/rit-piel-mobile.webp",
  },
  {
    nombre: "Beauty",
    formula: "HIALURÓNICO + Q10 + RESVERATROL",
    beneficio: "Piel firme + Pelo fuerte + Uñas saludables",
    img: "/img/rit-beauty.webp",
    imgMobile: "/img/rit-beauty-mobile.webp",
  },
  {
    nombre: "45+",
    formula: "GENISTEÍNA + HIALURÓNICO",
    beneficio: "Elasticidad + Renovación",
    img: "/img/rit-45.webp",
    imgMobile: "/img/rit-45-mobile.webp",
  },
];

/* z-index progresivo para el apilamiento sticky (cada producto pisa al anterior).
   Clases estáticas para que Tailwind las genere. */
const zClasses = ["z-[20]", "z-[30]", "z-[40]"];

export default function Rituales() {
  return (
    <>
      {productos.map((p, i) => (
        <section
          key={p.nombre}
          id={i === 0 ? "rituales" : undefined}
          className={`sticky top-0 ${zClasses[i]} min-h-[100svh] overflow-hidden`}
        >
          {/* Imagen full-bleed — escena landscape en desktop, vertical 9:16 en mobile */}
          <Image
            src={p.img}
            alt={`Geneo ${p.nombre}`}
            fill
            sizes="100vw"
            className="hidden md:block object-cover"
          />
          <Image
            src={p.imgMobile}
            alt={`Geneo ${p.nombre}`}
            fill
            priority={i === 0}
            sizes="100vw"
            className="md:hidden object-cover"
          />

          {/* Info: a la izquierda, centrada verticalmente (en el medio de la altura), igual en las 3 */}
          <div className="relative z-10 min-h-[100svh] w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-start py-24">
            <Reveal
              blur={10}
              className="max-w-lg text-white flex flex-col gap-5 [text-shadow:0_1px_18px_rgba(0,0,0,0.45)]"
            >
              <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-white/80">
                Nuestros rituales · {String(i + 1).padStart(2, "0")} / {String(productos.length).padStart(2, "0")}
              </p>

              {/* Título: fórmula + nombre, agrupados con gap (sin márgenes sueltos) */}
              <div className="flex flex-col gap-2">
                <p className="text-sm sm:text-base font-semibold tracking-[0.2em] uppercase text-white/90">
                  {p.formula}
                </p>
                <h2 className="text-[clamp(2.5rem,6.5vw,5rem)] font-medium tracking-tight leading-[1.02]">
                  {p.nombre}
                </h2>
              </div>

              <p className="text-white/90 text-lg sm:text-xl max-w-sm leading-relaxed">
                {p.beneficio}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {p.img ? (
                  <a
                    href={TIENDA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Comprar Geneo ${p.nombre} en la tienda online`}
                    className="group/btn inline-flex items-center justify-center gap-1.5 bg-white text-geneo rounded-full px-7 h-12 text-sm font-medium hover:bg-white/90 active:bg-white/90 transition-colors duration-300 [text-shadow:none]"
                  >
                    Comprar ahora
                    <ArrowRight size={15} className="transition-transform duration-300 group-hover/btn:translate-x-1 group-active/btn:translate-x-1" />
                  </a>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-white/40 px-6 h-12 text-[11px] font-medium tracking-[0.18em] uppercase text-white/90">
                    Próximamente
                  </span>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      ))}
    </>
  );
}
