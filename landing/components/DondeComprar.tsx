import { Building2, ShoppingCart, ShoppingBag, ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { TIENDA_URL, MERCADOLIBRE_URL } from "@/lib/site";

/* href: si existe, la tarjeta es un link real (con feedback de hover). Si es
   null, es informativa y NO simula ser clickeable. */
const opciones = [
  {
    icono: Building2,
    nombre: "Farmacias aliadas",
    descripcion: "Encontrá tu farmacia más cercana.",
    href: null as string | null,
  },
  {
    icono: ShoppingCart,
    nombre: "Compra online",
    descripcion: "En nuestra tienda oficial con envío a todo el país.",
    href: TIENDA_URL,
  },
  {
    icono: ShoppingBag,
    nombre: "Mercado Libre",
    descripcion: "con beneficios exclusivos.",
    href: MERCADOLIBRE_URL as string | null,
  },
];

export default function DondeComprar() {
  return (
    <section id="donde-comprar" className="relative z-[80] bg-surface py-16 sm:py-36 px-4 sm:px-6">
      <div className="max-w-[1440px] mx-auto">
        {/* Encabezado + CTA */}
        <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <h2 className="uppercase text-4xl sm:text-5xl md:text-6xl font-medium text-ink tracking-tight text-center sm:text-left">
            ¿Dónde <span className="text-geneo">comprar?</span>
          </h2>
          <a
            href={TIENDA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-1.5 bg-geneo text-white rounded-full px-7 py-3.5 font-medium text-sm hover:bg-[#c70050] transition-colors duration-300 whitespace-nowrap w-full sm:w-auto"
          >
            Ir a la tienda online
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Reveal>

        {/* Bento de canales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12">
          {opciones.map((op, i) => {
            const Icono = op.icono;
            const inner = (
              <>
                <span className="w-12 h-12 rounded-full bg-geneo/8 flex items-center justify-center mb-5">
                  <Icono className="text-geneo" size={20} aria-hidden="true" />
                </span>
                <p className="font-medium text-lg tracking-tight text-ink">
                  {op.nombre}
                </p>
                <p className="text-muted text-sm mt-1.5 leading-relaxed">
                  {op.descripcion}
                </p>
              </>
            );
            return (
              <Reveal key={op.nombre} delay={i * 0.1}>
                {op.href ? (
                  <a
                    href={op.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full bg-white rounded-3xl shadow-soft p-6 sm:p-8 hover:shadow-card hover:-translate-y-1 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-geneo focus-visible:outline-offset-2"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="h-full bg-white rounded-3xl shadow-soft p-6 sm:p-8">
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
