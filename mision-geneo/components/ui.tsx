import type { ElementType, ReactNode } from "react";

/**
 * Primitivas de UI del lado empleado. Único lugar donde vive la JERARQUÍA
 * visual de la app: en vez de recopiar `bg-paper rounded-3xl shadow-…` a mano en
 * cada pantalla, todas hablan el mismo idioma de peso visual.
 *
 * Cuatro niveles de superficie, de menor a mayor peso:
 *   quiet   → info secundaria que debe RETROCEDER (sin sombra, fondo rosado)
 *   base    → tarjeta de contenido estándar
 *   feature → la tarjeta PRINCIPAL de una vista
 *   hero    → el "pico" de la pantalla (gradiente de marca). Uno por vista.
 */

export type CardVariant = "quiet" | "base" | "feature" | "hero";

const CARD_VARIANT: Record<CardVariant, string> = {
  quiet: "bg-rosa-suave/50 text-ink",
  base: "bg-paper shadow-soft text-ink",
  feature: "bg-paper shadow-card text-ink",
  hero: "bg-gradient-to-br from-geneo to-geneo-dark text-white shadow-card",
};

export function Card({
  as: Tag = "div",
  variant = "base",
  interactive = false,
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  variant?: CardVariant;
  /** Agrega elevación al pasar el dedo/mouse. Para tarjetas que son enlaces. */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const hover = interactive ? "transition-shadow hover:shadow-card active:shadow-card" : "";
  return (
    <Tag className={`rounded-3xl ${CARD_VARIANT[variant]} ${hover} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Encabezado de sección con estructura consistente: eyebrow opcional (etiqueta
 * en versalitas), título (admite `<span className="text-geneo">` para el
 * acento) y bajada opcional. Reemplaza los `<h2>` sueltos repetidos por pantalla.
 */
export function SectionHeader({
  eyebrow,
  children,
  subtitle,
  className = "",
}: {
  eyebrow?: string;
  children: ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      {eyebrow && (
        <span className="text-geneo text-[11px] font-bold uppercase tracking-widest">{eyebrow}</span>
      )}
      <h2 className="text-ink font-bold text-lg tracking-tight leading-tight">{children}</h2>
      {subtitle && <p className="text-muted text-sm leading-snug">{subtitle}</p>}
    </div>
  );
}

export type BadgeTone = "solid" | "soft" | "muted";

const BADGE_TONE: Record<BadgeTone, string> = {
  solid: "bg-geneo text-white",
  soft: "bg-rosa-suave text-geneo",
  muted: "bg-line/60 text-soft",
};

/** Pastilla en versalitas para estados y etiquetas ("Vos", "Nuevo", "Tu farmacia"). */
export function Badge({
  tone = "soft",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${BADGE_TONE[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
