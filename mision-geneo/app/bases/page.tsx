import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ScrollText } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";

/**
 * Bases y condiciones del programa Misión Geneo. Server Component estático y
 * PÚBLICO (igual que /privacidad): se enlaza desde el consentimiento del alta y
 * desde el perfil, así que NO va dentro de <AppShell> (que redirige a quien no
 * tiene sesión). Replica el marco visual de la app.
 *
 * ⚠️ El texto es un BORRADOR de trabajo. Debe pasar por el área legal del
 * cliente antes de publicarse.
 */

const SOPORTE_EMAIL = "fabianapeculo@natufarma.com.ar";

export const metadata: Metadata = {
  title: "Bases y condiciones · Misión Geneo",
  description:
    "Bases y condiciones del programa de capacitación Misión Geneo: participación, puntos, niveles, certificado, ranking y premios.",
};

export default function BasesPage() {
  return (
    <div className="min-h-dvh bg-surface">
      <main className="max-w-md mx-auto px-5 pt-6 pb-16 flex flex-col gap-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 min-h-11 -my-2 self-start text-muted hover:text-geneo active:text-geneo text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          Volver
        </Link>

        <header className="flex flex-col gap-1">
          <h1 className="text-ink font-extrabold text-2xl tracking-tight">
            Bases y <span className="text-geneo">condiciones</span>
          </h1>
          <p className="text-muted text-sm">Del programa de capacitación Misión Geneo.</p>
        </header>

        {/* Aviso de BORRADOR */}
        <Card variant="quiet" className="flex items-start gap-3 px-5 py-4">
          <ScrollText size={20} className="text-geneo shrink-0 mt-0.5" />
          <p className="text-ink text-sm leading-snug">
            <strong className="font-bold">Borrador para revisión legal.</strong> Este texto es una
            versión preliminar y debe ser revisado y aprobado por el área legal del cliente antes de
            su publicación definitiva.
          </p>
        </Card>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="1. El programa">Qué es Misión Geneo</SectionHeader>
          <Card variant="base" className="px-5 py-4">
            <p className="text-muted text-sm leading-relaxed">
              Misión Geneo es un programa de <strong>capacitación interna</strong> de Natufarma
              destinado a empleados y empleadas de las farmacias aliadas Geneo. Su objetivo es formar
              sobre la línea de productos Geneo mediante misiones, contenidos y una mecánica de juego
              con puntos y premios. No es un canal de venta ni una promoción dirigida al consumidor
              final.
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="2. Participación">Quiénes pueden participar</SectionHeader>
          <Card variant="base" className="px-5 py-4">
            <p className="text-muted text-sm leading-relaxed">
              Pueden participar las personas mayores de edad que se desempeñen en una farmacia aliada
              habilitada y se registren en la app asociándose a su farmacia. La participación es
              personal y voluntaria. Natufarma podrá dar de baja registros duplicados, falsos o que
              incumplan estas bases.
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="3. Cómo se juega">Puntos, niveles y certificado</SectionHeader>
          <Card variant="base" className="px-5 py-4 flex flex-col gap-2.5">
            <p className="text-muted text-sm leading-relaxed">
              Se suman puntos completando misiones, la pregunta del día y el contenido de la Academia.
              Los puntos definen el nivel (Aprendiz, Asesora y Especialista Geneo). Al completar las 6
              misiones principales se obtiene el certificado digital de Especialista Geneo.
            </p>
            <p className="text-muted text-sm leading-relaxed">
              Cada pregunta admite un intento. La racha de la pregunta del día se mantiene
              participando cada día y se corta al saltear un día.
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="4. Premios">Premios y su entrega</SectionHeader>
          <Card variant="base" className="px-5 py-4 flex flex-col gap-2.5">
            <p className="text-muted text-sm leading-relaxed">
              El programa contempla: el <strong>certificado</strong> de Especialista Geneo; un{" "}
              <strong>kit de merchandising</strong> al completar la Academia; y un{" "}
              <strong>premio mensual de farmacia</strong> (kit Geneo) para la farmacia mejor rankeada
              de cada mes.
            </p>
            <p className="text-muted text-sm leading-relaxed">
              Los premios físicos no son canjeables por dinero, no son transferibles y se entregan a
              través de la farmacia o del vendedor Geneo correspondiente. Natufarma podrá sustituir un
              premio por otro de igual o mayor valor ante faltantes de stock.
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="5. Ranking">El ranking mensual</SectionHeader>
          <Card variant="base" className="px-5 py-4">
            <p className="text-muted text-sm leading-relaxed">
              El ranking se calcula por mes calendario (hora de Argentina) y se reinicia el primer día
              de cada mes. El puntaje de cada farmacia es el promedio de sus tres empleados con más
              puntos del mes, para que una farmacia chica pueda competir de igual a igual con una más
              grande. Ante empates o inconvenientes técnicos, la organización definirá el resultado de
              buena fe.
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="6. Datos y cambios">Datos personales y modificaciones</SectionHeader>
          <Card variant="base" className="px-5 py-4">
            <p className="text-muted text-sm leading-relaxed">
              El tratamiento de datos personales se rige por la{" "}
              <Link href="/privacidad" className="text-geneo font-semibold underline underline-offset-2">
                Política de privacidad
              </Link>
              . Natufarma podrá modificar o discontinuar el programa y estas bases avisando por los
              medios de la app. El uso continuado implica la aceptación de la versión vigente.
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="7. Contacto">Consultas</SectionHeader>
          <Card variant="quiet" className="px-5 py-4">
            <p className="text-muted text-sm leading-relaxed">
              Por dudas sobre el programa o los premios, escribinos a{" "}
              <a
                href={`mailto:${SOPORTE_EMAIL}`}
                className="text-geneo font-semibold underline underline-offset-2 break-words"
              >
                {SOPORTE_EMAIL}
              </a>
              .
            </p>
          </Card>
        </section>
      </main>
    </div>
  );
}
