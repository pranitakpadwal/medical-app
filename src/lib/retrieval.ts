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
  // Grammatical filler.
  "the", "a", "an", "of", "for", "to", "in", "on", "is", "are", "what", "how",
  "do", "does", "i", "we", "and", "or", "with", "at", "be", "my", "you", "it",
  "this", "that", "can", "should", "when", "which", "give", "given", "about",
  "please", "tell", "me", "whats", "vs", "than", "then", "its", "their", "under",
  "from", "into", "as", "by", "not", "why", "where", "who",
  // Generic exam-question / academic words that carry no topical signal. Left
  // in, they cause false matches: a rare-but-generic word like "mechanism" can
  // look distinctive in a small library and match an unrelated passage's title.
  "mechanism", "mechanisms", "action", "actions", "factor", "factors",
  "function", "functions", "cause", "causes", "caused", "causing", "effect",
  "effects", "role", "roles", "feature", "features", "structure", "structures",
  "common", "commonly", "normal", "normally", "condition", "conditions",
  "process", "processes", "basis", "important", "importance", "region", "major",
  "minor", "mention", "explain", "explains", "describe", "consider",
  "considered", "called", "occur", "occurs", "lead", "leads", "leading",
  "produce", "produces", "produced", "main", "primary", "associated", "related",
  "difference", "differences", "between", "especially", "body", "person",
]);

