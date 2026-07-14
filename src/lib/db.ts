import postgres from "postgres";
import { SAMPLE_QUESTIONS } from "@/data/sampleQuestions";
import { CHUNKS, SOURCES } from "@/data/sources";
import { normalize } from "@/lib/text";
import type { EvidenceLevel, RetrievedPassage } from "@/lib/types";

/**
 * Postgres access with graceful absence.
 *
 * When DATABASE_URL is unset (local dev, or a deploy without a database yet)
 * every caller gets `null` and the app falls back to the in-memory seed
 * library, exactly like Phase 1. When it is set, the schema is created on
 * first use and the seed library is copied in if the library is empty, so a
 * fresh database starts with the same content the fallback serves.
 */

type Sql = ReturnType<typeof postgres>;

declare global {
  // Survives Next.js dev-server module reloads.
  var __medcheckSql: Sql | undefined;
  var __medcheckReady: Promise<void> | undefined;
}

function connect(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!globalThis.__medcheckSql) {
    globalThis.__medcheckSql = postgres(url, {
      max: 5,
      // Railway's public proxy needs TLS; its private network does not.
      // 'prefer' tries TLS first and falls back, covering both.
      ssl: "prefer",
      onnotice: () => {},
    });
  }
  return globalThis.__medcheckSql;
}

