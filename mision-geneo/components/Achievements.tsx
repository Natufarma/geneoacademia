"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Lock, Share2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { MISSIONS } from "@/lib/missions";
import { getLevel } from "@/lib/levels";
import { BADGES, evaluateBadges, type Badge, type BadgeInput } from "@/lib/badges";
import { generateProfileCard } from "@/lib/profile-card";
import { CorrectBurst } from "@/components/CorrectCelebration";
import { Card, SectionHeader } from "@/components/ui";

// Logros ya festejados en ESTE dispositivo (para no repetir el festejo).
const SEEN_KEY = "geneo-logros-vistos-v1";

/**
 * Sección "Logros" del perfil: medallas derivadas del estado (ver lib/badges).
 * Lee el ranking del mes una vez para las medallas de competencia, y festeja
 * los logros recién desbloqueados con el estallido de marca.
 */
export default function Achievements() {
  const { ready, user, points, progress, isSpecialist, academiaDone, streak, daily } = useApp();
  const [rankingPosition, setRankingPosition] = useState<number | null>(null);
  const [newlyEarned, setNewlyEarned] = useState<Badge[]>([]);

  const completedMissions = MISSIONS.filter((m) => progress[m.slug]).length;
  const correctDailies = Object.values(daily).filter((d) => d.correct).length;

  // Cerrar el festejo con Escape (consistente con el modal de logout del perfil).
  useEffect(() => {
    if (newlyEarned.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNewlyEarned([]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [newlyEarned.length]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const detect = (rankingPos: number | null) => {
      const input: BadgeInput = {
        completedMissions,
        points,
        isSpecialist,
        academiaDone,
        streak,
        correctDailies,
        rankingPosition: rankingPos,
      };
      const earnedIds = BADGES.filter((b) => b.earned(input)).map((b) => b.id);
      let seen: string[] = [];
      try {
        seen = JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "[]");
      } catch {
        seen = [];
      }
      const fresh = earnedIds.filter((id) => !seen.includes(id));
      if (fresh.length > 0) setNewlyEarned(BADGES.filter((b) => fresh.includes(b.id)));
      try {
        window.localStorage.setItem(SEEN_KEY, JSON.stringify(earnedIds));
      } catch {
        // sin localStorage: el festejo simplemente puede repetirse otra vez
      }
    };

    fetch("/api/ranking")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("ranking"))))
      .then((data: { employees?: { position: number; isCurrentUser: boolean }[] }) => {
        if (cancelled) return;
        const me = data.employees?.find((e) => e.isCurrentUser) ?? null;
        const pos = me ? me.position : null;
        setRankingPosition(pos);
        detect(pos);
      })
      .catch(() => {
        if (!cancelled) detect(null);
      });

    return () => {
      cancelled = true;
    };
    // Snapshot de los valores del store al montar: no queremos re-consultar el
    // ranking ni re-festejar en cada cambio de puntos mientras la pantalla vive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const results = useMemo(
    () =>
      evaluateBadges({
        completedMissions,
        points,
        isSpecialist,
        academiaDone,
        streak,
        correctDailies,
        rankingPosition,
      }),
    [completedMissions, points, isSpecialist, academiaDone, streak, correctDailies, rankingPosition],
  );

  const earnedCount = results.filter((r) => r.earned).length;
  const level = getLevel(points);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(false);

  const onShare = async () => {
    setSharing(true);
    setShareError(false);
    try {
      const blob = await generateProfileCard({
        name: user?.name ?? "",
        levelName: level.name,
        levelN: level.n,
        points,
        earned: results.filter((r) => r.earned).map((r) => r.badge),
        earnedCount,
        totalBadges: BADGES.length,
      });
      if (!blob) throw new Error("no-blob");
      const file = new File([blob], "mis-logros-geneo.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Mis logros en Misión Geneo",
          text: "¡Mirá cómo voy en Misión Geneo! 🎓✨",
        });
      } else {
        // Fallback (desktop sin compartir archivos): descargar la imagen.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mis-logros-geneo.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // El usuario canceló el diálogo de compartir: no es un error real.
      if ((err as Error).name !== "AbortError") setShareError(true);
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <SectionHeader subtitle={`${earnedCount} de ${BADGES.length} desbloqueados`}>Logros</SectionHeader>
      <Card variant="base" className="divide-y divide-line">
        {results.map(({ badge, earned }) => (
          <div key={badge.id} className="flex items-center gap-3.5 px-5 py-3">
            <span className={`text-3xl leading-none shrink-0 ${earned ? "" : "grayscale opacity-40"}`}>
              {badge.emoji}
            </span>
            <span className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className={`text-sm font-bold leading-tight ${earned ? "text-ink" : "text-soft"}`}>
                {badge.name}
              </span>
              <span className="text-soft text-xs leading-snug">{badge.hint}</span>
            </span>
            {earned ? (
              <Check size={18} strokeWidth={3} className="text-geneo shrink-0" />
            ) : (
              <Lock size={16} className="text-soft shrink-0" />
            )}
          </div>
        ))}
      </Card>

      <button
        type="button"
        onClick={onShare}
        disabled={sharing}
        className="w-full inline-flex items-center justify-center gap-2 min-h-11 rounded-full border-2 border-geneo text-geneo hover:bg-rosa-suave/40 active:bg-rosa-suave/40 disabled:opacity-60 font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
      >
        {sharing ? <Loader2 size={17} className="animate-spin" /> : <Share2 size={17} />}
        {sharing ? "Generando…" : "Compartir mis logros"}
      </button>
      {shareError && (
        <p className="text-geneo text-xs font-semibold text-center">
          No pudimos generar la tarjeta. Probá de nuevo.
        </p>
      )}

      {/* Festejo de logro recién desbloqueado. Va por PORTAL a document.body:
          esta sección vive dentro de un motion.section con transform+opacity
          (reveal), y un `fixed` ahí adentro quedaría mal posicionado e invisible
          hasta scrollear. */}
      {ready &&
        createPortal(
          <AnimatePresence>
            {newlyEarned.length > 0 && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="logro-title"
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                onClick={() => setNewlyEarned([])}
              >
                <motion.div
                  className="w-full max-w-xs bg-paper rounded-3xl shadow-card p-6 flex flex-col items-center text-center gap-4"
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-geneo text-[11px] font-bold uppercase tracking-widest">
                    {newlyEarned.length === 1 ? "¡Nuevo logro!" : "¡Nuevos logros!"}
                  </p>
                  <span className="relative flex flex-wrap items-center justify-center gap-2 py-2">
                    {newlyEarned.map((b) => (
                      <motion.span
                        key={b.id}
                        className={`${newlyEarned.length > 3 ? "text-4xl" : "text-5xl"} leading-none`}
                        initial={{ scale: 0, rotate: -8 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 16 }}
                      >
                        {b.emoji}
                      </motion.span>
                    ))}
                    <CorrectBurst face="" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h2 id="logro-title" className="text-ink font-extrabold text-lg tracking-tight">
                      {newlyEarned.length > 3
                        ? `${newlyEarned.length} logros nuevos`
                        : newlyEarned.map((b) => b.name).join(" · ")}
                    </h2>
                    <p className="text-muted text-sm leading-snug">
                      {newlyEarned.length === 1 ? "Lo desbloqueaste." : "Los desbloqueaste."} Ya suman a
                      tu colección.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewlyEarned([])}
                    className="w-full inline-flex items-center justify-center rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
                  >
                    ¡Genial!
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