function tokenize(input: string): string[] {
  return normalize(input)
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

/**
 * Very light suffix stemmer so word variants match (stands/standing,
 * falls/fall, compressions/compression, positions/position). Deliberately
 * conservative; the DB path also relies on Postgres' English stemmer for
 * recall, this just aligns the lexical scorer with it.
 */
function stem(t: string): string {
  if (t.length > 4 && t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss") && !t.endsWith("is")) {
    t = t.slice(0, -1);
  }
  if (t.length > 5 && t.endsWith("ing")) return t.slice(0, -3);
  if (t.length > 4 && t.endsWith("ed")) return t.slice(0, -2);
  return t;
}

/** Lowercase, strip punctuation, collapse whitespace — shared by tokens and phrases. */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9%.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface ScorableChunk {
  topic: string;
  keywords: string[];
  text: string;
}

/** Terms searchable in a chunk: body + keyword tokens + topic. */
function chunkTermSet(chunk: ScorableChunk): Set<string> {
  return new Set([
    ...tokenize(chunk.text),
    ...chunk.keywords.flatMap(tokenize),
    ...tokenize(chunk.topic),
  ]);
}

/**
 * Document frequency of every term across the seed library, computed once.
 * Used as an IDF-style proxy: a term in few passages is "distinctive" and
 * carries real topic signal; a term in many passages (heart, rate, pressure,
 * blood, normal) is common and carries little. When a database adds content,
 * its novel terms are simply absent here and treated as distinctive — the safe
 * direction (allow answering), never a new false match.
 */
const DOC_FREQ: Map<string, number> = (() => {
  const df = new Map<string, number>();
  for (const chunk of CHUNKS) {
    for (const term of chunkTermSet(chunk)) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }
  return df;
})();

/** A term appearing in at most this many passages is treated as distinctive. */
const DISTINCTIVE_DF_MAX = 2;

function isDistinctive(term: string): boolean {
  const n = DOC_FREQ.get(term);
  return n === undefined || n <= DISTINCTIVE_DF_MAX;
}

/**
 * What a chunk shares with the query: the weighted score, the count of
 * distinct matched concepts, and whether any matched single word is
 * distinctive. Together these stop confident-but-wrong citations:
 *  - `matched` < 2 → a lone coincidental word (glaucoma → hypertension on
 *    "pressure"); abstain.
 *  - `distinctive` false → the only overlap is common words (a newborn
 *    heart-rate question grazing passages that mention "heart"/"rate");
 *    abstain even though two words matched.
 *  - Multi-word keyword phrases count as ONE concept so a shared phrase's
 *    tokens are not double-counted.
 */
function scoreChunk(
  uniqueQueryTerms: Set<string>,
  normQuery: string,
  chunk: ScorableChunk,
): { score: number; matched: number; distinctive: boolean } {
  const terms = chunkTermSet(chunk);
  const paddedQuery = ` ${normQuery} `;
  let hits = 0;
  let matched = 0;
  let distinctive = false;
  const consumed = new Set<string>();

  // 1) Multi-word keyword phrases present in the query: one concept each,
  //    and their component tokens are consumed so they can't re-count below.
  //    A phrase counts as distinctive if any of its words is (e.g. "facial
  //    nerve", "second pharyngeal arch"), but not "blood pressure".
  for (const keyword of chunk.keywords) {
    const kw = normalize(keyword);
    if (!kw.includes(" ")) continue;
    if (paddedQuery.includes(` ${kw} `)) {
      matched += 1;
      hits += 2; // explicit keyword match
      for (const part of kw.split(" ")) {
        const s = stem(part);
        consumed.add(s);
        if (isDistinctive(s)) distinctive = true;
      }
    }
  }

  // 2) Remaining single query tokens.
  for (const term of uniqueQueryTerms) {
    if (consumed.has(term) || !terms.has(term)) continue;
    matched += 1;
    if (isDistinctive(term)) distinctive = true;
    hits += chunk.keywords.some((k) => k.toLowerCase().includes(term)) ? 2 : 1;
  }

  return { score: Math.min(hits / uniqueQueryTerms.size, 1), matched, distinctive };
}

/**
 * Minimum distinct concepts a passage must share with the query to be
 * answerable. Below this we abstain rather than cite an irrelevant source on a
 * coincidental word. A one-word query is exempt (there is one concept to match).
 */
const MIN_MATCHED_CONCEPTS = 2;

export interface RetrievalResult {
  passages: RetrievedPassage[];
  /** Best normalized score in [0,1]; drives the abstain decision. */
  topScore: number;
}

function rank(
  uniqueQueryTerms: Set<string>,
  normQuery: string,
  candidates: RetrievedPassage[],
  limit: number,
): RetrievalResult {
  const singleWordQuery = uniqueQueryTerms.size <= 1;
  const minMatched = singleWordQuery ? 1 : MIN_MATCHED_CONCEPTS;
  const scored: RetrievedPassage[] = candidates
    .map((p) => ({ passage: p, ...scoreChunk(uniqueQueryTerms, normQuery, p.chunk) }))
    // Answer only on genuine overlap: enough distinct concepts AND at least one
    // distinctive word (single-word queries are exempt from the latter).
    .filter((r) => r.score > 0 && r.matched >= minMatched && (singleWordQuery || r.distinctive))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => ({ ...r.passage, score: r.score }));
  return { passages: scored, topScore: scored[0]?.score ?? 0 };
}

function seedRetrieve(
  uniqueQueryTerms: Set<string>,
  normQuery: string,
  limit: number,
): RetrievalResult {
  const candidates: RetrievedPassage[] = CHUNKS.map((chunk) => ({
    chunk,
    source: sourceFor(chunk),
    score: 0,
  }));
  return rank(uniqueQueryTerms, normQuery, candidates, limit);
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
  normQuery: string,
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
  return rank(new Set(queryTerms), normQuery, candidates, limit);
}

/** Retrieve the best-matching passages for a question. */
export async function retrieve(question: string, limit = 3): Promise<RetrievalResult> {
  const queryTerms = tokenize(question);
  if (queryTerms.length === 0) return { passages: [], topScore: 0 };
  const normQuery = normalize(question);

  const sql = await getDb();
  if (sql) {
    try {
      return await dbRetrieve(sql, queryTerms, normQuery, limit);
    } catch (err) {
      console.error("Sakshya: DB retrieval failed, using seed library.", err);
    }
  }
  return seedRetrieve(new Set(queryTerms), normQuery, limit);
}
