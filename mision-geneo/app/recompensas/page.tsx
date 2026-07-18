"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Coffee, CupSoda, Package, Sparkles, Star, type LucideIcon } from "lucide-react";
import AppShell from "@/components/AppShell";
import SorteoBanner from "@/components/SorteoBanner";
import { REWARDS, getReward, type Reward } from "@/lib/rewards";
import { useApp } from "@/lib/store";

/** Íconos por premio (no hay fotos del merchandising: cards con glifo de marca). */
const REWARD_ICONS: Record<string, LucideIcon> = {
  neceser: Sparkles,
  taza: Coffee,
  shaker: CupSoda,
};

export default function Recompensas() {
  return (
    <AppShell>
      <RecompensasContent />
    </AppShell>
  );
}

function RecompensasContent() {
  const { pharmacyName, points, balance, redemptions, isSpecialist, redeem } = useApp();
  const hasPrizes = isSpecialist || redemptions.length > 0;

  const onRedeem = (reward: Reward) => {
    if (window.confirm(`¿Canjear ${reward.name} por ${reward.points} pts?`)) {
      redeem(reward.id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Recompensas</h1>
        <p className="text-muted text-sm">Canjeá tus puntos por premios increíbles.</p>
      </header>

      {/* Saldo */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="rounded-3xl bg-gradient-to-br from-geneo to-geneo-dark text-white shadow-card px-6 py-5 flex items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <p className="font-extrabold text-3xl leading-none">{balance} pts</p>
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">
            Saldo canjeable
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <p className="flex items-center justify-end gap-1.5 text-white/90 text-sm font-bold">
            <Star size={15} className="fill-white/90" />
            {points} pts ganados
          </p>
          <p className="text-white/70 text-xs leading-snug max-w-44">
            Canjear no baja tu nivel: solo descuenta del saldo.
          </p>
        </div>
      </motion.section>

      {/* Premios obtenidos */}
      {hasPrizes && (
        <section className="flex flex-col gap-3">
          <h2 className="text-ink font-bold text-lg tracking-tight">Tus premios</h2>
          <div className="flex flex-col gap-3">
            {isSpecialist && (
              <div className="flex items-center gap-4 bg-paper rounded-3xl shadow-soft px-5 py-4">
                <span className="relative w-14 h-14 rounded-2xl bg-rosa-suave/60 overflow-hidden shrink-0">
                  <Image src="/img/prod-45.webp" alt="" fill className="object-contain p-1" />
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className="text-soft text-[10px] font-bold uppercase tracking-widest">
                    Premio inmediato
                  </p>
                  <p className="text-ink font-bold text-sm leading-tight">
                    Pack de muestras Geneo 45+
                  </p>
                  <p className="text-geneo text-xs font-semibold">
                    Envío sin cargo · En camino a {pharmacyName}
                  </p>
                </div>
              </div>
            )}
            {redemptions.map((r) => {
              const reward = getReward(r.rewardId);
              if (!reward) return null;
              const Icon = REWARD_ICONS[reward.id] ?? Package;
              return (
                <div
                  key={r.rewardId}
                  className="flex items-center gap-4 bg-paper rounded-3xl shadow-soft px-5 py-4"
                >
                  <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rosa-suave/60 text-geneo shrink-0">
                    <Icon size={24} />
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-ink font-bold text-sm leading-tight">{reward.name}</p>
                    <p className="text-soft text-xs">
                      Canjeado el {new Date(r.redeemedAt).toLocaleDateString("es-AR")} ·{" "}
                      {reward.points} pts
                    </p>
                    <p className="text-geneo text-xs font-semibold">
                      Pendiente de entrega en tu farmacia
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Catálogo */}
      <section className="flex flex-col gap-3">
        <h2 className="text-ink font-bold text-lg tracking-tight">
          Premios <span className="text-geneo">disponibles</span>
        </h2>
        <div className="flex flex-col gap-3">
          {REWARDS.map((reward, i) => {
            const Icon = REWARD_ICONS[reward.id] ?? Package;
            const redeemed = redemptions.some((r) => r.rewardId === reward.id);
            const affordable = balance >= reward.points;
            const missing = reward.points - balance;
            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28, delay: i * 0.06 }}
                className="flex items-center gap-4 bg-paper rounded-3xl shadow-card px-5 py-4"
              >
                <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rosa-suave text-geneo shrink-0">
                  <Icon size={24} />
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <p className="text-ink font-bold text-sm leading-tight">{reward.name}</p>
                  <p className="text-geneo font-extrabold text-sm">{reward.points} pts</p>
                  {!redeemed && !affordable && (
                    <p className="text-soft text-xs">Te faltan {missing} pts</p>
                  )}
                </div>
                {redeemed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rosa-suave text-geneo font-bold text-xs uppercase tracking-wide px-4 py-2 shrink-0">
                    <Check size={14} strokeWidth={3} />
                    Canjeado
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onRedeem(reward)}
                    disabled={!affordable}
                    className="rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-xs px-5 min-h-11 transition-colors shrink-0"
                  >
                    Canjear
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      <SorteoBanner />

      {!isSpecialist && (
        <p className="text-muted text-sm text-center">
          ¿Querés más puntos?{" "}
          <Link
            href="/misiones"
            className="text-geneo font-bold underline underline-offset-2 inline-block py-3 -my-3"
          >
            Completá tus misiones
          </Link>
        </p>
      )}
    </div>
  );
}
