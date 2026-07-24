"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronRight, Gift, RotateCcw, Sparkles, Trophy } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { Card, SectionHeader } from "@/components/ui";

/**
 * "Desafío de tu farmacia": enmarca el ranking mensual de farmacias
 * (GET /api/ranking) como un desafío de equipo, con la brecha de puntos
 * hasta el 1er puesto. Reusa el mismo endpoint que /ranking — no hay
 * backend nuevo ni migración; esto es solo una lectura motivacional
 * distinta de los mismos datos.
 */

type PharmacyRankRow = {
  position: number;
  name: string;
  city: string | null;
  score: number;
  activeCount: number;
};

type RankingResponse = {
  period: string;
  employees: unknown[];
  pharmacies: PharmacyRankRow[];
};

const SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;

/** "2026-07" → "julio 2026" */
function periodLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return new Date(y, m - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export default function Desafio() {
  return (
    <AppShell>
      <DesafioContent />
    </AppShell>
  );
}

function DesafioContent() {
  const { pharmacyName } = useApp();
  const [data, setData] = useState<RankingResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ranking")
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json() as Promise<RankingResponse>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">
          Desafío de <span className="text-geneo">tu farmacia</span>
        </h1>
        <p className="text-muted text-sm">
          {data ? (
            <>
              Cada mes de <span className="font-semibold text-ink">{periodLabel(data.period)}</span>,
              la farmacia mejor rankeada se lleva el kit Geneo.
            </>
          ) : (
            "Todo el equipo suma. La farmacia mejor rankeada del mes gana el kit Geneo."
          )}
        </p>
      </header>

      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={SPRING}>
            <DesafioSkeleton />
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={SPRING}
            className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-3"
          >
            <AlertCircle size={28} className="text-soft" />
            <p className="text-ink font-bold text-sm">No pudimos cargar el desafío</p>
            <p className="text-muted text-sm">Revisá tu conexión e intentá de nuevo.</p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                setReloadKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-2 min-h-11 rounded-full border-2 border-line text-muted hover:border-geneo hover:text-geneo active:border-geneo active:text-geneo font-bold uppercase tracking-wide text-xs px-5 transition-colors"
            >
              <RotateCcw size={14} />
              Reintentar
            </button>
          </motion.div>
        )}

        {status === "ready" && data && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={SPRING}
            className="flex flex-col gap-6"
          >
            <TeamStanding pharmacies={data.pharmacies} myPharmacyName={pharmacyName} />

            <PrizeCard />

            <CtaCard />

            <Link
              href="/ranking"
              className="flex items-center justify-center gap-1.5 min-h-11 rounded-full text-geneo font-bold text-sm hover:underline"
            >
              Ver tabla completa de farmacias
              <ChevronRight size={16} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesafioSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="rounded-3xl bg-paper shadow-card px-6 py-8 flex flex-col gap-4">
        <span className="w-32 h-4 rounded-full bg-line/60 animate-pulse" />
        <span className="w-24 h-10 rounded-full bg-line/60 animate-pulse" />
        <span className="w-full h-4 rounded-full bg-line/60 animate-pulse" />
      </div>
      <div className="rounded-3xl bg-paper shadow-soft px-6 py-6 flex items-center gap-4">
        <span className="w-14 h-14 rounded-2xl bg-line/60 animate-pulse shrink-0" />
        <span className="flex-1 h-4 rounded-full bg-line/60 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Estado del equipo: posición de mi farmacia, su puntaje, la líder y la
 * brecha de puntos. La brecha se calcula contra dos referencias:
 *   - "de arriba"  → la farmacia justo en la posición anterior a la mía
 *                    (si soy 2ª, esa farmacia YA es la líder).
 *   - "1er puesto" → la líder del ranking, siempre. Solo se muestra aparte
 *                    cuando difiere de "la de arriba" (o sea, cuando no soy 2ª).
 * Si mi farmacia no aparece en el ranking (sin pharmacyName resuelto o sin
 * puntaje este mes), se muestra un estado motivacional de arranque.
 */
function TeamStanding({
  pharmacies,
  myPharmacyName,
}: {
  pharmacies: PharmacyRankRow[];
  myPharmacyName: string | null;
}) {
  const leader = pharmacies[0] ?? null;
  const mine = myPharmacyName ? pharmacies.find((p) => p.name === myPharmacyName) ?? null : null;

  if (!mine) {
    return (
      <Card variant="hero" className="px-6 py-8 flex flex-col gap-3">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 text-white">
          <Sparkles size={22} />
        </span>
        <p className="font-extrabold text-lg leading-tight">Tu farmacia todavía no sumó puntos este mes</p>
        <p className="text-white/85 text-sm leading-snug">
          En cuanto alguien del equipo complete una misión o responda la pregunta del día, aparecen acá
          — ¡y arranca la carrera por el kit Geneo!
        </p>
      </Card>
    );
  }

  const isLeader = mine.position === 1;
  const above = pharmacies.find((p) => p.position === mine.position - 1) ?? null;
  const gapToAbove = above ? Math.max(0, above.score - mine.score) : 0;
  const gapToLeader = leader ? Math.max(0, leader.score - mine.score) : 0;
  const aboveIsLeader = above?.position === 1;

  return (
    <Card variant="hero" className="px-6 py-8 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest">
            Tu farmacia
          </span>
          <p className="font-extrabold text-lg leading-tight truncate">{mine.name}</p>
        </div>
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 shrink-0">
          {isLeader ? <Trophy size={24} /> : <span className="font-extrabold text-xl">{mine.position}º</span>}
        </span>
      </div>

      <div className="flex items-end gap-1.5">
        <span className="font-extrabold text-4xl leading-none tabular-nums">
          {mine.score.toLocaleString("es-AR")}
        </span>
        <span className="text-white/80 text-sm font-semibold pb-1">pts</span>
      </div>

      {isLeader ? (
        <p className="flex items-start gap-2.5 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold leading-snug">
          <Trophy size={17} className="shrink-0 mt-0.5" />
          ¡Van ganando el kit de este mes! Sigan sumando para no dejarse alcanzar.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {above && (
            <p className="rounded-2xl bg-white/15 px-4 py-3 text-sm leading-snug">
              Faltan{" "}
              <strong className="font-extrabold">{gapToAbove.toLocaleString("es-AR")} pts</strong> para
              superar a <strong className="font-bold">{above.name}</strong> ({above.position}º puesto)
            </p>
          )}
          {leader && !aboveIsLeader && (
            <p className="rounded-2xl bg-white/15 px-4 py-3 text-sm leading-snug">
              Faltan{" "}
              <strong className="font-extrabold">{gapToLeader.toLocaleString("es-AR")} pts</strong> para
              el 1er puesto — hoy lo tiene <strong className="font-bold">{leader.name}</strong>
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function PrizeCard() {
  return (
    <Card variant="feature" className="flex items-center gap-4 px-5 py-4">
      <span className="relative w-16 h-16 rounded-2xl bg-surface overflow-hidden shrink-0">
        <Image
          src="/img/kit-merch.webp"
          alt="Kit de merchandising Geneo: bolsa, neceser y llavero"
          fill
          sizes="64px"
          className="object-contain"
        />
      </span>
      <div className="min-w-0 flex flex-col gap-1">
        <SectionHeader eyebrow="El premio" className="gap-0.5">
          Kit Geneo para todo el equipo
        </SectionHeader>
        <p className="text-muted text-xs leading-snug">
          Se lo lleva la farmacia mejor rankeada del mes: bolsa + 2 productos, para repartir en el
          equipo.
        </p>
      </div>
    </Card>
  );
}

function CtaCard() {
  return (
    <Card variant="quiet" className="flex items-start gap-4 px-5 py-4">
      <span className="flex items-center justify-center w-11 h-11 rounded-full bg-paper text-geneo shrink-0">
        <Gift size={20} />
      </span>
      <div className="min-w-0 flex-1 flex flex-col gap-2">
        <p className="text-ink font-bold text-sm leading-tight">¿Cómo sube el equipo?</p>
        <p className="text-muted text-sm leading-snug">
          El puntaje de la farmacia es el promedio de sus 3 mejores empleados del mes. Cada misión
          completada y cada pregunta del día respondida suman.
        </p>
        <Link
          href="/misiones"
          className="self-start inline-flex items-center gap-2 min-h-11 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-xs px-6 transition-colors"
        >
          Ir a misiones
          <ChevronRight size={14} />
        </Link>
      </div>
    </Card>
  );
}
