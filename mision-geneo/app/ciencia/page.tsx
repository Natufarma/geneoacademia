"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FlaskConical, Sparkles, Heart, BookOpen } from "lucide-react";
import AppShell from "@/components/AppShell";
import SectionTabs from "@/components/SectionTabs";
import { CIENCIA_INTRO, PILARES, TIEMPOS } from "@/lib/ciencia";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

/** Ícono por pilar (mismo orden que PILARES). */
const PILAR_ICONS = [FlaskConical, Sparkles, Heart] as const;

/**
 * "Con respaldo de ciencia" (lámina 4): los 3 pilares de la marca, la lógica de
 * la constancia (20/40/90 días) y el acceso a la guía de activos de la Academia.
 */
export default function Ciencia() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <SectionTabs />

        <header className="flex flex-col gap-2">
          <p className="text-geneo text-[11px] font-bold uppercase tracking-widest">
            Con respaldo de ciencia
          </p>
          <h1 className="text-ink font-extrabold text-2xl tracking-tight leading-tight">
            La belleza empieza <span className="text-geneo">adentro</span>
          </h1>
          <p className="text-muted text-sm leading-snug">{CIENCIA_INTRO}</p>
        </header>

        {/* Pilares */}
        <section className="flex flex-col gap-3" aria-label="Pilares de la marca">
          {PILARES.map((p, i) => {
            const Icon = PILAR_ICONS[i];
            return (
              <motion.article
                key={p.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { ...spring, delay: i * 0.06 } }}
                className="flex items-start gap-4 bg-paper rounded-3xl shadow-soft p-5"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-rosa-suave text-geneo shrink-0">
                  <Icon size={20} />
                </span>
                <span className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-ink font-bold leading-tight">{p.titulo}</span>
                  <span className="text-muted text-sm leading-snug">{p.bajada}</span>
                </span>
              </motion.article>
            );
          })}
        </section>

        {/* Constancia: 20 / 40 / 90 días */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.2 } }}
          className="flex flex-col gap-4 bg-paper rounded-3xl shadow-card p-6"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-ink font-bold text-lg tracking-tight">
              Los resultados llegan con constancia
            </h2>
            <p className="text-muted text-sm leading-snug">
              El ritual se construye día a día. Esto es lo que se ve con el tiempo:
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {TIEMPOS.map((t) => (
              <div key={t.dias} className="flex items-baseline gap-3">
                <span className="text-geneo font-extrabold text-3xl leading-none shrink-0 w-16">
                  {t.dias}
                  <span className="text-muted text-sm font-semibold"> días</span>
                </span>
                <span className="text-muted text-sm leading-snug">{t.desc}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Acceso a la guía de activos (no se duplica: se enlaza) */}
        <Link
          href="/academia/activos"
          className="flex items-center gap-4 bg-gradient-to-br from-geneo to-geneo-dark text-white rounded-3xl shadow-card px-5 py-4 hover:brightness-105 active:brightness-105 transition-all"
        >
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-white/15 shrink-0">
            <BookOpen size={20} />
          </span>
          <span className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="font-bold text-sm leading-tight">La ciencia de cada activo</span>
            <span className="text-white/85 text-xs">Estudiá los 9 activos en la Academia Geneo.</span>
          </span>
          <ArrowRight size={18} className="shrink-0" />
        </Link>
      </div>
    </AppShell>
  );
}
