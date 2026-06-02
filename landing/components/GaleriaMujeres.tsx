import Image from "next/image";
import type { CSSProperties } from "react";
import Reveal from "@/components/Reveal";

/* Banda full-width de retratos editoriales. Se desliza en loop infinito
   (CSS .marquee-track) y se pausa al hover. Jóvenes y +45: toda la marca. */
const fotos = [
  { src: "/img/galeria/g1.webp", alt: "Mujer joven con piel luminosa, comunidad Geneo" },
  { src: "/img/galeria/g2.webp", alt: "Mujer sonriendo al natural, comunidad Geneo" },
  { src: "/img/galeria/g3.webp", alt: "Retrato editorial de mujer, comunidad Geneo" },
  { src: "/img/galeria/g4.webp", alt: "Mujer adulta con piel firme, comunidad Geneo" },
  { src: "/img/galeria/g5.webp", alt: "Mujer disfrutando su ritual de belleza Geneo" },
  { src: "/img/galeria/g6.webp", alt: "Mujer con glow natural, comunidad Geneo" },
];

function Card({ src, alt, decorative = false }: { src: string; alt: string; decorative?: boolean }) {
  return (
    <div className="relative h-[340px] sm:h-[440px] lg:h-[500px] aspect-[3/4] rounded-3xl overflow-hidden shrink-0 shadow-soft">
      <Image
        src={src}
        alt={decorative ? "" : alt}
        fill
        sizes="(max-width: 640px) 60vw, 375px"
        className="object-cover"
      />
    </div>
  );
}

export default function GaleriaMujeres() {
  return (
    <section className="sticky top-0 z-[30] min-h-[100svh] flex flex-col justify-center bg-white py-16 sm:py-36 overflow-hidden">
      <Reveal blur={8} className="max-w-[1440px] mx-auto px-6 mb-8 sm:mb-12 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-geneo uppercase mb-3">
          Mujeres Geneo
        </p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight text-ink">
          La belleza tiene <span className="text-geneo">muchas caras</span>
        </h2>
      </Reveal>

      {/* Banda full-bleed con fundido en los bordes */}
      <div
        className="marquee-paused relative w-full overflow-hidden"
        style={
          {
            maskImage:
              "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
            "--marquee-duration": "28s",
          } as CSSProperties
        }
      >
        <div className="marquee-track flex w-max">
          <div className="flex shrink-0 gap-5 pr-5">
            {fotos.map((f) => (
              <Card key={f.src} src={f.src} alt={f.alt} />
            ))}
          </div>
          <div className="flex shrink-0 gap-5 pr-5" aria-hidden="true">
            {fotos.map((f) => (
              <Card key={`dup-${f.src}`} src={f.src} alt={f.alt} decorative />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
