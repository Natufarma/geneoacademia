import type { ReactNode } from "react";

/** Formatea una fecha ISO a es-AR (o "—" si es null). */
export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="bg-paper rounded-3xl shadow-soft p-5 flex flex-col gap-1">
      <p className="text-soft text-[11px] font-bold uppercase tracking-widest">{label}</p>
      <p className="text-ink font-extrabold text-3xl leading-none">{value}</p>
      {hint && <p className="text-muted text-xs">{hint}</p>}
    </div>
  );
}

export function CertifiedBadge({ certified }: { certified: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        certified ? "bg-rosa-suave text-geneo" : "bg-line/60 text-soft"
      }`}
    >
      {certified ? "Certificada" : "En curso"}
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-1">
      <p className="text-ink font-bold text-sm">{title}</p>
      {hint && <p className="text-muted text-sm">{hint}</p>}
    </div>
  );
}
