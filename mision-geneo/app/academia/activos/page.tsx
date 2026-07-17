"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import AppShell from "@/components/AppShell";
import { ACTIVES } from "@/lib/actives";
import { getMission } from "@/lib/missions";
import { useApp } from "@/lib/store";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

/**
 * Guía de estudio de la Academia Geneo: siempre accesible (el material de
 * estudio no se bloquea); la que tiene gate de Especialista es la prueba.
 */
export default function GuiaActivosPage() {
  const { isSpecialist } = useApp();
  const prueba = getMission("activos-avanzado");

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="flex flex-col gap-2"
        >
          <Link
            href="/misiones"
            className="self-start inline-flex min-h-11 items-center gap-1.5 text-geneo font-semibold text-sm"
          >
            <ArrowLeft size={16} />
            Mis misiones
          </Link>
          <div className="flex flex-col gap-1">
            <p className="text-geneo text-[11px] font-bold uppercase tracking-widest">
              Academia Geneo · Guía de estudio
            </p>
            <h1 className="text-ink font-extrabold text-2xl tracking-tight leading-tight">
              Los activos de Geneo
            </h1>
            <p className="text-muted text-sm leading-snug">
              Estudiá cada activo con calma: qué es, qué hace y en qué fórmula
              está. Cuando te sientas lista, demostralo en la prueba.
            </p>
          </div>
        </motion.header>

        <section className="flex flex-col gap-3" aria-label="Activos de Geneo">
          {ACTIVES.map((a, i) => (
            <motion.article
              key={a.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { ...spring, delay: 0.05 + i * 0.05 },
              }}
              className="flex items-start gap-4 bg-paper rounded-3xl shadow-soft p-5"
            >
              <span className="relative w-20 h-20 shrink-0 rounded-2xl bg-rosa-suave/40 overflow-hidden">
                <Image
                  src={a.img}
                  alt={a.name}
                  fill
                  sizes="80px"
                  className="object-contain p-1.5"
                />
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-1.5">
                <span className="text-ink font-bold leading-tight">{a.name}</span>
                <span className="text-muted text-sm leading-snug">{a.description}</span>
                {a.products.length > 0 && (
                  <span className="flex flex-wrap gap-1.5">
                    {a.products.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-rosa-suave/60 text-geneo text-[10px] font-bold uppercase tracking-wide px-2.5 py-1"
                      >
                        {p}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </motion.article>
          ))}
        </section>

        {/* CTA a la prueba (con el mismo gate de la misión avanzada) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.15 } }}
          className="bg-gradient-to-br from-geneo to-geneo-dark text-white rounded-3xl p-6 flex flex-col items-center text-center gap-4"
        >
          {isSpecialist ? (
            <>
              <div className="flex flex-col gap-1">
                <p className="font-extrabold text-xl leading-tight">
                  ¿Lista para el desafío?
                </p>
                <p className="text-white/85 text-sm leading-snug">
                  {prueba
                    ? `“${prueba.title}” te espera: +${prueba.pointsTotal} pts para tu farmacia.`
                    : "La prueba avanzada te espera."}
                </p>
              </div>
              <Link
                href="/mision/activos-avanzado"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white text-geneo font-bold uppercase tracking-wide text-sm px-6 py-3"
              >
                Hacé la prueba
                <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-white/15">
                <Lock size={20} />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-extrabold text-lg leading-tight">
                  La prueba se desbloquea al certificarte
                </p>
                <p className="text-white/85 text-sm leading-snug">
                  Completá las 6 misiones y volvé por el desafío avanzado.
                </p>
              </div>
              <Link
                href="/misiones"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white text-geneo font-bold uppercase tracking-wide text-sm px-6 py-3"
              >
                Ir a mis misiones
              </Link>
            </>
          )}
        </motion.section>
      </div>
    </AppShell>
  );
}
