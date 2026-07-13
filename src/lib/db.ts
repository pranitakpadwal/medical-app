import postgres from "postgres";
import { CHUNKS, SOURCES } from "@/data/sources";

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
    console.error("MedCheck: database unavailable, using seed library.", err);
    // Allow a later request to retry bootstrap.
    globalThis.__medcheckReady = undefined;
    return null;
  }
}