async function bootstrap(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS sources (
      id text PRIMARY KEY,
      title text NOT NULL,
      publisher text NOT NULL,
      year int NOT NULL,
      url text NOT NULL,
      evidence text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS chunks (
      id text PRIMARY KEY,
      source_id text NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
      topic text NOT NULL,
      keywords text[] NOT NULL DEFAULT '{}',
      body text NOT NULL,
      tsv tsvector NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS chunks_tsv_idx ON chunks USING gin (tsv)`;
  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      question text NOT NULL,
      status text NOT NULL,
      top_score real NOT NULL DEFAULT 0,
      helpful boolean,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  // Migrations for columns added after the initial deploy. ADD COLUMN IF NOT
  // EXISTS is idempotent and safe to run on every boot, including against an
  // already-seeded database that predates these columns.
  await sql`ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_key text`;
  await sql`ALTER TABLE questions ADD COLUMN IF NOT EXISTS ask_count int NOT NULL DEFAULT 1`;
  await sql`ALTER TABLE questions ADD COLUMN IF NOT EXISTS last_asked_at timestamptz NOT NULL DEFAULT now()`;
  await sql`ALTER TABLE questions ADD COLUMN IF NOT EXISTS synthesis text`;
  await sql`ALTER TABLE questions ADD COLUMN IF NOT EXISTS passage_ids text[] NOT NULL DEFAULT '{}'`;
  // Repeated identical questions upsert onto one row (see answer.ts) instead
  // of piling up duplicates, so this is both a dedupe key and what gives each
  // question a stable, reusable permalink at /q/[id].
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS questions_question_key_idx ON questions (question_key)`;

  // Sync the built-in seed library into the database. This is idempotent
  // (ON CONFLICT DO NOTHING), so it runs on every boot: a fresh database gets
  // the full seed set, and an already-seeded one picks up any newly shipped
  // seed content on the next deploy — without touching rows a curator has
  // added or edited through /admin.
  for (const s of SOURCES) {
    await sql`
      INSERT INTO sources (id, title, publisher, year, url, evidence)
      VALUES (${s.id}, ${s.title}, ${s.publisher}, ${s.year}, ${s.url}, ${s.evidence})
      ON CONFLICT (id) DO NOTHING`;
  }
  for (const c of CHUNKS) {
    await insertChunk(sql, c.id, c.sourceId, c.topic, c.keywords, c.text);
  }

  // Seed Explore with real, cited Q&A built from the library above, so it
  // isn't empty before real students start asking. ON CONFLICT DO NOTHING on
  // question_key means this never overwrites a real ask — including the
  // first time a student's phrasing exactly matches a seeded question, which
  // upserts onto this same row (see answer.ts) and gets a real Claude
  // synthesis, indistinguishable from organic content from then on.
  for (const q of SAMPLE_QUESTIONS) {
    await sql`
      INSERT INTO questions (question, question_key, status, top_score, passage_ids, ask_count, last_asked_at)
      VALUES (${q.question}, ${normalize(q.question)}, 'answered', 1, ${[q.chunkId]}, 1, now())
      ON CONFLICT (question_key) DO NOTHING`;
  }
}

/** Insert one chunk, computing its search vector from body + topic + keywords. */
export async function insertChunk(
  sql: Sql,
  id: string,
  sourceId: string,
  topic: string,
  keywords: string[],
  body: string,
): Promise<void> {
  const keywordText = keywords.join(" ");
  await sql`
    INSERT INTO chunks (id, source_id, topic, keywords, body, tsv)
    VALUES (
      ${id}, ${sourceId}, ${topic}, ${keywords as unknown as string[]}, ${body},
      setweight(to_tsvector('english', ${topic} || ' ' || ${keywordText}), 'A') ||
      setweight(to_tsvector('english', ${body}), 'B')
    )
    ON CONFLICT (id) DO NOTHING`;
}

/**
 * Get a ready-to-use connection, or null when no database is configured.
 * Bootstrap runs once per process; if it fails (e.g. database unreachable)
 * we return null so callers fall back to the seed library instead of erroring.
 */
export async function getDb(): Promise<Sql | null> {
  const sql = connect();
  if (!sql) return null;
  if (!globalThis.__medcheckReady) {
    globalThis.__medcheckReady = bootstrap(sql);
  }
  try {
    await globalThis.__medcheckReady;
    return sql;
  } catch (err) {
    console.error("Sakshya: database unavailable, using seed library.", err);
    // Allow a later request to retry bootstrap.
    globalThis.__medcheckReady = undefined;
    return null;
  }
}

export interface PublicStats {
  sources: number;
  chunks: number;
  questionsAnswered: number;
}

/** Homepage stats strip. Falls back to the static seed library size with no DB. */
export async function getPublicStats(): Promise<PublicStats> {
  const sql = await getDb();
  if (!sql) return { sources: SOURCES.length, chunks: CHUNKS.length, questionsAnswered: 0 };
  const [row] = await sql<[{ sources: string; chunks: string; answered: string }]>`
    SELECT (SELECT count(*) FROM sources) AS sources,
           (SELECT count(*) FROM chunks) AS chunks,
           (SELECT count(*) FROM questions WHERE status = 'answered') AS answered`;
  return {
    sources: Number(row.sources),
    chunks: Number(row.chunks),
    questionsAnswered: Number(row.answered),
  };
}

export interface QuestionRow {
  id: number;
  question: string;
  status: "answered" | "abstained";
  top_score: number;
  helpful: boolean | null;
  synthesis: string | null;
  passage_ids: string[];
  ask_count: number;
  created_at: string;
  last_asked_at: string;
}

/**
 * postgres.js returns `bigint` columns (questions.id) as strings to avoid
 * silent precision loss, even though our ids are always in safe-integer
 * range here — coerce back to number so `typeof id === "number"` checks
 * (e.g. the feedback UI) work as the QuestionRow type promises.
 */
function coerceQuestionRow(row: QuestionRow): QuestionRow {
  return { ...row, id: Number(row.id) };
}

/**
 * Reuse a previous synthesis instead of paying for Claude again when the
 * exact same question (by normalized text) was already answered from the
 * exact same set of retrieved passages. This is what keeps repeated/viral
 * questions cheap — the first asker pays for synthesis, everyone after gets
 * the cached answer. A cache miss (different passages — e.g. the library
 * grew) just falls through to a fresh, correctly-grounded synthesis.
 */
export async function getCachedSynthesis(
  questionKey: string,
  passageIds: string[],
): Promise<string | null> {
  const sql = await getDb();
  if (!sql) return null;
  const rows = await sql<[{ synthesis: string | null }]>`
    SELECT synthesis FROM questions
    WHERE question_key = ${questionKey}
      AND passage_ids = ${passageIds}
      AND synthesis IS NOT NULL
    LIMIT 1`;
  return rows[0]?.synthesis ?? null;
}

/** Look up a logged question by id — the data behind a /q/[id] permalink. */
export async function getQuestionById(id: number): Promise<QuestionRow | null> {
  if (!Number.isInteger(id)) return null;
  const sql = await getDb();
  if (!sql) return null;
  const rows = await sql<QuestionRow[]>`SELECT * FROM questions WHERE id = ${id}`;
  return rows[0] ? coerceQuestionRow(rows[0]) : null;
}

/**
 * Questions for the /explore browse page: most-asked first, so the page
 * surfaces what students actually need rather than a raw activity log.
 */
export async function listQuestions(limit = 100): Promise<QuestionRow[]> {
  const sql = await getDb();
  if (!sql) return [];
  const rows = await sql<QuestionRow[]>`
    SELECT * FROM questions
    ORDER BY ask_count DESC, last_asked_at DESC
    LIMIT ${limit}`;
  return rows.map(coerceQuestionRow);
}

interface ChunkWithSourceRow {
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

/**
 * Re-fetch chunks + sources for a stored, ordered list of chunk ids —
 * reconstructs the passages behind a permalink without re-running retrieval
 * (stable, free, and reflects any later curator corrections to that chunk).
 */
export async function passagesForIds(passageIds: string[]): Promise<RetrievedPassage[]> {
  if (passageIds.length === 0) return [];
  const sql = await getDb();
  if (!sql) return [];
  const rows = await sql<ChunkWithSourceRow[]>`
    SELECT c.id, c.source_id, c.topic, c.keywords, c.body,
           s.title, s.publisher, s.year, s.url, s.evidence
    FROM chunks c
    JOIN sources s ON s.id = c.source_id
    WHERE c.id = ANY(${passageIds})`;
  const byId = new Map(rows.map((r) => [r.id, r]));
  return passageIds
    .map((id) => byId.get(id))
    .filter((r): r is ChunkWithSourceRow => r !== undefined)
    .map((r) => ({
      chunk: { id: r.id, sourceId: r.source_id, topic: r.topic, keywords: r.keywords, text: r.body },
      source: {
        id: r.source_id,
        title: r.title,
        publisher: r.publisher,
        year: r.year,
        url: r.url,
        evidence: r.evidence,
      },
      score: 1,
    }));
}
