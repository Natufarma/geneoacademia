"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, SearchX } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, SectionHeader } from "@/components/ui";
import { QUICK_NEEDS, productActives, searchProducts } from "@/lib/mostrador";
import type { Product } from "@/lib/products";

export default function Mostrador() {
  return (
    <AppShell>
      <MostradorContent />
    </AppShell>
  );
}

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

function MostradorContent() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchProducts(query), [query]);
  const searching = query.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader subtitle="Escribí lo que busca tu cliente y te decimos qué recomendarle.">
        ¿Qué busca <span className="text-geneo">tu cliente?</span>
      </SectionHeader>

      <label className="relative flex items-center">
        <Search size={18} className="absolute left-4 text-soft" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: firmeza, pelo, menopausia, sol…"
          autoComplete="off"
          className="w-full rounded-full border border-line bg-surface pl-11 pr-5 py-3 text-base text-ink placeholder:text-soft focus:border-geneo focus:outline-none"
        />
      </label>

      {/* Chips de acceso rápido */}
      <div className="flex flex-wrap gap-2">
        {QUICK_NEEDS.map((need) => {
          const active = query.trim().toLowerCase() === need.query;
          return (
            <button
              key={need.query}
              type="button"
              onClick={() => setQuery(need.query)}
              className={`inline-flex items-center min-h-11 rounded-full border-2 px-4 text-sm font-bold tracking-tight transition-colors ${
                active
                  ? "border-geneo bg-geneo text-white"
                  : "border-line bg-paper text-muted hover:border-geneo hover:text-geneo active:border-geneo active:text-geneo"
              }`}
            >
              {need.label}
            </button>
          );
        })}
      </div>

      {/* Se anima el CAMBIO DE ESTADO (ayuda / vacío / resultados), con keys
          ESTABLES: dentro de "resultados" la lista actualiza su contenido sin
          re-montarse en cada tecla (evita el jank de tipear). */}
      <AnimatePresence mode="wait">
        {!searching ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="text-soft text-sm text-center px-4 py-6"
          >
            Tocá una opción de arriba o escribí lo que el cliente te pide con sus palabras.
          </motion.p>
        ) : results.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
          >
            <Card variant="quiet" className="flex flex-col items-center text-center gap-2 px-6 py-8">
              <SearchX size={26} className="text-soft" />
              <p className="text-ink font-bold text-sm">No encontramos un producto para eso</p>
              <p className="text-muted text-sm leading-snug">
                Probá con otra palabra (por ejemplo: firmeza, glow, pelo, uñas, +45, sol).
              </p>
            </Card>
          </motion.div>
        ) : (
          <motion.ol
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="flex flex-col gap-3"
          >
            {results.map((product, i) => (
              <motion.li
                key={product.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: i * 0.05 }}
              >
                <CounterCard product={product} />
              </motion.li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Ficha compacta para leer en 2 segundos frente al cliente. */
function CounterCard({ product }: { product: Product }) {
  const actives = productActives(product);
  return (
    <Card variant="base" className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-4">
        <span className="relative w-14 h-14 shrink-0">
          <Image src={product.img} alt="" fill sizes="56px" className="object-contain" />
        </span>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className={`font-extrabold text-lg leading-tight tracking-tight ${product.accent}`}>
            {product.name}
          </p>
          {product.available ? (
            <p className="text-muted text-sm leading-snug">{product.beneficio}</p>
          ) : (
            <span className="inline-flex items-center self-start rounded-full bg-rosa-suave text-geneo text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
              Próximo lanzamiento
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-surface px-4 py-3.5">
        <Field label="Ofrecéselo a" value={product.paraQuien} />
        <Field label="Con qué argumento" value={product.beneficio} emphasize />
        {actives.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-soft text-[11px] font-bold uppercase tracking-widest">Activos</p>
            <div className="flex flex-wrap gap-1.5">
              {actives.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center rounded-full bg-rosa-suave text-geneo text-xs font-semibold px-2.5 py-1"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
        {product.presentacion && <Field label="Presentación" value={product.presentacion} />}
      </div>

      <Link
        href={`/productos/${product.slug}`}
        className="inline-flex items-center justify-center gap-1.5 min-h-11 self-start text-geneo text-sm font-bold underline underline-offset-2"
      >
        Ver la ficha completa
        <ArrowRight size={16} />
      </Link>
    </Card>
  );
}

function Field({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-soft text-[11px] font-bold uppercase tracking-widest">{label}</p>
      <p className={`text-sm leading-snug ${emphasize ? "text-ink font-bold" : "text-muted"}`}>
        {value}
      </p>
    </div>
  );
}
