"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Award, CheckCircle2, Circle, Gift, LogOut, RotateCcw, User } from "lucide-react";
import AppShell from "@/components/AppShell";
import LevelsLadder from "@/components/LevelsLadder";
import InstallButton from "@/components/InstallButton";
import { ADVANCED_MISSIONS, CAMPAIGN_MISSIONS, MISSIONS } from "@/lib/missions";
import { getLevel } from "@/lib/levels";
import { claimLabel } from "@/lib/prizes";
import { useApp } from "@/lib/store";

// Revelado escalonado al entrar en viewport (Ley de Movimiento: spring, sin tween).
const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { type: "spring", stiffness: 260, damping: 28 },
} as const;

export default function Perfil() {
  return (
    <AppShell>
      <PerfilContent />
    </AppShell>
  );
}

function PerfilContent() {
  const { user, pharmacyName, progress, points, streak, redemptions, isSpecialist, logout, reset } =
    useApp();
  const level = getLevel(points);
  const completedCount = MISSIONS.filter((m) => progress[m.slug]).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Tarjeta de identidad */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="bg-paper rounded-3xl shadow-card p-6 flex flex-col items-center text-center gap-3"
      >
        <span className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-geneo to-geneo-dark text-white">
          <User size={34} />
        </span>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-ink font-extrabold text-xl tracking-tight">{user?.name}</h1>
          <p className="text-muted text-sm">{pharmacyName}</p>
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
          <div className="rounded-2xl bg-rosa-suave/60 px-4 py-3 flex flex-col gap-1">
            <p className="text-geneo font-extrabold text-xl leading-none">
              {streak} {streak === 1 ? "día" : "días"} 🔥
            </p>
            <p className="text-muted text-[11px] font-semibold uppercase tracking-wide">
              Racha actual
            </p>
          </div>
        </div>
      </motion.section>

      {/* Niveles de Especialista (Academia, etapa 2) */}
      <motion.section {...reveal} className="flex flex-col gap-3">
        <h2 className="text-ink font-bold text-lg tracking-tight">Tus niveles</h2>
        <LevelsLadder points={points} />
      </motion.section>

      {/* Historial de misiones */}
      <motion.section {...reveal} className="flex flex-col gap-3">
        <h2 className="text-ink font-bold text-lg tracking-tight">Historial de misiones</h2>
        <div className="bg-paper rounded-3xl shadow-soft divide-y divide-line">
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
        </div>
      </motion.section>

      {/* Tus premios */}
      <motion.section {...reveal} className="flex flex-col gap-3">
        <h2 className="text-ink font-bold text-lg tracking-tight">Tus premios</h2>
        {redemptions.length > 0 ? (
          <div className="bg-paper rounded-3xl shadow-soft divide-y divide-line">
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
          </div>
        ) : (
          <p className="text-muted text-sm bg-paper rounded-3xl shadow-soft px-5 py-4">
            Todavía no ganaste premios.{" "}
            <Link
              href="/recompensas"
              className="text-geneo font-bold underline underline-offset-2 inline-block py-3 -my-3"
            >
              Mirá el catálogo
            </Link>
            .
          </p>
        )}
      </motion.section>

      {/* Certificados */}
      <motion.section {...reveal} className="flex flex-col gap-3">
        <h2 className="text-ink font-bold text-lg tracking-tight">Certificados</h2>
        {isSpecialist ? (
          <Link
            href="/certificado"
            className="flex items-center gap-4 bg-paper rounded-3xl shadow-soft px-5 py-4 hover:shadow-card active:shadow-card transition-shadow"
          >
            <span className="flex items-center justify-center w-11 h-11 rounded-full bg-rosa-suave text-geneo shrink-0">
              <Award size={20} />
            </span>
            <span className="flex-1 flex flex-col gap-0.5">
              <span className="block text-ink font-bold text-sm">Especialista Geneo</span>
              <span className="block text-muted text-xs">Ver y descargar</span>
            </span>
          </Link>
        ) : (
          <p className="text-muted text-sm bg-paper rounded-3xl shadow-soft px-5 py-4">
            Completá las 6 misiones para desbloquear tu certificado de{" "}
            <strong className="text-geneo">Especialista Geneo</strong>.
          </p>
        )}
      </motion.section>

      {/* La app (instalar PWA) */}
      <motion.section {...reveal} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-ink font-bold text-lg tracking-tight">La app</h2>
          <p className="text-muted text-sm">
            Instalala en tu teléfono para tenerla a un toque, sin abrir el navegador.
          </p>
        </div>
        <InstallButton />
      </motion.section>

      {/* Sesión */}
      <motion.div {...reveal} className="flex flex-col items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            if (window.confirm("¿Cerrar sesión? Podés volver a entrar con tu email y contraseña.")) {
              logout();
            }
          }}
          className="w-full inline-flex items-center justify-center gap-2 min-h-11 rounded-full border-2 border-line text-muted hover:border-geneo hover:text-geneo active:border-geneo active:text-geneo font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("¿Reiniciar el demo? Se borra el progreso de este teléfono.")) {
              reset();
            }
          }}
          className="inline-flex items-center justify-center gap-2 min-h-11 text-soft hover:text-muted active:text-muted text-xs font-semibold uppercase tracking-wide transition-colors"
        >
          <RotateCcw size={14} />
          Reiniciar demo
        </button>
      </motion.div>
    </div>
  );
}
