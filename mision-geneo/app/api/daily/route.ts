import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DAILY_POINTS, dayKey } from "@/lib/daily";
import { questionForToday, toPublicQuestion } from "@/lib/daily.server";

/**
 * Pregunta del día: el servidor decide TODO. El cliente nunca ve
 * `correctIndex` antes de responder — recién viaja acá cuando ya existe una
 * respuesta guardada para hoy (GET) o justo después de registrarla (POST).
 *
 * GET  → pregunta de hoy (sin respuesta) + si el usuario ya respondió.
 * POST → { optionIndex } y el servidor recalcula la pregunta de hoy (nunca
 *        confía en un id que mande el cliente), compara contra el pool
 *        server-only y otorga puntos solo si acierta.
 */

export const dynamic = "force-dynamic";

type DailyAnswerRow = { correct: boolean; points: number };

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const question = questionForToday();
  const today = dayKey();

  const { data: existing } = await supabase
    .from("daily_answers")
    .select("correct, points")
    .eq("user_id", user.id)
    .eq("day", today)
    .maybeSingle<DailyAnswerRow>();

  return NextResponse.json({
    question: toPublicQuestion(question),
    points: DAILY_POINTS,
    answeredToday: Boolean(existing),
    result: existing
      ? {
          correct: existing.correct,
          points: existing.points,
          feedback: question.feedback,
          correctIndex: question.correctIndex,
        }
      : null,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const question = questionForToday();
  const optionIndex = (body as { optionIndex?: unknown } | null)?.optionIndex;
  if (
    typeof optionIndex !== "number" ||
    !Number.isInteger(optionIndex) ||
    optionIndex < 0 ||
    optionIndex >= question.options.length
  ) {
    return NextResponse.json({ error: "optionIndex inválido" }, { status: 400 });
  }

  const today = dayKey();

  // Chequeo defensivo: un segundo intento del mismo día no debe pisar el
  // primero. El unique(user_id, day) + ignoreDuplicates de abajo es la
  // garantía real a nivel base; esto evita hacerle creer al cliente que
  // ganó puntos por un intento que la base va a descartar.
  const { data: existing } = await supabase
    .from("daily_answers")
    .select("id")
    .eq("user_id", user.id)
    .eq("day", today)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "Ya respondiste la pregunta de hoy." },
      { status: 400 },
    );
  }

  const correct = optionIndex === question.correctIndex;
  const points = correct ? DAILY_POINTS : 0;

  const admin = createAdminClient();
  await admin.from("daily_answers").upsert(
    { user_id: user.id, day: today, question_id: question.id, correct, points },
    { onConflict: "user_id,day", ignoreDuplicates: true },
  );

  return NextResponse.json({
    questionId: question.id,
    correct,
    points,
    feedback: question.feedback,
    correctIndex: question.correctIndex,
  });
}
