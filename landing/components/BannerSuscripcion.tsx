"use client";

import { useState } from "react";
import { Percent, Package, Bell, XCircle, ArrowRight } from "lucide-react";
import ScrollSpinProduct from "@/components/ScrollSpinProduct";

const beneficios = [
  { icono: Percent, titulo: "15% OFF", subtitulo: "en todas tus compras" },
  { icono: Package, titulo: "Envío gratis", subtitulo: "siempre" },
  { icono: Bell, titulo: "Recordatorios", subtitulo: "personalizados" },
  { icono: XCircle, titulo: "Cancelá", subtitulo: "cuando quieras" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BannerSuscripcion() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError(true);
      return;
    }
    setError(false);
    setEnviado(true);
  };

  return (
    <section className="relative z-[70] bg-geneo py-16 sm:py-36 px-4 sm:px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid lg:grid-cols-2 items-center gap-10 lg:gap-14">

          {/* Pouch que gira con el scroll — flota sobre el bloque oscuro */}
          <ScrollSpinProduct className="w-full aspect-[4/3] sm:aspect-square lg:aspect-[4/5] max-w-xs sm:max-w-md mx-auto lg:max-w-none" />

          {/* Contenido */}
          <div>
            <h2 className="uppercase text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-[1.05] tracking-tight">
              Tu ritual, <span className="text-white/75">sin interrupciones</span>
            </h2>
            <p className="text-white/90 text-base mt-4 max-w-md">
              Suscribite y unite a la comunidad de mujeres que eligen cuidarse desde adentro.
            </p>

            {/* Beneficios — bento con hairlines */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {beneficios.map((b) => {
                const Icono = b.icono;
                return (
                  <div
                    key={b.titulo}
                    className="flex items-start gap-3 border border-white/10 rounded-2xl p-5 hover:bg-white/5 transition-colors duration-300"
                  >
                    <Icono className="text-white flex-shrink-0 mt-0.5" size={18} aria-hidden="true" />
                    <div>
                      <p className="text-white font-medium text-sm">{b.titulo}</p>
                      <p className="text-white/75 text-xs">{b.subtitulo}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form de suscripción */}
            {!enviado ? (
              <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-md">
                <label htmlFor="email-suscripcion" className="sr-only">
                  Tu dirección de email
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:bg-white sm:rounded-full sm:p-1.5">
                  <input
                    id="email-suscripcion"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(false);
                    }}
                    placeholder="Tu email"
                    aria-invalid={error}
                    aria-describedby={error ? "email-error" : undefined}
                    className="flex-1 w-full px-6 py-4 sm:py-3 text-sm text-ink placeholder:text-muted rounded-full bg-white sm:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-geneo sm:focus-visible:ring-offset-2 sm:focus-visible:ring-offset-white"
                  />
                  <button
                    type="submit"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white text-geneo font-medium px-7 py-4 sm:py-3 text-sm rounded-full hover:bg-white/90 transition-colors duration-300 flex-shrink-0 ring-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-geneo"
                  >
                    Suscribite
                    <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
                {error && (
                  <p id="email-error" role="alert" className="text-white text-xs mt-2 pl-1">
                    Ingresá un email válido (ejemplo: nombre@correo.com).
                  </p>
                )}
              </form>
            ) : (
              <div
                role="alert"
                aria-live="polite"
                className="mt-8 border border-white/20 text-white px-6 py-4 rounded-2xl max-w-md text-sm font-medium"
              >
                ¡Listo! Ya estás suscrita 🌸
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
