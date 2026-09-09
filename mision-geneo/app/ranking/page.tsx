"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowDown, ArrowUp, ChevronRight, Info, RotateCcw, Store, Trophy, Users } from "lucide-react";
import AppShell from "@/components/AppShell";
import PeriodNav from "@/components/PeriodNav";
import { useApp } from "@/lib/store";
import { periodLabel } from "@/lib/ranking";
import { Badge, Card } from "@/components/ui";

/**
 * Ranking nacional de empleados y farmacias, alimentado por /api/ranking.
 * Período = mes calendario (resetea todos los meses); el nivel de
 * Especialista, el certificado y el saldo de canjes NO dependen de esto.
 *
 * Se puede retroceder de mes: el ranking se reinicia el día 1, así que sin
 * navegación el primero de cada mes la pantalla aparecería vacía y el
 * empleado no tendría forma de ver quién ganó el mes que acaba de cerrar.
 */

type EmployeeRankRow = {
  position: number;
  displayName: string;
  points: number;
  isCurrentUser: boolean;
};

type PharmacyRankRow = {
  position: number;
  name: string;
  city: string | null;
  score: number;
  activeCount: number;
};

type RankingResponse = {
  period: string;
  /** Meses navegables, del más reciente al más viejo. */
  periods: string[];
  employees: EmployeeRankRow[];
  pharmacies: PharmacyRankRow[];
};

type Tab = "empleados" | "farmacias";

const MEDAL: Record<number, string> = {
  2: "bg-plata",
  3: "bg-bronce",
};

/**
 * Marca de posición unificada, con una sola forma para todos los puestos:
 *   1º → trofeo sobre oro (el campeón, el único "pico")
 *   2º/3º → número sobre plata/bronce (el podio)
 *   4º+ → número en gris neutro que RETROCEDE (antes era rosa y chocaba con la marca)
 */
function RankMark({ position }: { position: number }) {
  if (position === 1) {
    return (
      <span className="flex items-center justify-center w-11 h-11 rounded-full bg-oro text-white shrink-0">
        <Trophy size={19} />
      </span>
    );
  }
  const podium = MEDAL[position];
  return (
    <span
      className={`flex items-center justify-center w-11 h-11 rounded-full font-extrabold text-sm shrink-0 ${
        podium ? `${podium} text-white` : "bg-line/60 text-muted"
      }`}
    >
      {position}º
    </span>
  );
}

export default function Ranking() {
  return (
    <AppShell>
      <RankingContent />
    </AppShell>
  );
}

