import Anthropic from "@anthropic-ai/sdk";
import type { RetrievedPassage } from "@/lib/types";

/**
 * Turns already-retrieved, already-cited passages into clean prose.
 *
 * This is deliberately NOT a free-form answer generator. It runs only after
 * retrieval has already decided the library covers the question (see
 * answer.ts) — Claude's only job here is to phrase the given passages
 * clearly, with every claim traced back to a passage number. It never
 * receives an instruction to answer from its own knowledge, and if the API
 * key is missing or the call fails for any reason, callers fall back to
 * showing the raw cited passages (Phase 1/2 behavior) — synthesis is a
 * presentation layer, never a dependency for correctness.
 */

const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 700;
const TIMEOUT_MS = 20_000;

const SYSTEM_PROMPT = `You are a study aid for Indian final-year medical students preparing for exams and vivas.

You will be given a question and a numbered list of passages from vetted sources. Answer ONLY using those passages — never use outside knowledge, even if you are confident it is correct.

Rules:
- Every sentence that makes a factual claim must end with the bracketed number(s) of the passage(s) it came from, e.g. "...compressions at 100–120/min [1]." or "...[1][2]."
- Never cite a passage number that was not given to you.
- If the passages only partially answer the question, answer what they cover and say plainly what is missing — do not fill the gap from your own knowledge.
- This is an educational reference, not clinical advice for a specific patient. Do not phrase anything as a direct instruction for managing an individual case.
- Be clear and exam-oriented. Keep it tight — a few sentences to a short paragraph, not an essay.`;

let cachedClient: Anthropic | null | undefined;

function getClient(): Anthropic | null {
  if (cachedClient !== undefined) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  cachedClient = apiKey ? new Anthropic({ apiKey, timeout: TIMEOUT_MS }) : null;
  return cachedClient;
}

function buildUserMessage(question: string, passages: RetrievedPassage[]): string {
  const numbered = passages
    .map(
      (p, i) =>
        `[${i + 1}] (${p.source.title} — ${p.source.publisher}, ${p.source.year})\n${p.chunk.text}`,
    )
    .join("\n\n");
  return `Question: ${question}\n\nPassages:\n${numbered}`;
}

/**
 * Returns synthesized prose, or null if synthesis is unavailable/unset/failed
 * — callers must treat null as "show the raw passages instead," never as an error.
 */
export async function synthesize(
  question: string,
  passages: RetrievedPassage[],
): Promise<string | null> {
  const client = getClient();
  if (!client || passages.length === 0) return null;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(question, passages) }],
    });
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();
    return text.length > 0 ? text : null;
  } catch (err) {
    console.error("Sakshya: synthesis failed, showing raw passages instead.", err);
    return null;
  }
}
