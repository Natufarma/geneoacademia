"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, FlaskConical, Megaphone } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, SectionHeader } from "@/components/ui";
import { getProduct } from "@/lib/products";
import { ACTIVES } from "@/lib/actives";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;
const reveal = { once: true, margin: "-10% 0px" } as const;

/**
 * Ficha individual de producto. Los activos se derivan de ACTIVES (única fuente
 * de verdad, rastreada a la landing): un producto sin composición publicada
 * (Solar) no muestra activos ni fórmula.
 */
export default function ProductoDetalle() {
  const params = useParams<{ slug: string }>();
  const product = getProduct(params.slug);

  if (!product) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-ink font-bold text-lg">Ese producto no existe.</p>
          <Link
            href="/productos"
            className="inline-flex min-h-11 items-center text-geneo font-semibold underline"
          >
            Volver a productos
          </Link>
        </div>
      </AppShell>
    );
  }

  const activos = ACTIVES.filter((a) => a.products.includes(product.name));

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <Link
          href="/productos"
          className="self-start inline-flex min-h-11 items-center gap-1.5 text-geneo font-semibold text-sm"
        >
          <ArrowLeft size={16} />
          Productos
        </Link>

        {/* Hero del producto — la tarjeta principal de la ficha (nivel feature) */}
        <Card
          as={motion.section}
          variant="feature"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={reveal}
          transition={spring}
          className="flex flex-col gap-4 p-5"
        >
          <div className="relative aspect-square w-full max-w-[220px] mx-auto rounded-2xl overflow-hidden bg-surface">
            <Image
              src={product.img}
              alt={`Geneo ${product.name}`}
              fill
              sizes="220px"
              className="object-contain p-3"
              priority
            />
          </div>
          <div className="flex flex-col gap-2 text-center">
            <h1
              className={`uppercase ${product.accent} font-extrabold text-[clamp(1.375rem,0.875rem_+_2.5vw,1.5rem)] leading-snug tracking-tight`}
            >
              {product.name}
            </h1>
            <p className="text-ink text-base leading-snug">{product.beneficio}</p>
          </div>
        </Card>

        {/* Fórmula */}
        {product.formula && (
          <Card
            as={motion.section}
            variant="base"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={reveal}
            transition={{ ...spring, delay: 0.05 }}
            className="flex flex-col gap-3 p-5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rosa-suave text-geneo shrink-0">
                <FlaskConical size={17} />
              </span>
              <h2 className="text-ink font-bold text-base">Fórmula</h2>
            </div>
            <p className="text-muted text-sm leading-relaxed">{product.formula}</p>
          </Card>
        )}

        {/* Activos (derivados de ACTIVES) */}
        {activos.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionHeader>Sus activos</SectionHeader>
            {activos.map((a, i) => (
              <Card
                as={motion.article}
                key={a.slug}
                variant="base"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={reveal}
                transition={{ ...spring, delay: 0.05 + i * 0.05 }}
                className="flex items-start gap-4 p-5"
              >
                <span className="relative w-16 h-16 shrink-0 rounded-2xl bg-rosa-suave/40 overflow-hidden">
                  <Image src={a.img} alt={a.name} fill sizes="64px" className="object-contain p-1.5" />
                </span>
                <span className="flex-1 min-w-0 flex flex-col gap-2">
                  <span className="text-ink font-bold leading-tight">{a.name}</span>
                  <span className="text-muted text-sm leading-relaxed">{a.description}</span>
                </span>
              </Card>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={reveal}
              transition={{ ...spring, delay: 0.05 + activos.length * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ y: -2 }}
            >
              <Card as={Link} href="/academia/activos" variant="base" interactive className="flex items-center gap-4 p-5">
                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-rosa-suave text-geneo shrink-0">
                  <BookOpen size={20} />
                </span>
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-ink font-bold text-sm">Estudiá los activos en la Academia</span>
                  <span className="text-muted text-xs">Guía completa con la ciencia de cada uno.</span>
                </span>
                <ArrowRight size={18} className="text-geneo shrink-0" />
              </Card>
            </motion.div>
          </section>
        )}

        {/* Cómo recomendarlo: cierre de la ficha, referencia secundaria (nivel quiet) */}
        {product.available ? (
          <Card
            as={motion.section}
            variant="quiet"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={reveal}
            transition={{ ...spring, delay: 0.2 }}
            className="flex flex-col gap-4 p-5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rosa-suave text-geneo shrink-0">
                <Megaphone size={17} />
              </span>
              <h2 className="text-ink font-bold text-base">Cómo recomendarlo</h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-soft text-xs font-bold uppercase tracking-widest">
                Ofrecéselo a
              </p>
              <p className="text-muted text-sm leading-snug">{product.paraQuien}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-soft text-xs font-bold uppercase tracking-widest">
                Con qué argumento
              </p>
              <p className="text-ink text-sm font-semibold leading-snug">{product.beneficio}</p>
              {activos.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activos.map((a) => (
                    <span
                      key={a.slug}
                      className="rounded-full bg-rosa-suave text-geneo text-xs font-semibold px-2.5 py-1"
                    >
                      {a.name}
                    </span>
                  ))}
                </div>
              )}
              {product.formula && (
                <p className="text-soft text-xs leading-snug">Fórmula: {product.formula}</p>
              )}
            </div>

            {product.presentacion && (
              <div className="flex flex-col gap-1.5">
                <p className="text-soft text-xs font-bold uppercase tracking-widest">
                  Presentación
                </p>
                <p className="text-muted text-sm leading-snug">{product.presentacion}</p>
              </div>
            )}
          </Card>
        ) : (
          <Card variant="quiet" className="flex flex-col gap-1.5 p-5 text-center">
            <p className="text-solar font-bold text-sm uppercase tracking-wide">
              Próximo lanzamiento
            </p>
            <p className="text-muted text-sm leading-snug">
              Su composición todavía no está publicada. Pronto vas a poder
              recomendarlo.
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
