import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Library stats + recent questions (the content roadmap lives here). */
export async function GET(request: Request) {
  const denied = checkAdmin(request);
  if (denied) return denied;

  const sql = await getDb();
  if (!sql) {
    return NextResponse.json(
      { error: "No database configured: set DATABASE_URL to enable the dashboard." },
      { status: 501 },
    );
  }

  const [stats] = await sql<
    [{ sources: string; chunks: string; questions: string; abstained: string }]
  >`
    SELECT
      (SELECT count(*) FROM sources) AS sources,
      (SELECT count(*) FROM chunks) AS chunks,
      (SELECT count(*) FROM questions) AS questions,
      (SELECT count(*) FROM questions WHERE status = 'abstained') AS abstained`;

  const recent = await sql`
    SELECT id, question, status, top_score, helpful, created_at
    FROM questions
    ORDER BY created_at DESC
    LIMIT 50`;

  return NextResponse.json({
    stats: {
      sources: Number(stats.sources),
      chunks: Number(stats.chunks),
      questions: Number(stats.questions),
      abstained: Number(stats.abstained),
    },
    recent,
  });
}
