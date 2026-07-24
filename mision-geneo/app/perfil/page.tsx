"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Award, CheckCircle2, Circle, Gift, LogOut } from "lucide-react";
import AppShell from "@/components/AppShell";
import LevelsLadder from "@/components/LevelsLadder";
import InstallButton from "@/components/InstallButton";
import AvatarUploader from "@/components/AvatarUploader";
import Achievements from "@/components/Achievements";
import { ADVANCED_MISSIONS, CAMPAIGN_MISSIONS, MISSIONS } from "@/lib/missions";
import { getLevel } from "@/lib/levels";
import { claimLabel } from "@/lib/prizes";
import { useApp } from "@/lib/store";
import { Card, SectionHeader } from "@/components/ui";

// Scroll reveal por sección: el trigger de viewport vive en CADA sección (no en
// un contenedor), así cada bloque se desvela al hacer scroll hasta él —
// coreografía real, no una entrada de mount disfrazada. Spring, y:30. El `delay`
// escalonado (acotado) ordena las secciones sobre el pliegue en el primer
// pintado, sin penalizar con lag a las de más abajo cuando se scrollea.
const reveal = (i = 0) =>
  ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { type: "spring", stiffness: 260, damping: 28, delay: Math.min(i, 3) * 0.06 },
  }) as const;

export default function Perfil() {
  return (
    <AppShell>
      <PerfilContent />
    </AppShell>
  );
}

