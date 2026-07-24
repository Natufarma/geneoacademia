"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Mail, MessageCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, SectionHeader } from "@/components/ui";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;
const reveal = { once: true, margin: "-10% 0px" } as const;

// Contacto de soporte: no hay backend de tickets, así que derivamos a canales
// directos. Reemplazar por los datos reales de Natufarma antes de publicar.
const SOPORTE_WHATSAPP = "5491100000000"; // TODO: reemplazar por el WhatsApp real de soporte (código de país + número, sin "+" ni espacios)
const SOPORTE_EMAIL = "soporte@natufarma.com.ar"; // TODO: reemplazar por el email real de soporte

const WHATSAPP_MENSAJE = "Hola, necesito ayuda con Misión Geneo";
const EMAIL_ASUNTO = "Ayuda con Misión Geneo";

type Faq = { pregunta: string; respuesta: string };

/**
 * Preguntas frecuentes: dudas reales de un empleado de farmacia usando la
 * app (puntos, racha, certificado, niveles, ranking, cuenta e instalación).
 * Las respuestas reflejan el funcionamiento real de la app (lib/missions.ts,
 * lib/daily.ts, lib/levels.ts, lib/ranking.ts), no texto genérico.
 */
const FAQS: Faq[] = [
  {
    pregunta: "¿Cómo sumo puntos?",
    respuesta:
      "Completando las misiones del viaje principal, avanzando en la Academia y respondiendo la pregunta del día. Cada una suma puntos apenas la completás, y esos puntos arman tu nivel de Especialista Geneo.",
  },
  {
    pregunta: "¿Para qué sirve la pregunta del día y la racha?",
    respuesta:
      "Todos los días hay una pregunta nueva que suma puntos si la respondés bien. La racha cuenta los días seguidos que participaste: si te salteás un día entero, vuelve a arrancar de cero. Es la forma más rápida de sumar puntos de forma constante.",
  },
  {
    pregunta: "¿Cómo obtengo el certificado?",
    respuesta:
      "Completando las 6 misiones principales del viaje. Ahí se desbloquea tu certificado digital de Especialista Geneo, que podés ver, descargar y compartir desde 'Mi certificado'.",
  },
  {
    pregunta: "¿Qué son los niveles?",
    respuesta:
      "Marcan tu progreso según los puntos que acumulaste: arrancás como Aprendiz Geneo, pasás a Asesora Geneo a los 500 puntos, y llegás a Especialista Geneo al completar todo el viaje. Los ves en 'Mi perfil'.",
  },
  {
    pregunta: "¿Cómo funcionan el ranking y el premio de mi farmacia?",
    respuesta:
      "El ranking es mensual: todos los puntajes resetean al empezar el mes. El puntaje de tu farmacia se calcula con el promedio de los 3 empleados más activos, así que cuantos más compañeros sumen puntos, mejor posicionada queda.",
  },
  {
    pregunta: "No me llegó el email de confirmación o para recuperar mi contraseña",
    respuesta:
      "Primero revisá la carpeta de spam o promociones. Si no aparece, pedí uno nuevo desde la pantalla de recuperar contraseña. Si después de un rato sigue sin llegar, escribinos por WhatsApp o email más abajo y te ayudamos a entrar.",
  },
  {
    pregunta: "¿Cómo cambio mi foto de perfil?",
    respuesta:
      "Entrá a 'Mi perfil' y tocá el ícono de cámara sobre tu foto. Podés sacar una nueva en el momento o elegir una de tu galería.",
  },
  {
    pregunta: "¿Cómo instalo la app en mi celular?",
    respuesta:
      "En Android o Chrome, tocá el botón 'Instalar app' que aparece en 'Mi perfil'. En iPhone con Safari no hay botón: tocá el ícono de Compartir y elegí 'Agregar a inicio'.",
  },
];

function FaqItem({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: Faq;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `ayuda-faq-panel-${index}`;
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between gap-3 min-h-11 py-4 text-left"
      >
        <span className="text-ink font-semibold text-sm leading-snug">{faq.pregunta}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={spring}
          className="shrink-0 text-soft"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <p className="text-muted text-sm leading-relaxed pb-4 pr-7">{faq.respuesta}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Pantalla de ayuda / soporte / FAQ. Sin backend de tickets: las dudas más
 * comunes se resuelven en el acordeón, y lo que no se resuelve ahí se deriva
 * a WhatsApp o email de soporte (constantes arriba, con placeholders TODO).
 */
export default function Ayuda() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const whatsappHref = `https://wa.me/${SOPORTE_WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`;
  const emailHref = `mailto:${SOPORTE_EMAIL}?subject=${encodeURIComponent(EMAIL_ASUNTO)}`;

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-ink font-extrabold text-2xl tracking-tight">
            ¿Necesitás <span className="text-geneo">ayuda</span>?
          </h1>
          <p className="text-muted text-sm">
            Respuestas rápidas a las dudas más comunes de la app y una vía directa para escribirnos.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="FAQ">Preguntas frecuentes</SectionHeader>
          <Card
            as={motion.div}
            variant="base"
            className="px-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={reveal}
            transition={spring}
          >
            {FAQS.map((faq, i) => (
              <FaqItem
                key={faq.pregunta}
                faq={faq}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
              />
            ))}
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader eyebrow="Contacto" subtitle="Te respondemos a la brevedad.">
            ¿Seguís con dudas?
          </SectionHeader>
          <Card
            as={motion.div}
            variant="feature"
            className="flex flex-col gap-3 p-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={reveal}
            transition={{ ...spring, delay: 0.07 }}
          >
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 transition-colors"
            >
              <MessageCircle size={18} />
              Escribinos por WhatsApp
            </a>
            <a
              href={emailHref}
              className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full border-2 border-geneo text-geneo hover:bg-rosa-suave/60 active:bg-rosa-suave/60 font-bold uppercase tracking-wide text-sm px-6 transition-colors"
            >
              <Mail size={18} />
              Escribinos por email
            </a>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
