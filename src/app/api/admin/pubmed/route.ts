import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { chunkText } from "@/lib/chunking";
import { getDb, insertChunk } from "@/lib/db";
import { evidenceLevelFor, searchAndFetch } from "@/lib/pubmed";

export const dynamic = "force-dynamic";

const MAX_RESULTS_CAP = 10;

interface PubMedIngestPayload {
  query?: unknown;
  topic?: unknown;
  keywords?: unknown;
  maxResults?: unknown;
}

/**
 * Ingest PubMed search results as vetted sources. Unlike the free-text admin
 * form, this pulls real, citable abstracts straight from NCBI, so a single
 * search query can add several sources — the biggest lever for growing the
 * library without a manual paste per source.
 */
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

  let body: PubMedIngestPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const query = String(body.query ?? "").trim();
  const topic = String(body.topic ?? "").trim();
  const keywords = String(body.keywords ?? "")
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);
  const maxResults = Math.min(
    Math.max(Math.trunc(Number(body.maxResults ?? 5)) || 5, 1),
    MAX_RESULTS_CAP,
  );

  if (!query || !topic) {
    return NextResponse.json({ error: "query and topic are required." }, { status: 400 });
  }

  let articles;
  try {
    articles = await searchAndFetch(query, maxResults);
  } catch (err) {
    console.error("Sakshya: PubMed search failed.", err);
    return NextResponse.json(
      { error: "Could not reach PubMed. Try again in a moment." },
      { status: 502 },
    );
  }

  if (articles.length === 0) {
    return NextResponse.json(
      { error: "No PubMed results with abstracts for that search." },
      { status: 404 },
    );
  }

  const added: { pmid: string; title: string; sourceId: string; chunks: number }[] = [];

  for (const article of articles) {
    const sourceId = `pubmed-${article.pmid}`;
    const evidence = evidenceLevelFor(article.publicationTypes);
    const url = `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`;

    await sql`
      INSERT INTO sources (id, title, publisher, year, url, evidence)
      VALUES (${sourceId}, ${article.title}, ${article.journal}, ${article.year}, ${url}, ${evidence})
      ON CONFLICT (id) DO UPDATE
        SET title = EXCLUDED.title, publisher = EXCLUDED.publisher,
            year = EXCLUDED.year, url = EXCLUDED.url, evidence = EXCLUDED.evidence`;

    const chunks = chunkText(article.abstract);
    for (let i = 0; i < chunks.length; i++) {
      await insertChunk(sql, `${sourceId}-${i + 1}`, sourceId, topic, keywords, chunks[i]);
    }

    added.push({ pmid: article.pmid, title: article.title, sourceId, chunks: chunks.length });
  }

  return NextResponse.json({ ok: true, count: added.length, added });
}
