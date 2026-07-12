# MedCheck — fact-checked answers for medical students

A mobile-friendly web app where final-year medical students (and, later, PGs)
can ask clinical and lab questions and get answers that are **grounded only in
vetted sources, with citations** — or an honest "not covered yet" when the
library doesn't have a trustworthy source. Built with Next.js (App Router) and
installable to a phone home screen as a PWA.

It exists because students told us the status quo is hours in the library and
still no confident, source-backed answer. The design goal is the opposite of a
chatbot that sounds sure: **no answer without a citation, and abstention over
guessing.**

## Why grounded, not generative

The whole point is trust for a clinical audience, so the answering engine never
free-generates medical content. It:

1. **Retrieves** the most relevant passages from a vetted source library.
2. **Answers only from those passages**, quoting them and linking the source
   (issuing body, year, evidence level).
3. **Abstains** when retrieval confidence is below threshold — telling the user
   to ask faculty rather than inventing an answer
   (`src/lib/answer.ts`, `ABSTAIN_THRESHOLD`).
4. Shows an **evidence label** on every source (guideline > systematic review >
   single study > textbook) so the reader can judge strength at a glance.
5. Frames everything as an **educational reference, not medical advice**, in the
   UI itself — not buried in fine print.

This mirrors the approach that made tools like OpenEvidence trusted by
clinicians: every answer carries its citations.

## How it works

- `src/data/sources.ts` — the vetted library: `Source` records (issuing body,
  year, URL, evidence level) and `Chunk` records (the retrievable, quotable
  text). **This is currently a small hand-curated demonstration seed set** of
  well-established teaching facts, so the end-to-end flow works with no API keys
  or database. In production this table is replaced by chunked, embedded text
  from real ingested sources.
- `src/lib/retrieval.ts` — dependency-free lexical retrieval over the seed
  library. This is the single seam to swap for embedding-based semantic search
  (e.g. Postgres + pgvector); everything downstream only consumes
  `RetrievedPassage[]`.
- `src/lib/answer.ts` — the grounding engine: retrieve → decide answer vs.
  abstain → return cited passages with the safety disclaimer.
- `src/app/api/ask/route.ts` — POST `{ question }` → grounded `Answer` JSON.
- `src/app/page.tsx` + `src/components/AskChat.tsx` — **Ask mode**, a chat UI
  that renders each answer with citations and evidence badges.
- `src/app/learn/page.tsx` + `src/data/cases.ts` — **Learn mode**, short
  clinical case studies with a guided reveal for "tired mode" revision.
- `src/app/manifest.ts` — PWA manifest so the app installs to a home screen.

## Roadmap

- **Phase 1 (this repo):** PWA, Ask mode with grounded/cited answers and honest
  abstention, Learn mode case studies, seed content.
- **Phase 2 — real content + trust layer:** ingestion pipeline (chunk + embed
  national guidelines, standard textbooks, PubMed, uploaded lab manuals);
  semantic retrieval via pgvector; verified PG/faculty accounts who can endorse
  or correct answers ("verified by a PG" badge); per-answer flagging; analytics
  on most-asked questions to drive the content roadmap.
- **Phase 3 — scale:** LLM synthesis layer that phrases retrieved passages into
  prose (only ever over the cited text, never model memory); WhatsApp bot as a
  second front-end; institution partnerships.

## Important caveats

1. **The source library here is a demonstration seed**, not a full clinical
   knowledge base. Facts are stable teaching points; source URLs point at the
   issuing body's landing page rather than deep links, so nothing pretends to be
   a verified deep citation it is not. Do not rely on it clinically.
2. **Not medical advice and not a clinical decision tool.** It is an educational
   reference that guides users back to guidelines and seniors for any
   patient-specific decision.
3. **Retrieval is currently lexical**, so phrasing far from the seed keywords
   may abstain even when a related fact exists — expected until semantic search
   lands in Phase 2.

## Getting started locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

Any Next.js host works (Railway, Vercel). No environment variables are required
for the seed-content version. When the Phase 2 ingestion pipeline and a real
LLM synthesis step are added, their API keys and database URL are read from
`process.env`.
