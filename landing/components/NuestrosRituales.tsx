import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";

/**
 * NuestrosRituales — grilla de 4 productos (estilo mockup), como vista rápida
 * de la línea antes de las secciones grandes y del quiz. Cada card enlaza a la
 * sección detallada (#rituales). Usa las imágenes de producto existentes.
 */
/* accent: clase de color del texto de marca por card. La línea Solar es
   naranja, así que su acento difiere del fucsia (text-geneo) del resto.
   cta: texto del enlace inferior. href: destino; null = card informativa
   (Solar es próximo lanzamiento, no navega a ningún detalle todavía). */
type Producto = {
  nombre: string;
  beneficio: string;
  img: string;
  accent: string;
  cta: string;
  href: string | null;
};

const productos: Producto[] = [
  { nombre: "Piel saludable", beneficio: "Glow + hidratación + firmeza.", img: "/img/prod-piel.webp", accent: "text-geneo", cta: "Conocer más", href: "#rituales" },
  { nombre: "Beauty", beneficio: "Pelo fuerte, uñas saludables.", img: "/img/prod-beauty.webp", accent: "text-geneo", cta: "Conocer más", href: "#rituales" },
  { nombre: "45+", beneficio: "Nutrición para tu piel en cada etapa.", img: "/img/prod-45.webp", accent: "text-geneo", cta: "Conocer más", href: "#rituales" },
  { nombre: "Solar", beneficio: "Bronceado saludable desde adentro.", img: "/img/prod-solar.webp", accent: "text-solar", cta: "Próximo lanzamiento", href: null },
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
          {productos.map((p, i) => {
            const inner = (
              <>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface">
                  <Image
                    src={p.img}
                    alt={`Geneo ${p.nombre}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className={`object-contain p-5 transition-transform duration-500 ${p.href ? "group-hover:scale-105 group-active:scale-105" : ""}`}
                  />
                </div>
                <div className="flex flex-col gap-1.5 px-1 pb-1">
                  <h3 className={`uppercase ${p.accent} font-semibold text-base tracking-wide`}>
                    {p.nombre}
                  </h3>
                  <p className="text-muted text-[15px] sm:text-base leading-snug">{p.beneficio}</p>
                  <span className={`inline-flex items-center gap-1.5 ${p.accent} text-sm font-semibold uppercase tracking-wide mt-1`}>
                    {p.cta}
                    {p.href && (
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1"
                      />
                    )}
                  </span>
                </div>
              </>
            );
            return (
              <Reveal key={p.nombre} delay={i * 0.08} y={16}>
                {p.href ? (
                  <a
                    href={p.href}
                    className="group flex flex-col gap-4 bg-paper rounded-3xl shadow-soft p-4 hover:shadow-card hover:-translate-y-1 active:shadow-card active:-translate-y-1 transition-all duration-300 h-full"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="group flex flex-col gap-4 bg-paper rounded-3xl shadow-soft p-4 h-full">
                    {inner}
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
