import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { chunkText, slugify } from "@/lib/chunking";
import { getDb, insertChunk } from "@/lib/db";
import type { EvidenceLevel } from "@/lib/types";

export const dynamic = "force-dynamic";

const EVIDENCE_LEVELS: EvidenceLevel[] = ["guideline", "review", "study", "textbook"];

interface NewSourcePayload {
  title?: unknown;
  publisher?: unknown;
  year?: unknown;
  url?: unknown;
  evidence?: unknown;
  topic?: unknown;
  keywords?: unknown;
  text?: unknown;
}

/** Ingest a new source: metadata + pasted text → chunked, searchable passages. */
export async function POST(request: Request) {
  const denied = checkAdmin(request);
  if (denied) return denied;

  const sql = await getDb();
  if (!sql) {
    return NextResponse.json(
      { error: "No database configured: set DATABASE_URL to enable ingestion." },
      { status: 501 },
    );
  }

  let body: NewSourcePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const publisher = String(body.publisher ?? "").trim();
  const year = Number(body.year);
  const url = String(body.url ?? "").trim();
  const evidence = String(body.evidence ?? "") as EvidenceLevel;
  const topic = String(body.topic ?? "").trim();
  const keywords = String(body.keywords ?? "")
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);
  const text = String(body.text ?? "");

  if (!title || !publisher || !url || !topic) {
    return NextResponse.json(
      { error: "title, publisher, url and topic are required." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return NextResponse.json({ error: "year must be a valid year." }, { status: 400 });
  }
  if (!EVIDENCE_LEVELS.includes(evidence)) {
    return NextResponse.json(
      { error: `evidence must be one of: ${EVIDENCE_LEVELS.join(", ")}.` },
      { status: 400 },
    );
  }
  if (!/^https:\/\//.test(url)) {
    return NextResponse.json({ error: "url must start with https://." }, { status: 400 });
  }

  const chunks = chunkText(text);
  if (chunks.length === 0) {
    return NextResponse.json(
      { error: "text produced no usable passages (too short?)." },
      { status: 400 },
    );
  }

  const sourceId = `${slugify(publisher)}-${slugify(title)}-${year}`;
  await sql`
    INSERT INTO sources (id, title, publisher, year, url, evidence)
    VALUES (${sourceId}, ${title}, ${publisher}, ${year}, ${url}, ${evidence})
    ON CONFLICT (id) DO UPDATE
      SET title = EXCLUDED.title, publisher = EXCLUDED.publisher,
          year = EXCLUDED.year, url = EXCLUDED.url, evidence = EXCLUDED.evidence`;

  for (let i = 0; i < chunks.length; i++) {
    await insertChunk(sql, `${sourceId}-${i + 1}`, sourceId, topic, keywords, chunks[i]);
  }

  return NextResponse.json({ ok: true, sourceId, chunks: chunks.length });
}
