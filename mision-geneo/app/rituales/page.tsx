"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import SectionTabs from "@/components/SectionTabs";
import { RITUALES } from "@/lib/rituales";
import { getProduct } from "@/lib/products";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

/**
 * Nuestros rituales (pantalla 10 del mockup): combos de productos con la
 * necesidad que resuelve cada uno. Los productos se muestran con su foto real,
 * derivada de lib/products.ts por slug.
 */
export default function Rituales() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <SectionTabs />

        <header className="flex flex-col gap-1">
          <h1 className="text-ink font-extrabold text-2xl tracking-tight">
            Nuestros <span className="text-geneo">rituales</span>
          </h1>
          <p className="text-muted text-sm">
            Elegí el ideal para cada necesidad y recomendá con confianza.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          {RITUALES.map((r, i) => {
            const productos = r.productSlugs
              .map((s) => getProduct(s))
              .filter((p): p is NonNullable<typeof p> => Boolean(p));

            return (
              <motion.article
                key={r.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { ...spring, delay: i * 0.07 } }}
                className="flex flex-col gap-4 bg-paper rounded-3xl shadow-soft p-5"
              >
                <div className="flex items-center gap-3">
                  {productos.map((p) => (
                    <span
                      key={p.slug}
                      className="relative w-16 h-16 shrink-0 rounded-2xl bg-surface overflow-hidden"
                    >
                      <Image
                        src={p.img}
                        alt={`Geneo ${p.name}`}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                      />
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  <h2 className="text-geneo font-bold text-base uppercase tracking-wide">
                    {r.nombre}
                  </h2>
                  <p className="text-ink font-semibold text-sm">
                    {productos.map((p) => p.name).join(" + ")}
                  </p>
                  <p className="text-muted text-[13px] leading-snug">{r.para}</p>
                </div>

                {r.available && r.tiendaUrl ? (
                  <a
                    href={r.tiendaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver el ${r.nombre} en la tienda online`}
                    className="self-start inline-flex items-center gap-2 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-xs px-5 min-h-11 transition-colors"
                  >
                    Ver el pack
                    <ArrowRight size={15} />
                  </a>
                ) : (
                  <span className="self-start inline-flex items-center rounded-full border-2 border-solar/50 text-solar font-bold uppercase tracking-wide text-xs px-5 min-h-11">
                    Próximo lanzamiento
                  </span>
                )}
              </motion.article>
            );
          })}
        </section>

        <Link
          href="/productos"
          className="flex items-center justify-center gap-2 text-geneo font-semibold text-sm min-h-11"
        >
          Ver los productos por separado
          <ArrowRight size={16} />
        </Link>
      </div>
    </AppShell>
  );
}
