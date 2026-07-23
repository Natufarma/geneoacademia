"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock, Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";
import SorteoBanner from "@/components/SorteoBanner";
import { PRODUCTS, getProduct } from "@/lib/products";
import { parseClaim } from "@/lib/prizes";
import { useApp } from "@/lib/store";

export default function Recompensas() {
  return (
    <AppShell>
      <RecompensasContent />
    </AppShell>
  );
}

function RecompensasContent() {
  const { pharmacyName, isSpecialist, academiaDone, redemptions, claimPrize } = useApp();
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<{ prizeId: string; message: string } | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Revelado escalonado al entrar en viewport (Ley de Movimiento: spring, sin tween).
  // Respeta prefers-reduced-motion: sin desplazamiento ni física de resorte.
  const reveal = reduceMotion
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true } }
    : {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: { type: "spring" as const, stiffness: 260, damping: 28 },
      };
  const tap = reduceMotion
    ? {}
    : { whileTap: { scale: 0.97 }, transition: { type: "spring" as const, stiffness: 400, damping: 30 } };

  const viajeClaim = redemptions.find((r) => parseClaim(r.rewardId)?.prizeId === "viaje-producto");
  const kitClaimed = redemptions.some((r) => parseClaim(r.rewardId)?.prizeId === "academia-kit");
  const viajeProduct = viajeClaim
    ? getProduct(parseClaim(viajeClaim.rewardId)?.productSlug ?? "")
    : undefined;

  const onClaim = async (prizeId: "viaje-producto" | "academia-kit", productSlug?: string) => {
    setClaimError(null);
    setClaiming(prizeId);
    const res = await claimPrize(prizeId, productSlug);
    setClaiming(null);
    if (!res.ok) setClaimError({ prizeId, message: res.error });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Recompensas</h1>
        <p className="text-muted text-sm">Los premios que ganás completando misiones.</p>
      </header>

      {/* Premio del viaje: producto a elección */}
      <motion.section {...reveal} className="flex flex-col gap-3">
        <h2 className="text-ink font-bold text-lg tracking-tight">Premio del viaje</h2>

        {viajeClaim ? (
          <div className="flex items-center gap-4 bg-paper rounded-3xl shadow-soft px-5 py-4">
            <span className="relative w-14 h-14 rounded-2xl bg-rosa-suave/60 overflow-hidden shrink-0">
              {viajeProduct && (
                <Image
                  src={viajeProduct.img}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              )}
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <p className="text-soft text-[10px] font-bold uppercase tracking-widest">
                Producto a elección
              </p>
              <p className="text-ink font-bold text-sm leading-tight">
                {viajeProduct?.name ?? "Producto Geneo"}
              </p>
              <p className="text-geneo text-xs font-semibold">
                Pendiente de entrega en {pharmacyName ?? "tu farmacia"}
              </p>
            </div>
            <Check size={20} className="text-geneo shrink-0" strokeWidth={3} />
          </div>
        ) : isSpecialist ? (
          <div className="flex flex-col gap-3 bg-paper rounded-3xl shadow-card px-5 py-4">
            <p className="text-muted text-sm">
              Completaste el viaje. Elegí el producto de la línea Geneo que querés recibir.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRODUCTS.filter((p) => p.available !== false).map((product) => {
                const selected = chosen === product.slug;
                return (
                  <motion.button
                    key={product.slug}
                    type="button"
                    onClick={() => setChosen(product.slug)}
                    {...tap}
                    className={`flex flex-row sm:flex-col items-center gap-3 sm:gap-2 rounded-2xl border-2 px-3 py-3 sm:py-4 min-h-11 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      selected ? "border-geneo bg-rosa-suave/60" : "border-line bg-paper"
                    }`}
                  >
                    <span className="relative w-16 h-16 shrink-0">
                      <Image src={product.img} alt="" fill sizes="64px" className="object-contain" />
                    </span>
                    <span className="text-ink font-bold text-xs text-left sm:text-center leading-tight">
                      {product.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <motion.button
              type="button"
              onClick={() => chosen && onClaim("viaje-producto", chosen)}
              disabled={!chosen || claiming === "viaje-producto"}
              {...tap}
              className="rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft disabled:hover:bg-line text-white font-bold uppercase tracking-wide text-xs px-6 min-h-11 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              {claiming === "viaje-producto" ? "Reclamando…" : "Elegir este producto"}
            </motion.button>
            {claimError?.prizeId === "viaje-producto" && (
              <p role="alert" className="text-geneo text-sm font-semibold text-center">
                {claimError.message}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 bg-paper rounded-3xl shadow-soft px-5 py-4">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-line/40 text-soft shrink-0">
              <Lock size={22} />
            </span>
            <p className="text-muted text-sm leading-snug">
              Completá el viaje principal para elegir tu producto.
            </p>
          </div>
        )}
      </motion.section>

      {/* Kit de Academia */}
      <motion.section
        {...reveal}
        transition={{ ...reveal.transition, delay: 0.06 }}
        className="flex flex-col gap-3"
      >
        <h2 className="text-ink font-bold text-lg tracking-tight">Kit de Academia</h2>

        {kitClaimed ? (
          <div className="flex items-center gap-4 bg-paper rounded-3xl shadow-soft px-5 py-4">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rosa-suave/60 text-geneo shrink-0">
              <Sparkles size={24} />
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <p className="text-ink font-bold text-sm leading-tight">
                Kit de merchandising Geneo
              </p>
              <p className="text-soft text-xs">Llavero + bolsa + neceser</p>
              <p className="text-geneo text-xs font-semibold">Pendiente de entrega</p>
            </div>
            <Check size={20} className="text-geneo shrink-0" strokeWidth={3} />
          </div>
        ) : academiaDone ? (
          <div className="flex flex-col gap-3 bg-paper rounded-3xl shadow-card px-5 py-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rosa-suave text-geneo shrink-0">
                <Sparkles size={24} />
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <p className="text-ink font-bold text-sm leading-tight">
                  Kit de merchandising Geneo
                </p>
                <p className="text-soft text-xs">Llavero + bolsa + neceser</p>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={() => onClaim("academia-kit")}
              disabled={claiming === "academia-kit"}
              {...tap}
              className="rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft disabled:hover:bg-line text-white font-bold uppercase tracking-wide text-xs px-6 min-h-11 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              {claiming === "academia-kit" ? "Reclamando…" : "Reclamar kit"}
            </motion.button>
            {claimError?.prizeId === "academia-kit" && (
              <p role="alert" className="text-geneo text-sm font-semibold text-center">
                {claimError.message}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 bg-paper rounded-3xl shadow-soft px-5 py-4">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-line/40 text-soft shrink-0">
              <Lock size={22} />
            </span>
            <p className="text-muted text-sm leading-snug">
              Completá las dos misiones de Academia para tu kit.
            </p>
          </div>
        )}
      </motion.section>

      <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.12 }}>
        <SorteoBanner />
      </motion.div>
    </div>
  );
}
