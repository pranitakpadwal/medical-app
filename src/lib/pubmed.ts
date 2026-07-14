import type { EvidenceLevel } from "@/lib/types";

/**
 * Client for NCBI's PubMed E-utilities (esearch + efetch).
 *
 * Public, free, no API key required (an optional NCBI_API_KEY raises the
 * rate limit from 3 to 10 requests/sec — see README). This is deliberately
 * a small hand-rolled XML extractor rather than a full parser: eutils'
 * article XML has a stable, well-documented tag structure, and we only need
 * five fields per article.
 */

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const FETCH_TIMEOUT_MS = 15_000;

export interface PubMedArticle {
  pmid: string;
  title: string;
  journal: string;
  year: number;
  abstract: string;
  publicationTypes: string[];
}

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

function apiKeyParam(): string {
  const key = process.env.NCBI_API_KEY;
  return key ? `&api_key=${encodeURIComponent(key)}` : "";
}

/** Search PubMed for a query, returning up to `maxResults` PMIDs (relevance-sorted). */
async function searchPmids(query: string, maxResults: number): Promise<string[]> {
  const url =
    `${EUTILS_BASE}/esearch.fcgi?db=pubmed&retmode=json&sort=relevance` +
    `&retmax=${maxResults}&term=${encodeURIComponent(query)}${apiKeyParam()}`;

  const { signal, cancel } = withTimeout(FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`PubMed search failed: HTTP ${res.status}`);
    const data = await res.json();
    const ids: unknown = data?.esearchresult?.idlist;
    return Array.isArray(ids) ? ids.map(String) : [];
  } finally {
    cancel();
  }
}

/** Fetch full article records (title/journal/year/abstract/type) for a set of PMIDs. */
async function fetchArticles(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];
  const url =
    `${EUTILS_BASE}/efetch.fcgi?db=pubmed&rettype=abstract&retmode=xml` +
    `&id=${pmids.join(",")}${apiKeyParam()}`;

  const { signal, cancel } = withTimeout(FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`PubMed fetch failed: HTTP ${res.status}`);
    const xml = await res.text();
    return parseArticles(xml);
  } finally {
    cancel();
  }
}

/** Search then fetch in one call; the public entry point for ingestion. */
export async function searchAndFetch(
  query: string,
  maxResults: number,
): Promise<PubMedArticle[]> {
  const pmids = await searchPmids(query, maxResults);
  return fetchArticles(pmids);
}

/** Map PubMed's publication-type strings onto our evidence-level taxonomy. */
export function evidenceLevelFor(publicationTypes: string[]): EvidenceLevel {
  const types = publicationTypes.map((t) => t.toLowerCase());
  if (types.some((t) => t.includes("guideline"))) return "guideline";
  if (types.some((t) => t.includes("systematic review") || t.includes("meta-analysis"))) {
    return "review";
  }
  return "study";
}

// ---- XML extraction ----
// eutils returns entity-escaped XML (&amp; &lt; &gt; &quot; &#39; and numeric
// entities). No external XML parser dependency: fields are extracted with
// targeted regexes against the known PubmedArticleSet schema.

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#(\d+)|(\w+));/g, (_match, _whole, numeric, named) => {
    if (numeric !== undefined) return String.fromCodePoint(Number(numeric));
    return ENTITIES[named] ?? _match;
  });
}

/**
 * Decode entities and strip any remaining tags (e.g. <i>, <sup> inside
 * titles). Decode BEFORE stripping: real eutils XML has literal formatting
 * sub-elements, but this order also safely handles an entity-escaped tag
 * (`&lt;i&gt;`) by decoding it to a literal tag first, then removing it —
 * either way no stray angle-bracket markup reaches the UI.
 */
function cleanText(s: string): string {
  return decodeEntities(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function extractTag(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1] : undefined;
}

function extractAllTags(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

function splitArticles(xml: string): string[] {
  const re = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

function extractYear(articleXml: string): number {
  const pubDate = extractTag(articleXml, "PubDate") ?? "";
  const yearMatch = pubDate.match(/<Year>(\d{4})<\/Year>/) ?? pubDate.match(/(\d{4})/);
  if (yearMatch) return Number(yearMatch[1]);
  const medlineDate = extractTag(articleXml, "MedlineDate") ?? "";
  const fallback = medlineDate.match(/(\d{4})/);
  return fallback ? Number(fallback[1]) : new Date().getFullYear();
}

function extractAbstract(articleXml: string): string {
  const abstractBlock = extractTag(articleXml, "Abstract");
  if (!abstractBlock) return "";
  const re = /<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g;
  const parts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(abstractBlock)) !== null) {
    const attrs = m[1];
    const labelMatch = attrs.match(/Label="([^"]*)"/);
    const text = cleanText(m[2]);
    if (!text) continue;
    parts.push(labelMatch ? `${labelMatch[1]}: ${text}` : text);
  }
  return parts.join(" ");
}

function parseArticle(articleXml: string): PubMedArticle | null {
  const pmid = extractTag(articleXml, "PMID");
  const titleRaw = extractTag(articleXml, "ArticleTitle");
  const abstract = extractAbstract(articleXml);
  if (!pmid || !titleRaw || !abstract) return null;

  const journalBlock = extractTag(articleXml, "Journal") ?? "";
  const journal = cleanText(extractTag(journalBlock, "Title") ?? "PubMed");
  const publicationTypeBlock = extractTag(articleXml, "PublicationTypeList") ?? "";
  const publicationTypes = extractAllTags(publicationTypeBlock, "PublicationType").map(cleanText);

  return {
    pmid: cleanText(pmid),
    title: cleanText(titleRaw),
    journal,
    year: extractYear(articleXml),
    abstract,
    publicationTypes,
  };
}

function parseArticles(xml: string): PubMedArticle[] {
  return splitArticles(xml)
    .map(parseArticle)
    .filter((a): a is PubMedArticle => a !== null);
}