function RankingContent() {
  const { pharmacyName } = useApp();
  const [tab, setTab] = useState<Tab>("empleados");
  const [data, setData] = useState<RankingResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [reloadKey, setReloadKey] = useState(0);
  // Mes que se está mirando. `null` = todavía no se eligió ninguno: la API
  // responde el mes en curso y de ahí sale el valor inicial.
  const [period, setPeriod] = useState<string | null>(null);
  // Movimiento de puesto desde la última visita (comparado contra localStorage).
  const [movement, setMovement] = useState<{ delta: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(period ? `/api/ranking?periodo=${period}` : "/api/ranking")
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json() as Promise<RankingResponse>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setStatus("ready");

        // El movimiento de puesto SOLO tiene sentido en el mes en curso, que es
        // el primero de la lista. Si se guardara mirando un mes cerrado, la
        // posición histórica pisaría la actual en localStorage y en la próxima
        // visita se mostraría un "subiste N puestos" falso.
        const esMesEnCurso = json.period === json.periods[0];
        setMovement(null);
        const me = esMesEnCurso ? json.employees.find((e) => e.isCurrentUser) : undefined;
        if (me) {
          const KEY = "geneo-rank-pos";
          let prev: { period: string; position: number } | null = null;
          try {
            prev = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
          } catch {
            prev = null;
          }
          if (prev && prev.period === json.period && prev.position !== me.position) {
            // delta > 0 = subió (menor número de posición = mejor puesto).
            setMovement({ delta: prev.position - me.position });
          }
          try {
            window.localStorage.setItem(
              KEY,
              JSON.stringify({ period: json.period, position: me.position }),
            );
          } catch {
            // sin localStorage: simplemente no mostramos el movimiento
          }
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, period]);

  const esMesEnCurso = !data || data.period === data.periods[0];

  /** El esqueleto se muestra desde el handler, no desde el efecto: setear
      estado dentro del efecto dispara `react-hooks/set-state-in-effect`, y es
      la misma convención que usa el botón "Reintentar" de más abajo. */
  function cambiarPeriodo(next: string) {
    setStatus("loading");
    setPeriod(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-ink font-extrabold text-2xl tracking-tight">
            Ranking <span className="text-geneo">mensual</span>
          </h1>
          <p className="text-muted text-sm">
            {!data ? (
              "¡Tu farmacia puede ser la número 1!"
            ) : data.periods.length > 1 ? (
              // El mes lo dice el navegador de abajo: acá solo la regla.
              esMesEnCurso ? (
                "El ranking se reinicia el 1 de cada mes."
              ) : (
                "Mes cerrado: así terminó el ranking."
              )
            ) : (
              // Sin navegador, el mes tiene que decirse acá o no se dice en ningún lado.
              <>
                Período de{" "}
                <span className="font-semibold text-ink">{periodLabel(data.period)}</span> · resetea
                cada mes
              </>
            )}
          </p>
        </div>
        {data && data.periods.length > 1 && (
          <PeriodNav periods={data.periods} current={data.period} onChange={cambiarPeriodo} />
        )}
      </header>

      {/* Movimiento de puesto desde la última visita */}
      {movement && movement.delta !== 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="flex items-center gap-2.5 rounded-2xl bg-rosa-suave/60 px-4 py-2.5"
        >
          {movement.delta > 0 ? (
            <ArrowUp size={18} strokeWidth={2.5} className="text-geneo shrink-0" />
          ) : (
            <ArrowDown size={18} strokeWidth={2.5} className="text-soft shrink-0" />
          )}
          <span className="text-ink text-sm font-semibold leading-snug">
            {movement.delta > 0
              ? `¡Subiste ${movement.delta} ${movement.delta === 1 ? "puesto" : "puestos"}!`
              : `Bajaste ${Math.abs(movement.delta)} ${Math.abs(movement.delta) === 1 ? "puesto" : "puestos"}`}{" "}
            <span className="text-soft font-normal">desde tu última visita.</span>
          </span>
        </motion.div>
      )}

      {/* Acceso al desafío de tu farmacia (resumen motivacional del ranking) */}
      <Card
        as={Link}
        href="/desafio"
        variant="base"
        interactive
        className="flex items-center gap-3.5 px-5 py-3.5"
      >
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-rosa-suave text-geneo shrink-0">
          <Trophy size={19} />
        </span>
        <span className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="block text-ink font-bold text-sm leading-tight">
            Desafío de tu farmacia
          </span>
          <span className="block text-muted text-xs leading-snug">
            Cuánto falta para el kit del mes.
          </span>
        </span>
        <ChevronRight size={18} className="text-geneo shrink-0" />
      </Card>

      <nav aria-label="Tipo de ranking" className="flex gap-1 bg-paper rounded-full shadow-soft p-1">
        {(
          [
            { id: "empleados" as const, label: "Empleados", icon: Users },
            { id: "farmacias" as const, label: "Farmacias", icon: Store },
          ]
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={`relative flex-1 inline-flex items-center justify-center gap-1.5 min-h-11 rounded-full text-sm font-bold tracking-tight transition-colors ${
              tab === id
                ? "text-white"
                : "text-muted hover:bg-rosa-suave/60 hover:text-geneo active:bg-rosa-suave/60 active:text-geneo"
            }`}
          >
            {tab === id && (
              <motion.span
                layoutId="ranking-tab-pill"
                className="absolute inset-0 bg-geneo rounded-full"
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              />
            )}
            <Icon size={16} className="relative z-10" />
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence initial={false}>
        {tab === "farmacias" && (
          <Card
            as={motion.p}
            variant="quiet"
            key="farmacias-note"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="flex items-start gap-2.5 text-muted text-xs leading-relaxed px-4 py-3"
          >
            <Info size={15} className="text-geneo shrink-0 mt-0.5" />
            <span>
              El puntaje de una farmacia es el{" "}
              <strong className="text-ink font-bold">promedio de sus 3 mejores empleados</strong> del
              mes. Así una farmacia chica compite de igual a igual con una grande.
            </span>
          </Card>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <RankingSkeleton />
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-3"
          >
            <AlertCircle size={28} className="text-soft" />
            <p className="text-ink font-bold text-sm">No pudimos cargar el ranking</p>
            <p className="text-muted text-sm">Revisá tu conexión e intentá de nuevo.</p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                setReloadKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-2 min-h-11 rounded-full border-2 border-line text-muted hover:border-geneo hover:text-geneo active:border-geneo active:text-geneo font-bold uppercase tracking-wide text-xs px-5 transition-colors"
            >
              <RotateCcw size={14} />
              Reintentar
            </button>
          </motion.div>
        )}

        {status === "ready" && data && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <AnimatePresence mode="wait">
              {tab === "empleados" ? (
                <motion.div
                  key="empleados"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  <EmployeesList rows={data.employees} period={data.period} />
                </motion.div>
              ) : (
                <motion.div
                  key="farmacias"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  <PharmaciesList
                    rows={data.pharmacies}
                    period={data.period}
                    myPharmacyName={pharmacyName}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RankingSkeleton() {
  return (
    <ol className="flex flex-col gap-3" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          className="flex items-center gap-4 rounded-3xl px-4 py-4 bg-paper shadow-soft"
        >
          <span className="w-11 h-11 rounded-full bg-line/60 animate-pulse shrink-0" />
          <span className="flex-1 h-4 rounded-full bg-line/60 animate-pulse" />
          <span className="w-12 h-4 rounded-full bg-line/60 animate-pulse shrink-0" />
        </li>
      ))}
    </ol>
  );
}

function EmployeesList({ rows, period }: { rows: EmployeeRankRow[]; period: string }) {
  if (rows.length === 0) {
    return (
      <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-1">
        <p className="text-ink font-bold text-sm">Nadie sumó puntos en {periodLabel(period)}</p>
        <p className="text-muted text-sm">
          Completá una misión o la pregunta del día para abrir el ranking.
        </p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <Card
          as={motion.li}
          key={r.position}
          variant={r.isCurrentUser ? "feature" : "base"}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: Math.min(i, 8) * 0.05 }}
          className={`flex items-center gap-4 px-4 py-4 ${r.isCurrentUser ? "ring-2 ring-geneo" : ""}`}
        >
          <RankMark position={r.position} />
          <span className="flex-1 min-w-0">
            <span
              className={`flex items-center gap-2 font-bold leading-tight ${r.isCurrentUser ? "text-geneo" : "text-ink"}`}
            >
              {r.displayName}
              {r.isCurrentUser && <Badge tone="soft">Vos</Badge>}
            </span>
          </span>
          <span className="text-ink font-extrabold text-base shrink-0">
            {r.points.toLocaleString("es-AR")}{" "}
            <span className="text-soft text-xs font-semibold">pts</span>
          </span>
        </Card>
      ))}
    </ol>
  );
}

