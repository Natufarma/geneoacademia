import type { PharmacySummary } from "@/lib/admin-data";
import { periodLabel } from "@/lib/ranking";

/**
 * Hoja imprimible del ranking del mes (`.print-only`: invisible en pantalla).
 *
 * Es markup APARTE de la tabla del panel, no una variante de la misma. La
 * tabla de pantalla anima sus filas con framer-motion (`Reveal`, whileInView)
 * desde `opacity: 0`: las filas que nunca entraron al viewport saldrían en
 * blanco en el PDF. Acá no hay animación, ni layout responsive doble, ni
 * componentes cliente — solo una tabla que el navegador pagina bien.
 *
 * Muestra SOLO farmacias con actividad: un ranking con 92 filas en cero es
 * ruido en un documento que se manda por mail o se imprime.
 */
export default function RankingReport({
  pharmacies,
  period,
  generatedAt,
}: {
  pharmacies: PharmacySummary[];
  period: string;
  /** Fecha de emisión, ya formateada por el llamador (server) para que el
      PDF no dependa del huso del navegador que imprime. */
  generatedAt: string;
}) {
  const activas = pharmacies.filter((p) => p.activeCount > 0);

  return (
    <section className="print-only print-sheet">
      <header style={{ marginBottom: "16pt" }}>
        <p
          style={{
            fontSize: "8pt",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Misión Geneo · Natufarma
        </p>
        <h1 style={{ fontSize: "17pt", fontWeight: 800, margin: "4pt 0 0" }}>
          Ranking de farmacias · {periodLabel(period)}
        </h1>
        <p style={{ fontSize: "9pt", margin: "3pt 0 0" }}>
          Emitido el {generatedAt} · {activas.length}{" "}
          {activas.length === 1 ? "farmacia participante" : "farmacias participantes"}
        </p>
      </header>

      <table>
        <thead>
          <tr>
            <th style={{ width: "8%" }}>#</th>
            <th>Farmacia</th>
            <th style={{ width: "11%" }}>Código</th>
            <th className="num" style={{ width: "12%" }}>
              Activos
            </th>
            <th className="num" style={{ width: "14%" }}>
              Score
            </th>
            <th className="num" style={{ width: "19%", whiteSpace: "nowrap" }}>
              Puntos brutos
            </th>
          </tr>
        </thead>
        <tbody>
          {activas.map((p) => (
            <tr key={p.id}>
              <td style={{ fontWeight: 700 }}>{p.position}º</td>
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td>{p.code}</td>
              <td className="num">{p.activeCount}</td>
              <td className="num" style={{ fontWeight: 700 }}>
                {p.score}
              </td>
              <td className="num">{p.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer style={{ marginTop: "14pt", fontSize: "8.5pt", lineHeight: 1.5 }}>
        <p style={{ margin: 0 }}>
          <strong>Cómo se calcula:</strong> el score de cada farmacia es el promedio de sus 3
          empleados activos con más puntos del mes (o de los que haya, si son menos de 3). Empleado
          activo = sumó al menos 1 punto en el mes. El ranking se reinicia el primer día de cada mes
          calendario, hora de Argentina.
        </p>
        <p style={{ margin: "5pt 0 0" }}>
          Se listan únicamente las farmacias con actividad en el período. Las farmacias sin empleados
          activos no rankean.
        </p>
      </footer>
    </section>
  );
}
