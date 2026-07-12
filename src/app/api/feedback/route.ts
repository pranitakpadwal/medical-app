import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Record whether an answer was helpful. Requires a configured database. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { questionId, helpful } = (body ?? {}) as {
    questionId?: unknown;
    helpful?: unknown;
  };

  if (!Number.isInteger(questionId) || typeof helpful !== "boolean") {
    return NextResponse.json(
      { error: "Fields 'questionId' (integer) and 'helpful' (boolean) are required." },
      { status: 400 },
    );
  }

  const sql = await getDb();
  if (!sql) {
    return NextResponse.json({ error: "Feedback is not enabled on this deployment." }, { status: 501 });
  }

  await sql`UPDATE questions SET helpful = ${helpful} WHERE id = ${questionId as number}`;
  return NextResponse.json({ ok: true });
}
