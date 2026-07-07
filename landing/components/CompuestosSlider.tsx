"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

type Compuesto = { nombre: string; descripcion: string; img: string };

/**
 * CompuestosSlider — carrusel horizontal de compuestos activos.
 *
 * Resuelve el caso del MOUSE: un contenedor `overflow-x-auto` solo responde a
 * scroll horizontal nativo (trackpad). Con la rueda del mouse (deltaY vertical)
 * el navegador no lo desplaza. Acá traducimos deltaY → scrollLeft, pero solo
 * mientras quede recorrido en esa dirección: al llegar al borde soltamos el
 * gesto para no secuestrar el scroll vertical de la página. Además sumamos
 * botones ‹ › para navegación explícita (mouse, teclado y touch).
 */
export default function CompuestosSlider({ compuestos }: { compuestos: Compuesto[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // Actualiza el estado de los botones según la posición del scroll.
  const updateArrows = () => {
    const el = scroller.current;
    if (!el) return;
    // -1 de tolerancia: el redondeo subpíxel puede dejar maxScroll a 0.5px.
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft < maxScroll - 1);
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    updateArrows();

    // Rueda vertical → desplazamiento horizontal. passive:false para poder
    // preventDefault solo cuando efectivamente consumimos el gesto.
    const onWheel = (e: WheelEvent) => {
      // Si el gesto ya es horizontal (trackpad), el navegador lo maneja bien.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= maxScroll - 1;
      // En el borde, dejamos pasar el scroll vertical de la página.
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", updateArrows);
    };
  }, []);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    // ~85% del ancho visible: avanza casi una "página" dejando contexto.
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-[0.2em] text-geneo uppercase">
            Compuestos activos avanzados
          </p>
          <h3 className="uppercase text-2xl sm:text-3xl font-medium text-ink tracking-tight">
            Conocé todos los ingredientes de nuestra línea Geneo
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-muted text-xs font-medium sm:hidden">
            Deslizá <ArrowRight size={14} aria-hidden="true" />
          </span>
          {/* Botones de navegación: visibles donde hay mouse (sm+). */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              disabled={!canPrev}
              aria-label="Ver compuestos anteriores"
              className="w-11 h-11 rounded-full border border-line flex items-center justify-center text-ink hover:bg-geneo hover:text-white hover:border-geneo disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink disabled:hover:border-line disabled:cursor-default transition-colors duration-300 cursor-pointer"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              disabled={!canNext}
              aria-label="Ver más compuestos"
              className="w-11 h-11 rounded-full border border-line flex items-center justify-center text-ink hover:bg-geneo hover:text-white hover:border-geneo disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink disabled:hover:border-line disabled:cursor-default transition-colors duration-300 cursor-pointer"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scroller}
        className="-mx-6 px-6 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*:last-child]:mr-6"
      >
        {compuestos.map((c, i) => (
          <article
            key={c.nombre}
            className="snap-start flex-shrink-0 w-64 sm:w-72 bg-white rounded-3xl shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="relative aspect-square bg-surface">
              <Image src={c.img} alt={c.nombre} fill sizes="288px" className="object-contain p-6" />
            </div>
            <div className="p-6 flex flex-col gap-2">
              <span className="text-geneo font-medium text-sm tracking-widest">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-medium text-base text-ink leading-tight tracking-tight">{c.nombre}</p>
              <p className="text-muted text-sm leading-relaxed">{c.descripcion}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
