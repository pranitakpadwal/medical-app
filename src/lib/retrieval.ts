import { CHUNKS, sourceFor } from "@/data/sources";
import { getDb } from "@/lib/db";
import type { EvidenceLevel, RetrievedPassage } from "@/lib/types";

/**
 * Retrieval over the vetted library.
 *
 * Two paths, one behavior:
 * - With a database (DATABASE_URL set): Postgres full-text search does recall
 *   (with English stemming, so "compressions" finds "compression"), then the
 *   same lexical scorer below ranks candidates and drives abstention.
 * - Without one: pure lexical retrieval over the in-memory seed library,
 *   exactly as Phase 1 shipped.
 *
 * Scoring semantics are identical in both paths, so the abstention threshold
 * in answer.ts means the same thing regardless of deployment. The next
 * upgrade seam is swapping FTS recall for embedding-based semantic search
 * (pgvector) — only `dbRetrieve` changes.
 */

const STOPWORDS = new Set([
  "the", "a", "an", "of", "for", "to", "in", "on", "is", "are", "what", "how",
  "do", "does", "i", "we", "and", "or", "with", "at", "be", "my", "you", "it",
  "this", "that", "can", "should", "when", "which", "give", "given", "about",
  "please", "tell", "me", "whats", "vs",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9%.\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

interface ScorableChunk {
  topic: string;
  keywords: string[];
  text: string;
}

/** Term-overlap score in [0,1]; keyword/topic hits weigh double. */
function scoreChunk(uniqueQueryTerms: Set<string>, chunk: ScorableChunk): number {
  const terms = new Set([
    ...tokenize(chunk.text),
    ...chunk.keywords.flatMap(tokenize),
    ...tokenize(chunk.topic),
  ]);
  let hits = 0;
  for (const term of uniqueQueryTerms) {
    if (terms.has(term)) {
      // Explicit keyword matches are weighted higher than body-text matches.
      hits += chunk.keywords.some((k) => k.toLowerCase().includes(term)) ? 2 : 1;
    }
  }
  return Math.min(hits / uniqueQueryTerms.size, 1);
}

export interface RetrievalResult {
  passages: RetrievedPassage[];
  /** Best normalized score in [0,1]; drives the abstain decision. */
  topScore: number;
}

function rank(
  uniqueQueryTerms: Set<string>,
  candidates: RetrievedPassage[],
  limit: number,
): RetrievalResult {
  const scored = candidates
    .map((p) => ({ ...p, score: scoreChunk(uniqueQueryTerms, p.chunk) }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return { passages: scored, topScore: scored[0]?.score ?? 0 };
}

function seedRetrieve(uniqueQueryTerms: Set<string>, limit: number): RetrievalResult {
  const candidates: RetrievedPassage[] = CHUNKS.map((chunk) => ({
    chunk,
    source: sourceFor(chunk),
    score: 0,
  }));
  return rank(uniqueQueryTerms, candidates, limit);
}

interface ChunkRow {
  id: string;
  source_id: string;
  topic: string;
  keywords: string[];
  body: string;
  title: string;
  publisher: string;
  year: number;
  url: string;
  evidence: EvidenceLevel;
}

async function dbRetrieve(
  sql: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  queryTerms: string[],
  limit: number,
): Promise<RetrievalResult> {
  // OR-query over sanitized tokens: recall stays high for natural-language
  // questions where an AND query (websearch_to_tsquery) would find nothing.
  const tsquery = queryTerms
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length > 1)
    .join(" | ");
  if (tsquery.length === 0) return { passages: [], topScore: 0 };

  const rows = await sql<ChunkRow[]>`
    SELECT c.id, c.source_id, c.topic, c.keywords, c.body,
           s.title, s.publisher, s.year, s.url, s.evidence
    FROM chunks c
    JOIN sources s ON s.id = c.source_id
    WHERE c.tsv @@ to_tsquery('english', ${tsquery})
    ORDER BY ts_rank(c.tsv, to_tsquery('english', ${tsquery})) DESC
    LIMIT 20`;

  const candidates: RetrievedPassage[] = rows.map((r) => ({
    chunk: {
      id: r.id,
      sourceId: r.source_id,
      topic: r.topic,
      keywords: r.keywords,
      text: r.body,
    },
    source: {
      id: r.source_id,
      title: r.title,
      publisher: r.publisher,
      year: r.year,
      url: r.url,
      evidence: r.evidence,
    },
    score: 0,
  }));
  return rank(new Set(queryTerms), candidates, limit);
}

/** Retrieve the best-matching passages for a question. */
export async function retrieve(question: string, limit = 3): Promise<RetrievalResult> {
  const queryTerms = tokenize(question);
  if (queryTerms.length === 0) return { passages: [], topScore: 0 };

  const sql = await getDb();
  if (sql) {
    try {
      return await dbRetrieve(sql, queryTerms, limit);
    } catch (err) {
      console.error("MedCheck: DB retrieval failed, using seed library.", err);
    }
  }
  return seedRetrieve(new Set(queryTerms), limit);
}
