/**
 * Lowercase, strip punctuation, collapse whitespace.
 * Shared by retrieval.ts (term matching) and db.ts (the question dedupe key
 * that permalinks and synthesis caching key off) — kept in its own module so
 * neither has to import the other.
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9%.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
