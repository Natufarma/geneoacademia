"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, ChevronRight, Award, BookOpen, Gift, GraduationCap, Sparkles, Search } from "lucide-react";
import AppShell from "@/components/AppShell";
import DailyQuestion from "@/components/DailyQuestion";
import ProgressRing from "@/components/ProgressRing";
import SorteoBanner from "@/components/SorteoBanner";
import { ADVANCED_MISSIONS, CAMPAIGN_MISSIONS, MISSIONS, TOTAL_POINTS } from "@/lib/missions";
import { getLevel, getNextLevel } from "@/lib/levels";
import { useApp } from "@/lib/store";
import { Badge, Card, SectionHeader, type CardVariant } from "@/components/ui";

export default function Misiones() {
  return (
    <AppShell>
      <MisionesContent />
    </AppShell>
  );
}

function MisionesContent() {
  const { user, pharmacyName, progress, points, isSpecialist } = useApp();
  const level = getLevel(points);
  const next = getNextLevel(points);
  const firstName = user?.name.split(" ")[0] ?? "";

  // La primera misión no completada es la "disponible"; las siguientes, bloqueadas.
  const firstPendingIndex = MISSIONS.findIndex((m) => !progress[m.slug]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <p className="text-ink font-bold text-xl tracking-tight">Hola, {firstName} 👋</p>
          <p className="text-muted text-sm">{pharmacyName ?? "tu farmacia"}</p>
        </div>
        <Image src="/img/logo-fuxia.webp" alt="Geneo" width={86} height={28} priority />
      </header>

      {/* Progreso — tarjeta principal de la home (nivel feature) */}
      <Card as="section" variant="feature">
        <div className="p-5 flex items-center gap-5">
          <ProgressRing value={points} max={TOTAL_POINTS}>
            <span className="text-geneo font-extrabold text-xl leading-none">{points}</span>
            <span className="text-muted text-[10px] font-semibold uppercase tracking-wide">
              puntos
            </span>
          </ProgressRing>
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-soft text-[11px] font-bold uppercase tracking-widest">Tu progreso</p>
            <p className="text-ink font-bold text-base leading-tight">
              Nivel {level.n} · {level.name}
            </p>
            {next ? (
              <p className="text-muted text-sm">
                Siguiente nivel: <strong className="text-geneo">{next.min} pts</strong>
              </p>
            ) : (
              <p className="text-geneo text-sm font-semibold">¡Nivel máximo alcanzado!</p>
            )}
          </div>
        </div>
        <Link
          href="/recompensas"
          className="flex items-center gap-2.5 border-t border-line px-5 py-3.5 text-sm font-bold text-geneo hover:bg-rosa-suave/40 active:bg-rosa-suave/40 rounded-b-3xl transition-colors"
        >
          <Gift size={17} />
          <span className="flex-1">Mirá los premios</span>
          <span className="text-muted font-semibold">{points} pts</span>
          <ChevronRight size={17} />
        </Link>
      </Card>

      {/* Pregunta del día con racha */}
      <DailyQuestion />

      {/* Consulta de mostrador: recomendar al instante frente al cliente */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <Card
          as={Link}
          href="/mostrador"
          variant="base"
          interactive
          className="flex items-center gap-4 px-5 py-4"
        >
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-rosa-suave text-geneo shrink-0">
            <Search size={20} />
          </span>
          <span className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="block text-ink font-bold text-base leading-tight">
              Consulta de mostrador
            </span>
            <span className="block text-muted text-sm leading-snug">
              Recomendá al instante lo que busca tu cliente.
            </span>
          </span>
          <ChevronRight size={20} className="text-geneo shrink-0" />
        </Card>
      </motion.div>

      <SorteoBanner compact />

      {/* Banner de certificado al completar todo */}
      {isSpecialist && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <Card
            as={Link}
            href="/certificado"
            variant="hero"
            className="flex items-center gap-4 px-5 py-4"
          >
            <span className="flex items-center justify-center w-11 h-11 rounded-full bg-white/15 shrink-0">
              <Award size={22} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-bold text-base leading-tight">
                ¡Sos Especialista Geneo!
              </span>
              <span className="block text-white/85 text-sm">Ver tu certificado</span>
            </span>
            <ChevronRight size={20} className="shrink-0" />
          </Card>
        </motion.div>
      )}

      {/* Viaje de misiones */}
      <section className="flex flex-col gap-3">
        <SectionHeader>
          Tu viaje de Especialista <span className="text-geneo">en 6 misiones</span>
        </SectionHeader>

        {MISSIONS.map((m, i) => {
          const done = Boolean(progress[m.slug]);
          const available = !done && i === firstPendingIndex;
          const locked = !done && !available;
          const variant: CardVariant = done ? "quiet" : available ? "feature" : "base";

          const card = (
            <Card
              variant={variant}
              className={`flex items-center gap-4 px-4 py-4 transition-colors ${locked ? "opacity-60" : ""}`}
            >
              <span
                className={`flex items-center justify-center w-11 h-11 rounded-full font-extrabold shrink-0 ${
                  done
                    ? "bg-geneo text-white"
                    : available
                      ? "bg-rosa-suave text-geneo"
                      : "bg-line text-soft"
                }`}
              >
                {done ? <Check size={20} strokeWidth={3} /> : locked ? <Lock size={17} /> : m.order}
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-soft">
                  Misión {m.order} · {m.short}
                </span>
                <span className={`block font-bold leading-tight ${done ? "text-geneo" : "text-ink"}`}>
                  {m.title}
                </span>
                <span className="block text-muted text-sm leading-snug">{m.description}</span>
              </span>
              <span className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-sm font-extrabold ${done ? "text-geneo" : "text-soft"}`}>
                  +{m.pointsTotal}
                </span>
                {available && <ChevronRight size={18} className="text-geneo" />}
              </span>
            </Card>
          );

          return (
            <motion.div
              key={m.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { type: "spring", stiffness: 260, damping: 28, delay: i * 0.06 },
              }}
              whileHover={available ? { y: -2 } : undefined}
              whileTap={available ? { y: -2 } : undefined}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              {locked ? (
                card
              ) : (
                <Link
                  href={`/mision/${m.slug}`}
                  aria-label={`${done ? "Repasar" : "Empezar"} misión ${m.order}: ${m.title}`}
                >
                  {card}
                </Link>
              )}
            </motion.div>
          );
        })}
      </section>

      {/* Campañas de temporada — Academia (etapa 2): contenido rotativo nuevo */}
      <section className="flex flex-col gap-3">
        <SectionHeader subtitle="Contenido nuevo cada temporada. Sumá puntos extra sin esperar.">
          Campañas <span className="text-geneo">de temporada</span>
        </SectionHeader>

        {CAMPAIGN_MISSIONS.map((m, i) => {
          const done = Boolean(progress[m.slug]);

          return (
            <motion.div
              key={m.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { type: "spring", stiffness: 260, damping: 28, delay: i * 0.06 },
              }}
              whileHover={{ y: -2 }}
              whileTap={{ y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <Link
                href={`/mision/${m.slug}`}
                aria-label={`${done ? "Repasar" : "Empezar"} campaña: ${m.title}`}
              >
                <Card
                  as="span"
                  variant={done ? "quiet" : "base"}
                  interactive={!done}
                  className="flex items-center gap-4 px-4 py-4"
                >
                  <span
                    className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${
                      done ? "bg-geneo text-white" : "bg-rosa-suave text-geneo"
                    }`}
                  >
                    {done ? <Check size={20} strokeWidth={3} /> : <Sparkles size={20} />}
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-geneo">
                        Campaña · {m.season}
                      </span>
                      {!done && <Badge tone="solid">Nuevo</Badge>}
                    </span>
                    <span className={`block font-bold leading-tight ${done ? "text-geneo" : "text-ink"}`}>
                      {m.title}
                    </span>
                    <span className="block text-muted text-sm leading-snug">{m.description}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-sm font-extrabold ${done ? "text-geneo" : "text-soft"}`}>
                      +{m.pointsTotal}
                    </span>
                    <ChevronRight size={18} className="text-geneo" />
                  </span>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </section>

      {/* Academia Geneo — misiones avanzadas (etapa 2 de la propuesta) */}
      <section className="flex flex-col gap-3">
        <SectionHeader subtitle="Contenido avanzado para ir más allá del certificado.">
          Academia Geneo <span className="text-geneo">· Seguí aprendiendo</span>
        </SectionHeader>

        {/* Modo práctica: repaso sin presión de los 9 activos */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          whileHover={{ y: -2 }}
          whileTap={{ y: -2 }}
        >
          <Link href="/practica" aria-label="Abrir el modo práctica">
            <Card as="span" variant="base" interactive className="flex items-center gap-4 px-4 py-4">
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-rosa-suave text-geneo shrink-0">
                <Sparkles size={20} />
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-geneo">
                  Academia · Practicá sin presión
                </span>
                <span className="block font-bold leading-tight text-ink">Modo práctica</span>
                <span className="block text-muted text-sm leading-snug">
                  Flashcards y quiz de los 9 activos. Acá no se pierde nada.
                </span>
              </span>
              <ChevronRight size={18} className="text-geneo shrink-0" />
            </Card>
          </Link>
        </motion.div>

        {/* Guía de estudio: siempre accesible (estudiar → probar) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 28,
              delay: MISSIONS.length * 0.06,
            },
          }}
          whileHover={{ y: -2 }}
          whileTap={{ y: -2 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <Link href="/academia/activos" aria-label="Abrir la guía de activos">
            <Card as="span" variant="base" interactive className="flex items-center gap-4 px-4 py-4">
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-rosa-suave text-geneo shrink-0">
                <BookOpen size={20} />
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-geneo">
                  Academia · Estudiá primero
                </span>
                <span className="block font-bold leading-tight text-ink">Guía de activos</span>
                <span className="block text-muted text-sm leading-snug">
                  Las fotos y la ciencia de cada activo, para repasar antes de la prueba.
                </span>
              </span>
              <ChevronRight size={18} className="text-geneo shrink-0" />
            </Card>
          </Link>
        </motion.div>

        {ADVANCED_MISSIONS.map((m, i) => {
          const done = Boolean(progress[m.slug]);
          const available = !done && isSpecialist;
          const locked = !done && !available;

          const variant: CardVariant = done ? "quiet" : "base";

          const card = (
            <Card
              variant={variant}
              className={`flex items-center gap-4 px-4 py-4 transition-colors ${locked ? "opacity-60" : ""}`}
            >
              <span
                className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${
                  done
                    ? "bg-geneo text-white"
                    : available
                      ? "bg-rosa-suave text-geneo"
                      : "bg-line text-soft"
                }`}
              >
                {done ? (
                  <Check size={20} strokeWidth={3} />
                ) : locked ? (
                  <Lock size={17} />
                ) : (
                  <GraduationCap size={20} />
                )}
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-geneo">
                  Academia · Avanzada
                </span>
                <span className={`block font-bold leading-tight ${done ? "text-geneo" : "text-ink"}`}>
                  {m.title}
                </span>
                <span className="block text-muted text-sm leading-snug">
                  {locked ? "Completá las 6 misiones para desbloquearla." : m.description}
                </span>
              </span>
              <span className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-sm font-extrabold ${done ? "text-geneo" : "text-soft"}`}>
                  +{m.pointsTotal}
                </span>
                {available && <ChevronRight size={18} className="text-geneo" />}
              </span>
            </Card>
          );

          return (
            <motion.div
              key={m.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28, delay: (MISSIONS.length + 1 + i) * 0.06 }}
            >
              {locked ? (
                card
              ) : (
                <Link
                  href={`/mision/${m.slug}`}
                  aria-label={`${done ? "Repasar" : "Empezar"} misión avanzada: ${m.title}`}
                >
                  {card}
                </Link>
              )}
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
