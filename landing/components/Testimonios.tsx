import Image from "next/image";
import Reveal from "@/components/Reveal";
import { SOCIAL } from "@/lib/site";

const testimonios = [
  {
    nombre: "Lorena",
    edad: "40 años",
    producto: "Geneo Piel Saludable",
    cita: "Lo sumé a mi rutina diaria y lo que más noté fue la hidratación. Mi piel está más suave y con mejor textura.",
    foto: "/img/t1.webp",
  },
  {
    nombre: "Candela",
    edad: "35 años",
    producto: "Geneo Beauty",
    cita: "¡Más luminosa y firme!! Así me siento yo y así lo reflejo. Mis amigas me preguntan qué hago.",
    foto: "/img/t2.webp",
  },
  {
    nombre: "Sofía",
    edad: "34 años",
    producto: "Geneo Beauty",
    cita: "Desde que tomé Geneo, mis uñas están más fuertes y mi pelo creció mucho más.",
    foto: "/img/t3.webp",
  },
  {
    nombre: "Valeria",
    edad: "48 años",
    producto: "Geneo 45+",
    cita: "A mis 48 años noté una diferencia real en la firmeza de mi piel. Lo recomiendo a todas las que estamos en esta etapa.",
    foto: "/img/t1.webp",
  },
  {
    nombre: "Marina",
    edad: "29 años",
    producto: "Geneo Solar",
    cita: "Mi piel se broncea más parejo y sin manchas. Lo tomo todo el año, pero especialmente en verano.",
    foto: "/img/t2.webp",
  },
];

export default function Testimonios() {
  return (
    <section className="sticky top-0 z-[20] min-h-[100svh] flex flex-col justify-center bg-surface py-16 sm:py-36 px-4 sm:px-6">
      <div className="w-full max-w-[1440px] mx-auto">
        <Reveal>
          <h2 className="uppercase text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-ink text-center sm:text-left">
            Ellas ya viven <span className="text-geneo">su ritual</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-12 sm:mt-14">
          {testimonios.slice(0, 3).map((t, i) => (
            <Reveal key={t.nombre} delay={i * 0.1} className="h-full" blur={8}>
              <div className="h-full bg-white rounded-3xl shadow-soft p-6 sm:p-8 hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <p className="text-geneo text-base" role="img" aria-label="5 de 5 estrellas">★★★★★</p>
                <p className="text-ink text-base italic leading-relaxed mt-4 flex-1">
                  &ldquo;{t.cita}&rdquo;
                </p>
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-line">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={t.foto}
                      alt={`Foto de ${t.nombre}, usuaria de ${t.producto}`}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-ink">{t.nombre}</p>
                    <p className="text-xs text-muted">
                      {t.edad} · {t.producto}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <a
          href={SOCIAL.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-geneo font-medium text-sm mt-12 mx-auto sm:mx-0 w-fit"
        >
          Ver más en Instagram
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </section>
  );
}
