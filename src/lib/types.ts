// Shared types for the grounded medical Q&A app.

/** How strong the underlying source is, roughly ordered strongest → weakest. */
export type EvidenceLevel =
  | "guideline" // national/international clinical guideline
  | "review" // systematic review / meta-analysis
  | "study" // single primary study
  | "textbook"; // standard reference textbook / consensus

/** A vetted source document that answers can cite. */
export interface Source {
  id: string;
  /** Human-readable title, e.g. "AHA Adult Basic Life Support Guidelines". */
  title: string;
  /** Publisher / issuing body, e.g. "American Heart Association". */
  publisher: string;
  /** Publication or revision year. */
  year: number;
  /** Where a reader can verify this. */
  url: string;
  evidence: EvidenceLevel;
}

/** A retrievable chunk of source text. Answers are composed only from these. */
export interface Chunk {
  id: string;
  sourceId: string;
  /** Short topic label used for grouping/UI. */
  topic: string;
  /** Extra search terms that should match this chunk (synonyms, abbreviations). */
  keywords: string[];
  /** The actual grounded text that gets quoted back to the user. */
  text: string;
}

/** A chunk paired with its resolved source and retrieval score. */
export interface RetrievedPassage {
  chunk: Chunk;
  source: Source;
  score: number;
}

export type AnswerStatus = "answered" | "abstained";

/** The full response returned by the answering engine. */
export interface Answer {
  status: AnswerStatus;
  question: string;
  /** One-line framing of what was found (or why we abstained). */
  headline: string;
  /** Grounded passages, strongest match first. Empty when abstained. */
  passages: RetrievedPassage[];
  /** Distinct sources cited across the passages. */
  sources: Source[];
  /** Always present — the safety framing shown with every answer. */
  disclaimer: string;
}
