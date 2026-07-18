"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, FlaskConical, UserRound } from "lucide-react";
import AppShell from "@/components/AppShell";
import { getProduct } from "@/lib/products";
import { ACTIVES } from "@/lib/actives";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

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

        {/* Hero del producto */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="flex flex-col gap-4 bg-paper rounded-3xl shadow-card p-6"
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
            <h1 className={`uppercase ${product.accent} font-extrabold text-2xl tracking-tight`}>
              {product.name}
            </h1>
            <p className="text-ink text-base leading-snug">{product.beneficio}</p>
            {product.presentacion && (
              <p className="text-soft text-xs font-semibold uppercase tracking-wide">
                {product.presentacion}
              </p>
            )}
          </div>
        </motion.section>

        {/* Fórmula */}
        {product.formula && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.05 } }}
            className="flex flex-col gap-2.5 bg-paper rounded-3xl shadow-soft p-5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rosa-suave text-geneo shrink-0">
                <FlaskConical size={17} />
              </span>
              <h2 className="text-ink font-bold text-base">Fórmula</h2>
            </div>
            <p className="text-muted text-sm leading-snug">{product.formula}</p>
          </motion.section>
        )}

        {/* A quién recomendar */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.1 } }}
          className="flex flex-col gap-2.5 bg-paper rounded-3xl shadow-soft p-5"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rosa-suave text-geneo shrink-0">
              <UserRound size={17} />
            </span>
            <h2 className="text-ink font-bold text-base">A quién recomendárselo</h2>
          </div>
          <p className="text-muted text-sm leading-snug">{product.paraQuien}</p>
        </motion.section>

        {/* Activos (derivados de ACTIVES) */}
        {activos.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-ink font-bold text-lg tracking-tight">Sus activos</h2>
            {activos.map((a, i) => (
              <motion.article
                key={a.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.05 + i * 0.05 } }}
                className="flex items-start gap-4 bg-paper rounded-3xl shadow-soft p-5"
              >
                <span className="relative w-16 h-16 shrink-0 rounded-2xl bg-rosa-suave/40 overflow-hidden">
                  <Image src={a.img} alt={a.name} fill sizes="64px" className="object-contain p-1.5" />
                </span>
                <span className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <span className="text-ink font-bold leading-tight">{a.name}</span>
                  <span className="text-muted text-sm leading-snug">{a.description}</span>
                </span>
              </motion.article>
            ))}
            <Link
              href="/academia/activos"
              className="flex items-center gap-4 bg-paper rounded-3xl shadow-soft px-5 py-4 hover:shadow-card active:shadow-card transition-shadow"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-rosa-suave text-geneo shrink-0">
                <BookOpen size={20} />
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-ink font-bold text-sm">Estudiá los activos en la Academia</span>
                <span className="text-muted text-xs">Guía completa con la ciencia de cada uno.</span>
              </span>
              <ArrowRight size={18} className="text-geneo shrink-0" />
            </Link>
          </section>
        )}

        {/* Estado / compra */}
        {product.available ? (
          product.tiendaUrl && (
            <a
              href={product.tiendaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
            >
              Ver en la tienda
              <ArrowRight size={18} />
            </a>
          )
        ) : (
          <div className="flex flex-col gap-1.5 bg-rosa-suave/50 rounded-3xl px-5 py-4 text-center">
            <p className="text-solar font-bold text-sm uppercase tracking-wide">
              Próximo lanzamiento
            </p>
            <p className="text-muted text-sm leading-snug">
              Su composición todavía no está publicada. Pronto vas a poder
              recomendarlo.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
