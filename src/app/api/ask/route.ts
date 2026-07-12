import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/answer";

// This handler retrieves from a static in-memory library, so there is nothing
// to cache and no external calls to make.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const question =
    typeof body === "object" && body !== null && "question" in body
      ? String((body as { question: unknown }).question ?? "")
      : "";

  if (question.trim().length === 0) {
    return NextResponse.json({ error: "Field 'question' is required." }, { status: 400 });
  }

  const answer = answerQuestion(question);
  return NextResponse.json(answer);
}
