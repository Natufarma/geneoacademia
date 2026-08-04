"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import AppShell from "@/components/AppShell";
import SorteoBanner from "@/components/SorteoBanner";
import { PRODUCTS, getProduct } from "@/lib/products";
import { parseClaim } from "@/lib/prizes";
import { useApp } from "@/lib/store";
import { Card, SectionHeader } from "@/components/ui";

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
  const kitClaim = redemptions.find((r) => parseClaim(r.rewardId)?.prizeId === "academia-kit");
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
        <SectionHeader>Premio del viaje</SectionHeader>

        {viajeClaim ? (
          <Card variant="quiet" className="flex items-center gap-4 px-5 py-4">
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
              {viajeClaim.status === "delivered" ? (
                <p className="text-geneo text-xs font-semibold">Tu producto fue entregado ✓</p>
              ) : (
                <p className="text-geneo text-xs font-semibold">
                  Pendiente de entrega en {pharmacyName ?? "tu farmacia"}
                </p>
              )}
            </div>
            <Check size={20} className="text-geneo shrink-0" strokeWidth={3} />
          </Card>
        ) : isSpecialist ? (
          <Card variant="feature" className="flex flex-col gap-3 px-5 py-4">
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
                    aria-pressed={selected}
                    {...tap}
                    className={`relative flex flex-row sm:flex-col items-center gap-3 sm:gap-2 rounded-2xl border-2 px-3 py-3 sm:py-4 min-h-11 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      selected ? "border-geneo ring-2 ring-geneo bg-rosa-suave/60" : "border-line bg-paper"
                    }`}
                  >
                    {selected && (
                      <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-geneo text-white shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
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
              aria-disabled={!chosen || claiming === "viaje-producto"}
              aria-label={!chosen ? "Elegí un producto de la lista para poder confirmarlo" : undefined}
              {...tap}
              className="rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft disabled:hover:bg-line text-white font-bold uppercase tracking-wide text-xs px-6 min-h-11 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              {claiming === "viaje-producto"
                ? "Reclamando…"
                : chosen
                  ? "Elegir este producto"
                  : "Elegí un producto arriba"}
            </motion.button>
            {claimError?.prizeId === "viaje-producto" && (
              <p role="alert" className="text-geneo text-sm font-semibold text-center">
                {claimError.message}
              </p>
            )}
          </Card>
        ) : (
          <Card variant="base" className="flex items-center gap-4 px-5 py-4 opacity-60">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-line/40 text-soft shrink-0">
              <Lock size={22} />
            </span>
            <p className="text-muted text-sm leading-snug">
              Completá el viaje principal para elegir tu producto.
            </p>
          </Card>
        )}
      </motion.section>

      {/* Kit de Academia */}
      <motion.section
        {...reveal}
        transition={{ ...reveal.transition, delay: 0.06 }}
        className="flex flex-col gap-3"
      >
        <SectionHeader>Kit de Academia</SectionHeader>

        {kitClaim ? (
          <Card variant="quiet" className="flex items-center gap-4 px-5 py-4">
            <span className="relative w-14 h-14 shrink-0">
              <Image src="/img/kit-merch.webp" alt="" fill sizes="56px" className="object-contain" />
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <p className="text-ink font-bold text-sm leading-tight">
                Kit de merchandising Geneo
              </p>
              <p className="text-soft text-xs">Llavero + bolsa + neceser</p>
              {kitClaim.status === "delivered" ? (
                <p className="text-geneo text-xs font-semibold">Tu kit fue entregado ✓</p>
              ) : (
                <p className="text-geneo text-xs font-semibold">Pendiente de entrega</p>
              )}
            </div>
            <Check size={20} className="text-geneo shrink-0" strokeWidth={3} />
          </Card>
        ) : academiaDone ? (
          <Card variant="base" className="flex flex-col gap-3 px-5 py-4">
            <span className="relative block w-full h-44 rounded-2xl bg-surface overflow-hidden">
              <Image
                src="/img/kit-merch.webp"
                alt="Kit de merchandising Geneo: bolsa, neceser y llavero"
                fill
                sizes="(max-width: 480px) 100vw, 448px"
                className="object-contain"
              />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-ink font-bold text-sm leading-tight">
                Kit de merchandising Geneo
              </p>
              <p className="text-soft text-xs">Llavero + bolsa + neceser</p>
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
          </Card>
        ) : (
          <Card variant="base" className="flex items-center gap-4 px-5 py-4 opacity-60">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-line/40 text-soft shrink-0">
              <Lock size={22} />
            </span>
            <p className="text-muted text-sm leading-snug">
              Completá las dos misiones de Academia para tu kit.
            </p>
          </Card>
        )}
      </motion.section>

      <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.12 }}>
        <SorteoBanner />
      </motion.div>
    </div>
  );
}
