"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Search } from "lucide-react";
import AppShell from "@/components/AppShell";
import SectionTabs from "@/components/SectionTabs";
import { Card } from "@/components/ui";
import { PRODUCTS } from "@/lib/products";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

/**
 * Material de consulta rápida para el mostrador: los 4 productos de la línea.
 * Cada card abre su ficha con fórmula, activos y a quién recomendárselo.
 */
export default function Productos() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <SectionTabs />

        <header className="flex flex-col gap-1">
          <h1 className="text-ink font-extrabold text-2xl tracking-tight">
            Nuestros <span className="text-geneo">productos</span>
          </h1>
          <p className="text-muted text-sm">
            Tocá cada uno para ver su fórmula y a quién recomendárselo.
          </p>
        </header>

        {/* Acceso a la consulta de mostrador (buscar por necesidad del cliente) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <Card
            as={Link}
            href="/mostrador"
            variant="base"
            interactive
            className="flex items-center gap-3.5 px-5 py-3.5"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-rosa-suave text-geneo shrink-0">
              <Search size={19} />
            </span>
            <span className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="block text-ink font-bold text-sm leading-tight">
                ¿Qué busca tu cliente?
              </span>
              <span className="block text-muted text-xs leading-snug">
                Buscá por necesidad y recomendá al instante.
              </span>
            </span>
            <ChevronRight size={18} className="text-geneo shrink-0" />
          </Card>
        </motion.div>

        <section className="grid grid-cols-2 gap-3.5">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { ...spring, delay: i * 0.06 } }}
              whileHover={{ y: -2 }}
              whileTap={{ y: -2 }}
              transition={spring}
            >
              <Card
                as={Link}
                href={`/productos/${p.slug}`}
                aria-label={`Ver ficha de Geneo ${p.name}`}
                variant="base"
                interactive
                className="flex flex-col gap-2.5 p-3.5 h-full"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface">
                  <Image
                    src={p.img}
                    alt={`Geneo ${p.name}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 220px"
                    className="object-contain p-3"
                  />
                </div>
                <div className="px-1 pb-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className={`uppercase ${p.accent} font-bold text-sm tracking-wide`}>
                      {p.name}
                    </h2>
                    <ChevronRight size={16} className="text-soft shrink-0" />
                  </div>
                  <p className="text-muted text-[13px] leading-snug">{p.beneficio}</p>
                  {!p.available && (
                    <span className="self-start rounded-full bg-rosa-suave/60 text-solar text-[10px] font-bold uppercase tracking-wide px-2.5 py-1">
                      Próximo lanzamiento
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </section>

        <Card variant="quiet" className="text-soft text-xs leading-relaxed text-center px-4 py-3">
          La constancia es la clave: los resultados se construyen a los 20, 40 y
          90 días.
        </Card>
      </div>
    </AppShell>
  );
}