function PharmaciesList({
  rows,
  period,
  myPharmacyName,
}: {
  rows: PharmacyRankRow[];
  period: string;
  myPharmacyName: string | null;
}) {
  if (rows.length === 0) {
    return (
      <div className="bg-paper rounded-3xl shadow-soft px-6 py-10 flex flex-col items-center text-center gap-1">
        <p className="text-ink font-bold text-sm">
          Ninguna farmacia sumó puntos en {periodLabel(period)}
        </p>
        <p className="text-muted text-sm">En cuanto un equipo empiece a jugar, aparece acá.</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {rows.map((p, i) => {
        const isMine = p.name === myPharmacyName;
        return (
          <Card
            as={motion.li}
            key={p.position}
            variant={isMine ? "feature" : "base"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, delay: Math.min(i, 8) * 0.05 }}
            className={`flex items-center gap-4 px-4 py-4 ${isMine ? "ring-2 ring-geneo" : ""}`}
          >
            <RankMark position={p.position} />
            <span className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="flex items-center gap-2 min-w-0">
                <span className={`font-bold leading-tight truncate ${isMine ? "text-geneo" : "text-ink"}`}>
                  {p.name}
                </span>
                {isMine && (
                  <Badge tone="soft" className="shrink-0">
                    Tu farmacia
                  </Badge>
                )}
              </span>
              <span className="text-soft text-xs">
                {p.activeCount} {p.activeCount === 1 ? "empleado activo" : "empleados activos"}
              </span>
            </span>
            <span className="text-ink font-extrabold text-base shrink-0">
              {p.score.toLocaleString("es-AR")}{" "}
              <span className="text-soft text-xs font-semibold">pts</span>
            </span>
          </Card>
        );
      })}
    </ol>
  );
}
