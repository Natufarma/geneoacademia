import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";

/**
 * Política de privacidad. Server Component estático y PÚBLICO (sin gate de
 * sesión): se enlaza desde el checkbox de consentimiento del ALTA, o sea antes
 * de que exista sesión. Por eso NO se envuelve en <AppShell> (que redirige al
 * inicio a quien no está logueado): replica el marco visual de la app —
 * bg-surface + columna centrada — pero queda accesible sin login.
 */

const SOPORTE_EMAIL = "fabianapeculo@natufarma.com.ar";

export const metadata: Metadata = {
  title: "Política de privacidad · Misión Geneo",
  description:
    "Cómo tratamos tus datos personales en Misión Geneo: qué recolectamos, para qué y tus derechos bajo la Ley 25.326.",
};

export default function PrivacidadPage() {
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
            Política de <span className="text-geneo">privacidad</span>
          </h1>
          <p className="text-muted text-sm">
            Cómo cuidamos tus datos personales en Misión Geneo.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="Responsable">Quién trata tus datos</SectionHeader>
          <Card variant="base" className="px-5 py-4">
            <p className="text-muted text-sm leading-relaxed">
              Misión Geneo es una aplicación de capacitación y juego para el personal de las
              farmacias aliadas de Natufarma. El responsable del tratamiento de tus datos personales
              es Natufarma. Ante cualquier consulta sobre tu privacidad podés escribirnos a{" "}
              <a
                href={`mailto:${SOPORTE_EMAIL}`}
                className="text-geneo font-semibold underline underline-offset-2"
              >
                {SOPORTE_EMAIL}
              </a>
              .
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="Qué guardamos">Datos que recolectamos</SectionHeader>
          <Card variant="base" className="px-5 py-4 flex flex-col gap-3">
            <p className="text-muted text-sm leading-relaxed">
              Recolectamos únicamente los datos necesarios para que puedas usar la app y participar
              del programa:
            </p>
            <ul className="flex flex-col gap-2 text-sm text-ink leading-snug">
              <li className="flex gap-2">
                <span className="text-geneo font-bold">·</span>
                <span>
                  <strong className="font-semibold">Nombre y apellido</strong>: para identificarte
                  en tu perfil, en el ranking y en tu certificado.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-geneo font-bold">·</span>
                <span>
                  <strong className="font-semibold">Email</strong>: para crear tu cuenta, iniciar
                  sesión y poder recuperar tu contraseña.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-geneo font-bold">·</span>
                <span>
                  <strong className="font-semibold">Teléfono</strong> (opcional): solo si elegís
                  cargarlo, como dato de contacto.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-geneo font-bold">·</span>
                <span>
                  <strong className="font-semibold">Foto de perfil</strong> (opcional): solo si
                  elegís subirla. Se muestra únicamente en tu propio perfil y al administrador del
                  programa; nunca en el ranking ni en el certificado compartible.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-geneo font-bold">·</span>
                <span>
                  <strong className="font-semibold">Farmacia</strong> a la que pertenecés: para
                  sumar tu actividad al ranking de tu farmacia.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-geneo font-bold">·</span>
                <span>
                  <strong className="font-semibold">Progreso en las misiones</strong>: misiones
                  completadas, puntos, respuestas de la pregunta del día, racha, premios y
                  certificados obtenidos.
                </span>
              </li>
            </ul>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="Para qué">Cómo usamos tus datos</SectionHeader>
          <Card variant="base" className="px-5 py-4">
            <p className="text-muted text-sm leading-relaxed">
              Usamos tus datos con la única finalidad de brindar la capacitación y la gamificación
              del programa Misión Geneo: mostrarte tu avance, calcular tu puntaje y tu nivel,
              emitir tu certificado, ordenar el ranking de farmacias y entregarte los premios que
              ganes. No vendemos tus datos ni los usamos para publicidad de terceros.
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="Dónde">Dónde se guardan</SectionHeader>
          <Card variant="base" className="px-5 py-4">
            <p className="text-muted text-sm leading-relaxed">
              Tus datos se almacenan en la infraestructura de Supabase, con acceso restringido: cada
              persona ve y edita solamente sus propios datos, y solo el administrador del programa
              puede consultar el conjunto. La foto de perfil se guarda en un espacio privado y se
              muestra a través de enlaces temporales, nunca de una dirección pública permanente.
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="Ley 25.326">Tus derechos</SectionHeader>
          <Card variant="base" className="px-5 py-4 flex flex-col gap-3">
            <p className="text-muted text-sm leading-relaxed">
              Como titular de los datos, la Ley 25.326 de Protección de los Datos Personales de la
              República Argentina te garantiza los siguientes derechos:
            </p>
            <ul className="flex flex-col gap-2 text-sm text-ink leading-snug">
              <li className="flex gap-2">
                <span className="text-geneo font-bold">·</span>
                <span>
                  <strong className="font-semibold">Acceso</strong>: saber qué datos tuyos tenemos y
                  cómo los tratamos.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-geneo font-bold">·</span>
                <span>
                  <strong className="font-semibold">Rectificación y actualización</strong>: corregir
                  o poner al día tus datos si están mal o cambiaron.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-geneo font-bold">·</span>
                <span>
                  <strong className="font-semibold">Supresión</strong>: pedir que borremos tu cuenta
                  y tus datos.
                </span>
              </li>
            </ul>
            <p className="text-muted text-sm leading-relaxed">
              Podés ejercer el acceso, la rectificación y la actualización desde{" "}
              <span className="text-ink font-semibold">Mi cuenta</span> dentro de la app, y borrar tu
              cuenta desde la misma sección (zona &laquo;Eliminar cuenta&raquo;). También podés
              escribirnos a{" "}
              <a
                href={`mailto:${SOPORTE_EMAIL}`}
                className="text-geneo font-semibold underline underline-offset-2"
              >
                {SOPORTE_EMAIL}
              </a>{" "}
              para ejercer cualquiera de estos derechos.
            </p>
            <p className="text-soft text-xs leading-relaxed">
              La Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326,
              tiene la atribución de atender las denuncias y reclamos que se interpongan en relación
              con el incumplimiento de las normas sobre protección de datos personales.
            </p>
          </Card>
        </section>

        <p className="text-soft text-xs leading-relaxed text-center">
          Programa exclusivo para Farmacias Aliadas Geneo.
        </p>
      </main>
    </div>
  );
}
