import { CHUNKS, sourceFor } from "@/data/sources";
import type { RetrievedPassage } from "@/lib/types";

/**
 * Lightweight lexical retrieval over the seed library.
 *
 * This is deliberately dependency-free so the app runs and demonstrates the
 * grounded-answer flow with no API keys or vector database. The scoring is a
 * simple term-overlap measure over each chunk's text + keywords. In production
 * this function is the single seam to replace with embedding-based semantic
 * search (pgvector) — the rest of the app only consumes `RetrievedPassage[]`.
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

/** Build the searchable bag of terms for a chunk (text + explicit keywords + topic). */
function chunkTerms(text: string, keywords: string[], topic: string): Set<string> {
  return new Set([...tokenize(text), ...keywords.flatMap(tokenize), ...tokenize(topic)]);
}

export interface RetrievalResult {
  passages: RetrievedPassage[];
  /** Best normalized score in [0,1]; drives the abstain decision. */
  topScore: number;
}

/**
 * Retrieve the best-matching passages for a question.
 * Score is normalized against the number of meaningful query terms so it maps
 * cleanly onto an abstention threshold regardless of question length.
 */
export function retrieve(question: string, limit = 3): RetrievalResult {
  const queryTerms = tokenize(question);
  if (queryTerms.length === 0) {
    return { passages: [], topScore: 0 };
  }
  const uniqueQueryTerms = new Set(queryTerms);

  const scored: RetrievedPassage[] = CHUNKS.map((chunk) => {
    const terms = chunkTerms(chunk.text, chunk.keywords, chunk.topic);
    let hits = 0;
    for (const term of uniqueQueryTerms) {
      if (terms.has(term)) {
        // Explicit keyword/topic matches are weighted higher than body-text matches.
        hits += chunk.keywords.some((k) => k.toLowerCase().includes(term)) ? 2 : 1;
      }
    }
    const score = hits / uniqueQueryTerms.size;
    return { chunk, source: sourceFor(chunk), score };
  })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    passages: scored,
    topScore: scored.length > 0 ? Math.min(scored[0].score, 1) : 0,
  };
}
