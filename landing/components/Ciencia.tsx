import Image from "next/image";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import CompuestosSlider from "@/components/CompuestosSlider";

/* Dos compuestos destacados (los del mockup) con su molécula y descripción
   real, condensada, tomada de geneo.natufarma.com. */
const compuestosDestacados = [
  {
    nombre: "Colágeno hidrolizado",
    descripcion:
      "Principal componente de la dermis: crea y mantiene las estructuras de los tejidos. Mantener su cantidad es la clave de una piel firme y flexible.",
    img: "/img/comp-colageno.webp",
  },
  {
    nombre: "Coenzima Q-10",
    descripcion:
      "Ayuda a generar energía en las células y su producción cae con la edad. Aporta acción energizante y antioxidante, evitando arrugas y envejecimiento prematuro.",
    img: "/img/comp-q10.webp",
  },
];

/* Los 9 compuestos activos reales de Geneo, con su molécula y descripción
   tomada (condensada) de geneo.natufarma.com/es/compuestos-activos. */
const todosLosCompuestos = [
  {
    nombre: "Ácido hialurónico",
    descripcion:
      "A partir de los 35 años la piel pierde firmeza y volumen por la caída en su producción. Actúa como hidratante y lubricante de los tejidos, aumentando volumen y densidad y minimizando las arrugas.",
    img: "/img/comp-acido.webp",
  },
  {
    nombre: "Colágeno hidrolizado",
    descripcion:
      "Principal componente de la dermis. Su función es crear y mantener las estructuras de los tejidos, decisiva para la firmeza y la flexibilidad de la piel.",
    img: "/img/comp-colageno.webp",
  },
  {
    nombre: "Coenzima Q-10",
    descripcion:
      "Compuesto que ayuda a generar energía en las células; su producción disminuye con la edad. Acción energizante y antioxidante que evita arrugas y envejecimiento prematuro.",
    img: "/img/comp-q10.webp",
  },
  {
    nombre: "Resveratrol",
    descripcion:
      "Polifenol natural presente en las uvas negras y el vino tinto. Potente antioxidante: colabora en eliminar radicales libres y prevenir el envejecimiento prematuro.",
    img: "/img/comp-resveratrol.webp",
  },
  {
    nombre: "Isoflavonas de soja (genisteína)",
    descripcion:
      "Los estrógenos regulan el espesor e hidratación de la piel y caen desde los 45 años. La genisteína mejora las propiedades estructurales de la piel y estimula la producción de ácido hialurónico.",
    img: "/img/comp-isoflavonas.webp",
  },
  {
    nombre: "L-cistina",
    descripcion:
      "Aminoácido azufrado, principal constituyente de la queratina del cabello, piel y uñas. Participa en su síntesis y se asocia a un aumento en la densidad del pelo.",
    img: "/img/comp-lcistina.webp",
  },
  {
    nombre: "Carotenos",
    descripcion:
      "El betacaroteno se transforma en vitamina A y actúa como pigmentante natural: favorece un bronceado más rápido e intenso desde adentro.",
    img: "/img/comp-carotenos.webp",
  },
  {
    nombre: "Licopeno",
    descripcion:
      "Antioxidante que potencia el efecto del betacaroteno y ayuda a proteger la piel frente a los rayos UV.",
    img: "/img/comp-licopeno.webp",
  },
  {
    nombre: "Vitamina C",
    descripcion:
      "Antioxidante esencial que participa en la síntesis de colágeno y aporta luminosidad, protegiendo la piel del daño oxidante.",
    img: "/img/comp-vitaminac.webp",
  },
];

export default function Ciencia() {
  return (
    <section id="ciencia" className="relative z-[50] bg-surface py-16 sm:py-36">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* Layout principal 2 columnas */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Columna texto + compuestos destacados */}
          <Reveal className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <h2 className="uppercase text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight text-ink">
                Ciencia que nutre <span className="text-geneo">tu piel.</span>
              </h2>
              <p className="text-muted leading-relaxed max-w-md">
                Fórmulas nutricosméticas avanzadas, desarrolladas sobre evidencia
                científica para cuidar tu belleza desde adentro.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {compuestosDestacados.map((ing) => (
                <div
                  key={ing.nombre}
                  className="flex gap-5 items-center bg-white rounded-3xl shadow-soft p-6 hover:shadow-card hover:-translate-y-1 active:shadow-card active:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={ing.img}
                      alt={ing.nombre}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-medium text-base text-ink tracking-tight">{ing.nombre}</p>
                    <p className="text-muted text-sm sm:text-base leading-relaxed">{ing.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Foto: ritual en uso, con parallax interno */}
          <Reveal delay={0.1} blur={10} className="order-first lg:order-last">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-card">
              <Parallax speed={45} className="absolute inset-0">
                <div className="absolute -inset-y-12 inset-x-0">
                  <Image
                    src="/img/ciencia.webp"
                    alt="Mujer sosteniendo Geneo Colágeno & Q-10"
                    fill
                    sizes="(max-width: 448px) 90vw, 448px"
                    className="object-cover"
                  />
                </div>
              </Parallax>
            </div>
          </Reveal>
        </div>

        {/* Todos los compuestos activos — slider con rueda de mouse + botones */}
        <div className="mt-20">
          <CompuestosSlider compuestos={todosLosCompuestos} />
        </div>
      </div>
    </section>
  );
}
