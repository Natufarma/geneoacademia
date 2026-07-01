import Image from "next/image";
import { Leaf, CheckCircle2, ArrowRight, type LucideIcon } from "lucide-react";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import HeroVideo from "@/components/HeroVideo";

type Badge = { t: string; s: string; mark?: string; Icon?: LucideIcon };

const badges: Badge[] = [
  { mark: "/img/natufarma-mark.webp", t: "Respaldado por", s: "Natufarma" },
  { Icon: Leaf, t: "Ingredientes", s: "premium" },
  { Icon: CheckCircle2, t: "Resultados", s: "comprobados" },
];

export default function Hero() {
  return (
    <section className="sticky top-0 z-[10] min-h-[100svh] flex items-end overflow-hidden bg-surface">
      {/* Fondo full-bleed con parallax (sobreescaneado para no ver bordes).
          Capa base: foto (siempre presente como fallback/poster).
          Capa superior: video en loop, si existe y no hay reduced-motion. */}
      <Parallax speed={70} className="absolute inset-0">
        <div className="absolute -inset-x-0 -top-24 -bottom-24">
          {/* Poster (fallback/carga) — desktop horizontal */}
          <Image
            src="/img/hero.webp"
            alt="Mujer disfrutando su ritual Geneo"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_30%] hidden md:block"
          />
          {/* Poster — mobile vertical */}
          <Image
            src="/img/hero-mobile.webp"
            alt="Mujer disfrutando su ritual Geneo"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center md:hidden"
          />
          <HeroVideo />
        </div>
      </Parallax>

      {/* Velo claro SOLO en mobile: la foto vertical pone el rostro sobre el
          texto; este degradado desde la izquierda mantiene legible el texto
          oscuro sin cambiar el look claro del hero. En desktop no hace falta. */}
      <div className="md:hidden absolute inset-0 z-[5] pointer-events-none bg-gradient-to-r from-white/92 from-0% via-white/58 via-40% to-transparent to-[74%]" />

      <div className="relative z-10 px-6 sm:px-10 lg:px-16 pt-28 pb-20 md:pt-36 md:pb-28 w-full">
        <div className="max-w-3xl flex flex-col gap-7 sm:gap-9">
          <h1 className="uppercase text-[clamp(2.25rem,6vw,4.5rem)] font-medium leading-[1.05] tracking-tight text-ink">
            <Reveal as="span" className="block text-balance" blur={8} y={20}>
              La belleza empieza adentro
            </Reveal>
            <Reveal as="span" className="block text-geneo text-balance" blur={8} y={20} delay={0.1}>
              y se celebra afuera
            </Reveal>
          </h1>

          <Reveal delay={0.3}>
            <p className="text-muted text-lg md:text-xl leading-relaxed max-w-[16rem] sm:max-w-lg">
              Nutrí tu piel desde adentro. Resultados que se ven, confianza que se siente.
            </p>
          </Reveal>

          <Reveal delay={0.38} y={16}>
            <a
              href="#ritual-finder"
              className="group inline-flex items-center gap-2 bg-geneo text-white rounded-full pl-7 pr-6 py-3.5 font-medium text-sm hover:bg-geneo-hover active:bg-geneo-hover transition-colors duration-300 ease-out"
            >
              Encontrá tu ritual
              <ArrowRight
                size={17}
                className="transition-transform duration-300 ease-out group-hover:translate-x-1 group-active:translate-x-1"
              />
            </a>
          </Reveal>

          <div className="flex flex-col sm:flex-row sm:items-stretch border-t border-ink/15 pt-6 gap-6 sm:gap-0">
            {badges.map((b, i) => (
              <Reveal key={b.t} delay={0.45 + i * 0.08} y={14} className={i > 0 ? "sm:border-l sm:border-ink/15 sm:pl-6 sm:ml-6" : ""}>
                <div className="flex items-center gap-3">
                  {b.mark ? (
                    <Image src={b.mark} alt="Natufarma" width={236} height={236} className="h-6 w-6 shrink-0" />
                  ) : b.Icon ? (
                    <b.Icon className="text-geneo shrink-0" size={24} aria-hidden="true" />
                  ) : null}
                  <div>
                    <p className="text-base font-medium text-ink">{b.t}</p>
                    <p className="text-sm text-muted">{b.s}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
