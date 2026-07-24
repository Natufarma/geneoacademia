"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Copy, Download, Lock, ArrowRight, Share2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { TOTAL_POINTS } from "@/lib/missions";

export default function Certificado() {
  return (
    <AppShell>
      <CertificadoContent />
    </AppShell>
  );
}

function CertificadoContent() {
  const { user, pharmacyName, isSpecialist, points } = useApp();

  if (!isSpecialist) {
    return (
      <div className="flex flex-col items-center text-center gap-5 pt-16">
        <span className="flex items-center justify-center w-20 h-20 rounded-full bg-rosa-suave text-geneo">
          <Lock size={32} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-ink font-extrabold text-2xl tracking-tight">
            Tu certificado te espera
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-xs">
            Completá las 6 misiones para obtener tu certificado digital de{" "}
            <strong className="text-geneo">Especialista Geneo</strong>.
          </p>
        </div>
        <Link
          href="/misiones"
          className="inline-flex items-center gap-2 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 py-3.5 transition-colors"
        >
          Seguir mi viaje
          <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  const date = new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="no-print flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Tu certificado</h1>
        <p className="text-muted text-sm">
          Descargalo y compartilo con orgullo. #PielSaludable
        </p>
      </header>

      {/* Certificado imprimible */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="print-area bg-paper rounded-3xl shadow-card overflow-hidden"
      >
        <div className="h-2.5 bg-gradient-to-r from-geneo to-geneo-dark" aria-hidden="true" />
        <div className="border-x border-b border-line rounded-b-3xl px-7 py-9 flex flex-col items-center text-center gap-5">
          <Image src="/img/logo-fuxia.webp" alt="Geneo" width={120} height={40} />

          <div className="flex flex-col gap-1">
            <p className="text-soft text-[11px] font-bold uppercase tracking-[0.25em]">
              Certificado
            </p>
            <p className="text-geneo font-extrabold text-xl uppercase tracking-wide">
              Especialista Geneo
            </p>
          </div>

          <div className="w-14 h-px bg-line" aria-hidden="true" />

          <div className="flex flex-col gap-1.5">
            <p className="text-muted text-sm">Se otorga a</p>
            <p className="text-ink font-extrabold text-3xl tracking-tight leading-tight">
              {user?.name}
            </p>
            <p className="text-muted text-base">{pharmacyName ?? "tu farmacia"}</p>
          </div>

          <p className="text-muted text-sm leading-relaxed max-w-xs">
            Por completar con éxito todas las misiones del programa de formación{" "}
            <strong className="text-ink">Misión Geneo</strong> y convertirse en
            Especialista Beauty Wellness.
          </p>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-geneo font-extrabold text-lg leading-none">
                {points} pts
              </span>
              <span className="text-soft text-[11px] font-semibold uppercase tracking-wide">
                de {TOTAL_POINTS}
              </span>
            </div>
            <div className="w-px h-9 bg-line" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <span className="text-ink font-bold leading-none">{date}</span>
              <span className="text-soft text-[11px] font-semibold uppercase tracking-wide">
                Farmacias Aliadas
              </span>
            </div>
          </div>

          <p className="text-soft text-xs">geneo · by Natufarma</p>
        </div>
      </motion.div>

      <div className="no-print flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-5 py-4 transition-colors"
          >
            <Download size={18} />
            Descargar
          </button>
          <ShareButton />
        </div>
        <p className="text-soft text-xs text-center">
          Descargar abre el diálogo de impresión: elegí “Guardar como PDF”.
        </p>
        <CopyShareText />
      </div>
    </div>
  );
}

/* ───────────────────────── Compartir #PielSaludable ───────────────────────── */

const SHARE_TEXT =
  "¡Soy Especialista Geneo! 💗 Cada recomendación transforma la vida de alguien. #PielSaludable";

/**
 * Compartir con Web Share API; si el navegador no la soporta (desktop viejo),
 * cae a WhatsApp. La detección ocurre recién en el click: el markup es idéntico
 * en SSR y cliente, así no hay mismatch de hidratación.
 */
function ShareButton() {
  const share = async () => {
    const url = window.location.origin;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text: SHARE_TEXT, url });
      } catch {
        // Compartir cancelado por la usuaria: no es un error.
      }
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${url}`)}`,
        "_blank",
        "noopener"
      );
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-geneo text-geneo hover:bg-rosa-suave/60 active:bg-rosa-suave/60 font-bold uppercase tracking-wide text-sm px-5 py-4 transition-colors"
    >
      <Share2 size={18} />
      Compartir
    </button>
  );
}

function CopyShareText() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${window.location.origin}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles: queda el botón de compartir.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center justify-center gap-1.5 min-h-11 text-soft hover:text-muted active:text-muted text-xs font-semibold uppercase tracking-wide transition-colors"
    >
      {copied ? (
        <>
          <Check size={14} strokeWidth={3} className="text-geneo" />
          <span className="text-geneo">¡Copiado!</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          Copiar texto para compartir
        </>
      )}
    </button>
  );
}
