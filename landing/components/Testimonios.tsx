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
    nombre: "Graciela",
    edad: "54 años",
    producto: "Geneo 45+",
    cita: "Con la llegada de la menopausia sentí que mi piel había perdido hidratación y luminosidad. Buscaba un cuidado que fuera más allá de las cremas y encontré Geneo 45+. Hoy forma parte de mi rutina diaria y siento que me ayuda a cuidar mi piel desde adentro, acompañándome en esta nueva etapa.",
    foto: "/img/t2.webp",
  },
  {
    nombre: "Paula",
    edad: "37 años",
    producto: "Geneo Piel Saludable",
    cita: "En invierno con el frío, en verano con el sol, mi piel siempre parecía seca. Empecé a tomar Geneo Piel Saludable porque buscaba un cuidado desde adentro, y me gustó su fórmula con colágeno y coenzima Q10. Hoy siento mi piel más hidratada y luminosa, ¡en cualquier época del año!",
    foto: "/img/t3.webp",
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
    <section className="md:sticky md:top-0 z-[20] min-h-0 md:min-h-[100svh] flex flex-col justify-center bg-surface py-16 sm:py-24 px-4 sm:px-6">
      <div className="w-full max-w-[1440px] mx-auto">
        <Reveal>
          <h2 className="uppercase text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-ink text-center sm:text-left">
            Ellas ya viven <span className="text-geneo">su ritual</span>
          </h2>
        </Reveal>

        <p className="mt-3 flex items-center gap-1.5 text-muted text-sm justify-center sm:justify-start">
          Deslizá para ver todas <span aria-hidden="true">→</span>
        </p>

        {/* Una sola fila con scroll horizontal: entra dentro del panel sticky y no
            genera una segunda fila que quede tapada por el panel que se apila encima. */}
        <div className="flex gap-5 mt-8 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Se excluye la de Solar (aún no está a la venta). */}
          {testimonios.slice(0, 6).map((t, i) => (
            <Reveal key={t.nombre} delay={i * 0.08} className="snap-start shrink-0 w-[80%] sm:w-[340px] lg:w-[360px]" blur={8}>
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
