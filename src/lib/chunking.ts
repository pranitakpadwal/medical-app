/**
 * Split pasted source text into retrievable chunks.
 *
 * Strategy: split on blank lines (paragraphs), then greedily merge adjacent
 * paragraphs up to a target size so each chunk stays a coherent, quotable
 * passage. Deliberately simple — chunk quality can be tuned entirely here
 * without touching retrieval or storage.
 */

const TARGET_CHARS = 900;
const MIN_CHARS = 40;

export function chunkText(raw: string): string[] {
  const paragraphs = raw
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current.length === 0) {
      current = para;
    } else if (current.length + para.length + 1 <= TARGET_CHARS) {
      current = `${current} ${para}`;
    } else {
      chunks.push(current);
      current = para;
    }
  }
  if (current.length > 0) chunks.push(current);

  return chunks.filter((c) => c.length >= MIN_CHARS);
}

/** URL/DB-safe slug for ids. */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "source"
  );
}
