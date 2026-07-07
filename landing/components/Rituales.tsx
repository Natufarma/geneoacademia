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
    formula: "L-CISTINA + HIALURÓNICO + RESVERATROL + Q10 + VIT. Y MINERALES",
    beneficio: "Piel firme + Pelo fuerte + Uñas saludables",
    img: "/img/rit-beauty.webp",
    imgMobile: "/img/rit-beauty-mobile.webp",
  },
  {
    nombre: "45+",
    formula: "ISOFLAVONAS DE SOJA ENRIQUECIDAS EN GENISTEÍNA + HIALURÓNICO + VIT. C",
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
          className={`sticky top-0 ${zClasses[i]} min-h-[100svh] overflow-hidden bg-[#9E0458] md:bg-transparent`}
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
            className="md:hidden object-contain object-bottom"
          />

          {/* Velo SUAVE y difuminado solo detrás del texto (izquierda), para
              garantizar legibilidad del blanco sobre las zonas claras de la foto
              sin oscurecer el resto de la escena. */}
          <div className="absolute inset-0 pointer-events-none hidden md:block bg-gradient-to-r from-black/55 from-0% via-black/22 via-24% to-transparent to-[50%]" />
          <div className="absolute inset-0 pointer-events-none md:hidden bg-gradient-to-r from-black/55 from-0% via-black/22 via-45% to-transparent to-[90%]" />

          {/* Info: a la izquierda, centrada verticalmente (en el medio de la altura), igual en las 3 */}
          <div className="relative z-10 min-h-[100svh] w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 flex items-start md:items-center justify-start pt-28 pb-24 md:py-24">
            <Reveal
              blur={10}
              className="max-w-lg text-white flex flex-col gap-5 [text-shadow:0_1px_2px_rgba(0,0,0,0.6),0_2px_22px_rgba(0,0,0,0.5)]"
            >
              <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-white">
                Nuestros rituales · {String(i + 1).padStart(2, "0")} / {String(productos.length).padStart(2, "0")}
              </p>

              <h2 className="text-[clamp(2.5rem,6.5vw,5rem)] font-medium tracking-tight leading-[1.02]">
                {p.nombre}
              </h2>

              <p className="text-white text-lg sm:text-xl max-w-sm leading-relaxed">
                {p.beneficio}
              </p>

              <p className="max-w-sm text-xs sm:text-sm font-semibold tracking-[0.12em] uppercase text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.75),0_0_16px_rgba(0,0,0,0.6)]">
                {p.formula}
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
