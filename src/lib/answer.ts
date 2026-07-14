import { getDb } from "@/lib/db";
import { retrieve } from "@/lib/retrieval";
import { synthesize } from "@/lib/synthesize";
import type { Answer, Source } from "@/lib/types";

/**
 * Below this normalized retrieval score we do not trust that the library
 * actually covers the question, so we abstain instead of guessing. In
 * medicine a confidently wrong answer is worse than an honest "I don't know".
 */
const ABSTAIN_THRESHOLD = 0.34;

const DISCLAIMER =
  "Educational reference only — not medical advice. Verify against your institution's guidelines and your seniors before any patient-specific decision.";

function dedupeSources(sources: Source[]): Source[] {
  const seen = new Map<string, Source>();
  for (const s of sources) {
    if (!seen.has(s.id)) seen.set(s.id, s);
  }
  return [...seen.values()];
}

/**
 * Log the question for the content roadmap ("what are students asking that we
 * can't answer?"). Failure to log must never break answering.
 */
async function logQuestion(
  question: string,
  status: Answer["status"],
  topScore: number,
): Promise<number | undefined> {
  try {
    const sql = await getDb();
    if (!sql) return undefined;
    const [row] = await sql<[{ id: number }]>`
      INSERT INTO questions (question, status, top_score)
      VALUES (${question}, ${status}, ${topScore})
      RETURNING id`;
    return Number(row.id);
  } catch (err) {
    console.error("Sakshya: failed to log question.", err);
    return undefined;
  }
}

/**
 * The core grounded-answer engine.
 *
 * It never generates free-form medical content: it retrieves passages from the
 * vetted library first, and only decides to answer (vs. abstain) based on
 * those passages. When an ANTHROPIC_API_KEY is configured, Claude then
 * phrases the SAME retrieved passages into prose with bracketed citations
 * (`synthesize`) — a presentation step that runs strictly after the grounding
 * decision, never a substitute for it. Without a key, or if synthesis fails,
 * the raw cited passages are returned exactly as in Phase 1/2.
 */
export async function answerQuestion(question: string): Promise<Answer> {
  const trimmed = question.trim();

  if (trimmed.length === 0) {
    return {
      status: "abstained",
      question: trimmed,
      headline: "Please enter a question.",
      passages: [],
      sources: [],
      disclaimer: DISCLAIMER,
    };
  }

  const { passages, topScore } = await retrieve(trimmed);

  if (passages.length === 0 || topScore < ABSTAIN_THRESHOLD) {
    const questionId = await logQuestion(trimmed, "abstained", topScore);
    return {
      status: "abstained",
      question: trimmed,
      questionId,
      headline:
        "No verified source in the current library covers this yet. Ask your PG or faculty, and we'll prioritise adding a vetted source for it.",
      passages: [],
      sources: [],
      disclaimer: DISCLAIMER,
    };
  }

  const questionId = await logQuestion(trimmed, "answered", topScore);
  const synthesis = await synthesize(trimmed, passages);
  return {
    status: "answered",
    question: trimmed,
    questionId,
    headline: `Found ${passages.length} grounded passage${passages.length > 1 ? "s" : ""} from vetted sources.`,
    passages,
    sources: dedupeSources(passages.map((p) => p.source)),
    synthesis: synthesis ?? undefined,
    disclaimer: DISCLAIMER,
  };
}
