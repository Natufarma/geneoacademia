import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Check, Circle } from "lucide-react";
import { getEmployee } from "@/lib/admin-data";
import { Reveal } from "../../../_components/Reveal";
import { CertifiedBadge, StatCard, fmtDate } from "../../../_components/ui";

export const dynamic = "force-dynamic";

const GROUP_LABEL: Record<string, string> = {
  core: "Misión",
  academia: "Academia",
  campaña: "Campaña",
};

export default async function EmpleadoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const emp = await getEmployee(id);
  if (!emp) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/empleados"
          className="inline-flex items-center gap-1.5 min-h-11 -my-2 text-muted hover:text-geneo active:text-geneo text-sm font-semibold transition-colors self-start"
        >
          <ArrowLeft size={16} />
          Empleados
        </Link>

        <header className="flex flex-wrap items-center gap-4">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-geneo to-geneo-dark text-white shrink-0">
            <Award size={26} />
          </span>
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-ink font-extrabold text-2xl tracking-tight truncate">{emp.name}</h1>
            <p className="text-muted text-sm">
              {emp.pharmacyName} · Registrado el {fmtDate(emp.createdAt)}
            </p>
            <p className="text-muted text-sm truncate">
              {emp.email ?? "Sin email"}
              {emp.phone ? ` · ${emp.phone}` : ""}
            </p>
          </div>
          <div className="ml-auto">
            <CertifiedBadge certified={emp.certified} />
          </div>
        </header>
      </div>

      <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Puntos" value={emp.points} hint={emp.levelName} />
        <StatCard label="Misiones" value={`${emp.coreDone}/${emp.coreTotal}`} hint="Viaje core" />
        <StatCard
          label="Certificado"
          value={emp.certified ? "Sí" : "No"}
          hint={emp.certified ? fmtDate(emp.certifiedAt) : "Aún en curso"}
        />
        <StatCard
          label="Academia"
          value={emp.advancedDone + emp.campaignsDone}
          hint="Avanzadas + campañas"
        />
        <StatCard
          label="Pregunta del día"
          value={emp.dailyDays}
          hint="Días de participación"
        />
      </Reveal>

      <Reveal className="flex flex-col gap-3">
        <h2 className="text-ink font-bold text-lg tracking-tight">Progreso por misión</h2>
        <div className="bg-paper rounded-3xl shadow-soft divide-y divide-line overflow-hidden">
          {emp.missions.map((m) => (
            <div key={m.slug} className="flex items-center gap-3 px-5 py-3.5">
              {m.done ? (
                <Check size={18} strokeWidth={3} className="text-geneo shrink-0" />
              ) : (
                <Circle size={18} className="text-line shrink-0" />
              )}
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span
                  className={`text-sm font-semibold leading-tight truncate ${m.done ? "text-ink" : "text-soft"}`}
                >
                  {m.title}
                </span>
                <span className="text-soft text-xs">
                  {GROUP_LABEL[m.group]}
                  {m.done && m.completedAt ? ` · ${fmtDate(m.completedAt)}` : ""}
                </span>
              </span>
              <span className={`text-sm font-extrabold shrink-0 ${m.done ? "text-geneo" : "text-soft"}`}>
                {m.done ? `+${m.score}` : `+${m.pointsTotal}`}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="flex flex-col gap-3">
        <h2 className="text-ink font-bold text-lg tracking-tight">Premios canjeados</h2>
        {emp.redemptions.length === 0 ? (
          <p className="text-muted text-sm bg-paper rounded-3xl shadow-soft px-5 py-4">
            Todavía no canjeó premios.
          </p>
        ) : (
          <div className="bg-paper rounded-3xl shadow-soft divide-y divide-line overflow-hidden">
            {emp.redemptions.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-ink font-semibold text-sm leading-tight">{r.rewardName}</span>
                  <span className="text-soft text-xs capitalize">
                    {r.status} · {fmtDate(r.createdAt)}
                  </span>
                </span>
                <span className="text-geneo font-extrabold text-sm shrink-0">−{r.points}</span>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
