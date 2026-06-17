import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";

/**
 * NuestrosRituales — grilla de 4 productos (estilo mockup), como vista rápida
 * de la línea antes de las secciones grandes y del quiz. Cada card enlaza a la
 * sección detallada (#rituales). Usa las imágenes de producto existentes.
 */
const productos = [
  { nombre: "Piel saludable", beneficio: "Glow + hidratación + firmeza.", img: "/img/rit-piel.webp" },
  { nombre: "Beauty", beneficio: "Pelo fuerte, uñas saludables.", img: "/img/rit-beauty.webp" },
  { nombre: "45+", beneficio: "Nutrición para tu piel en cada etapa.", img: "/img/rit-45.webp" },
  { nombre: "Solar", beneficio: "Bronceado saludable desde adentro.", img: "/img/rit-solar.webp" },
];

export default function NuestrosRituales() {
  return (
    <section
      id="nuestros-rituales"
      className="relative z-[15] bg-surface py-16 sm:py-28 px-4 sm:px-6"
    >
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-10 sm:gap-14">
        <Reveal blur={8}>
          <h2 className="uppercase text-[clamp(2rem,4vw,3.5rem)] font-medium tracking-tight text-ink">
            Nuestros <span className="text-geneo">rituales</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {productos.map((p, i) => (
            <Reveal key={p.nombre} delay={i * 0.08} y={16}>
              <a
                href="#rituales"
                className="group flex flex-col gap-4 bg-paper rounded-3xl shadow-soft p-4 hover:shadow-card hover:-translate-y-1 transition-all duration-300 h-full"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface">
                  <Image
                    src={p.img}
                    alt={`Geneo ${p.nombre}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1.5 px-1 pb-1">
                  <h3 className="uppercase text-geneo font-semibold text-sm tracking-wide">
                    {p.nombre}
                  </h3>
                  <p className="text-muted text-sm leading-snug">{p.beneficio}</p>
                  <span className="inline-flex items-center gap-1.5 text-geneo text-xs font-semibold uppercase tracking-wide mt-1">
                    Conocer más
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1"
                    />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