function PerfilContent() {
  const { user, pharmacyName, progress, points, streak, redemptions, isSpecialist, logout } =
    useApp();
  const level = getLevel(points);
  const completedCount = MISSIONS.filter((m) => progress[m.slug]).length;
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Cerrar el diálogo de logout con Escape (además del backdrop y "Cancelar").
  useEffect(() => {
    if (!confirmLogout) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmLogout(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmLogout]);

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Tarjeta de identidad — la principal de esta vista */}
        <Card
          as={motion.section}
          {...reveal(0)}
          variant="feature"
          className="p-6 flex flex-col items-center text-center gap-3"
        >
          <AvatarUploader initialPath={user?.avatarPath ?? null} name={user?.name ?? ""} />
          <div className="flex flex-col gap-0.5">
            <h1 className="text-ink font-extrabold text-xl tracking-tight">{user?.name}</h1>
            <p className="text-muted text-sm">{pharmacyName ?? "tu farmacia"}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-geneo text-geneo font-bold text-xs uppercase tracking-wide px-4 py-1.5">
            {isSpecialist && <Award size={14} />}
            {level.name} · Nivel {level.n}
          </span>

          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="rounded-2xl bg-rosa-suave/60 px-4 py-3 flex flex-col gap-1">
              <p className="text-geneo font-extrabold text-xl leading-none">{points}</p>
              <p className="text-muted text-[11px] font-semibold uppercase tracking-wide">
                Mis puntos
              </p>
            </div>
            <div className="rounded-2xl bg-rosa-suave/60 px-4 py-3 flex flex-col gap-1">
              <p className="text-geneo font-extrabold text-xl leading-none">
                {completedCount}/{MISSIONS.length}
              </p>
              <p className="text-muted text-[11px] font-semibold uppercase tracking-wide">
                Misiones
              </p>
            </div>
            {/* La racha ocupa el ancho completo: 3 tiles impares en 2 columnas
                dejaban un hueco huérfano. */}
            <div className="col-span-2 rounded-2xl bg-rosa-suave/60 px-4 py-3 flex flex-col gap-1">
              <p className="text-geneo font-extrabold text-xl leading-none">
                {streak} {streak === 1 ? "día" : "días"} 🔥
              </p>
              <p className="text-muted text-[11px] font-semibold uppercase tracking-wide">
                Racha actual
              </p>
            </div>
          </div>
        </Card>

        {/* Niveles de Especialista (Academia, etapa 2) */}
        <motion.section {...reveal(1)} className="flex flex-col gap-3">
          <SectionHeader>Tus niveles</SectionHeader>
          <LevelsLadder points={points} />
        </motion.section>

        {/* Logros / insignias */}
        <motion.section {...reveal(2)} className="flex flex-col gap-3">
          <Achievements />
        </motion.section>

        {/* Historial de misiones */}
        <motion.section {...reveal(3)} className="flex flex-col gap-3">
          <SectionHeader>Historial de misiones</SectionHeader>
          <Card variant="base" className="divide-y divide-line">
            {MISSIONS.map((m) => {
              const done = progress[m.slug];
              return (
                <div key={m.slug} className="flex items-center gap-3 px-5 py-3.5">
                  {done ? (
                    <CheckCircle2 size={19} className="text-geneo shrink-0" />
                  ) : (
                    <Circle size={19} className="text-line shrink-0" />
                  )}
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className={`block text-sm font-semibold leading-tight ${done ? "text-ink" : "text-soft"}`}>
                      Misión {m.order} · {m.short}
                    </span>
                    {done && (
                      <span className="block text-soft text-xs">
                        {new Date(done.completedAt).toLocaleDateString("es-AR")}
                      </span>
                    )}
                  </span>
                  <span className={`text-sm font-extrabold shrink-0 ${done ? "text-geneo" : "text-soft"}`}>
                    {done ? `+${done.score}` : `+${m.pointsTotal}`}
                  </span>
                </div>
              );
            })}
            {ADVANCED_MISSIONS.map((m) => {
              const done = progress[m.slug];
              return (
                <div key={m.slug} className="flex items-center gap-3 px-5 py-3.5">
                  {done ? (
                    <CheckCircle2 size={19} className="text-geneo shrink-0" />
                  ) : (
                    <Circle size={19} className="text-line shrink-0" />
                  )}
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className={`block text-sm font-semibold leading-tight ${done ? "text-ink" : "text-soft"}`}>
                      Academia · {m.short}
                    </span>
                    {done && (
                      <span className="block text-soft text-xs">
                        {new Date(done.completedAt).toLocaleDateString("es-AR")}
                      </span>
                    )}
                  </span>
                  <span className={`text-sm font-extrabold shrink-0 ${done ? "text-geneo" : "text-soft"}`}>
                    {done ? `+${done.score}` : `+${m.pointsTotal}`}
                  </span>
                </div>
              );
            })}
            {CAMPAIGN_MISSIONS.map((m) => {
              const done = progress[m.slug];
              return (
                <div key={m.slug} className="flex items-center gap-3 px-5 py-3.5">
                  {done ? (
                    <CheckCircle2 size={19} className="text-geneo shrink-0" />
                  ) : (
                    <Circle size={19} className="text-line shrink-0" />
                  )}
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className={`block text-sm font-semibold leading-tight ${done ? "text-ink" : "text-soft"}`}>
                      Campaña · {m.season}
                    </span>
                    {done && (
                      <span className="block text-soft text-xs">
                        {new Date(done.completedAt).toLocaleDateString("es-AR")}
                      </span>
                    )}
                  </span>
                  <span className={`text-sm font-extrabold shrink-0 ${done ? "text-geneo" : "text-soft"}`}>
                    {done ? `+${done.score}` : `+${m.pointsTotal}`}
                  </span>
                </div>
              );
            })}
          </Card>
        </motion.section>

        {/* Tus premios */}
        <motion.section {...reveal(4)} className="flex flex-col gap-3">
          <SectionHeader>Tus premios</SectionHeader>
          {redemptions.length > 0 ? (
            <Card variant="base" className="divide-y divide-line">
              {redemptions.map((r) => (
                <div key={r.rewardId} className="flex items-center gap-3 px-5 py-3.5">
                  <Gift size={19} className="text-geneo shrink-0" />
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="block text-sm font-semibold text-ink leading-tight">
                      {claimLabel(r.rewardId)}
                    </span>
                    <span className="block text-soft text-xs">
                      {new Date(r.redeemedAt).toLocaleDateString("es-AR")} · Pendiente de entrega en
                      tu farmacia
                    </span>
                  </span>
                </div>
              ))}
            </Card>
          ) : (
            <Card variant="quiet" className="text-muted text-sm px-5 py-4">
              Todavía no ganaste premios.{" "}
              <Link
                href="/recompensas"
                className="text-geneo font-bold underline underline-offset-2 inline-block py-3 -my-3"
              >
                Mirá el catálogo
              </Link>
              .
            </Card>
          )}
        </motion.section>

        {/* Certificados */}
        <motion.section {...reveal(5)} className="flex flex-col gap-3">
          <SectionHeader>Certificados</SectionHeader>
          {isSpecialist ? (
            <Card
              as={Link}
              href="/certificado"
              variant="base"
              interactive
              className="flex items-center gap-4 px-5 py-4"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-rosa-suave text-geneo shrink-0">
                <Award size={20} />
              </span>
              <span className="flex-1 flex flex-col gap-0.5">
                <span className="block text-ink font-bold text-sm">Especialista Geneo</span>
                <span className="block text-muted text-xs">Ver y descargar</span>
              </span>
            </Card>
          ) : (
            <Card variant="quiet" className="text-muted text-sm px-5 py-4">
              Completá las 6 misiones para desbloquear tu certificado de{" "}
              <strong className="text-geneo">Especialista Geneo</strong>.
            </Card>
          )}
        </motion.section>

        {/* La app (instalar PWA) */}
        <motion.section {...reveal(6)} className="flex flex-col gap-3">
          <SectionHeader subtitle="Instalala en tu teléfono para tenerla a un toque, sin abrir el navegador.">
            La app
          </SectionHeader>
          <Card variant="base" className="p-5">
            <InstallButton />
          </Card>
        </motion.section>

        {/* Sesión */}
        <motion.div {...reveal(7)} className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="w-full inline-flex items-center justify-center gap-2 min-h-11 rounded-full border-2 border-line text-muted hover:border-geneo hover:text-geneo active:border-geneo active:text-geneo font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </motion.div>
      </div>

      {/* Confirmación de cierre de sesión — modal de marca en vez del confirm()
          del navegador (sin estilo, sin física). */}
      <AnimatePresence>
        {confirmLogout && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            onClick={() => setConfirmLogout(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              className="w-full max-w-xs bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-5 text-center"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-rosa-suave text-geneo">
                  <LogOut size={22} />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 id="logout-title" className="text-ink font-extrabold text-lg tracking-tight">
                    ¿Cerrar sesión?
                  </h2>
                  <p className="text-muted text-sm leading-snug">
                    Vas a volver a la pantalla de ingreso. Podés entrar de nuevo con tu email y
                    contraseña.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmLogout(false);
                    logout();
                  }}
                  className="inline-flex items-center justify-center min-h-11 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
                >
                  Cerrar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLogout(false)}
                  className="inline-flex items-center justify-center min-h-11 rounded-full text-muted hover:text-geneo active:text-geneo font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
