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

- `src/lib/db.ts` — Postgres access with graceful absence: when `DATABASE_URL`
  is unset the whole app falls back to the in-memory seed library; when set,
  the schema is created on first use and seeded with the same content.
- `src/lib/retrieval.ts` — two retrieval paths, one behavior. With a database:
  Postgres full-text search (English stemming) does recall, then a lexical
  scorer ranks candidates and drives abstention. Without: pure lexical
  retrieval over the seed library. The next upgrade seam is swapping FTS recall
  for embedding-based semantic search (pgvector) inside `dbRetrieve` only.
- `src/lib/answer.ts` — the grounding engine: retrieve → answer vs. abstain →
  cited passages + safety disclaimer. Logs every question (answered or
  abstained) so the most-asked uncovered topics become the content roadmap.
- `src/data/sources.ts` — the hand-curated seed library (`Source` + `Chunk`
  records) used as fallback and to seed fresh databases.
- `src/app/api/ask/route.ts` — POST `{ question }` → grounded `Answer` JSON.
- `src/app/api/feedback/route.ts` — POST thumbs up/down on an answer.
- `src/app/admin/page.tsx` + `src/app/api/admin/*` — password-protected
  content curation: paste a source (metadata + text) → it is chunked
  (`src/lib/chunking.ts`) and becomes retrievable immediately; dashboard shows
  library stats and recent/unanswered questions.
- `src/app/page.tsx` + `src/components/AskChat.tsx` — **Ask mode** chat UI with
  citations, evidence badges and feedback buttons.
- `src/app/learn/page.tsx` + `src/data/cases.ts` — **Learn mode**, short
  clinical case studies with a guided reveal for "tired mode" revision.
- `src/app/manifest.ts` — PWA manifest so the app installs to a home screen.

## Deployment (Railway)

The app runs with zero configuration (seed library only). To enable the full
Phase 2 features:

1. **Add Postgres:** in your Railway project, **Create → Database →
   PostgreSQL**.
2. **Connect it:** on the app service, add a variable
   `DATABASE_URL = ${{Postgres.DATABASE_URL}}` (reference the database
   service). Railway's private-network URL works; TLS is auto-negotiated
   (`ssl: "prefer"`).
3. **Enable admin:** add a variable `ADMIN_PASSWORD = <a strong password>`.
4. Redeploy. Tables are created and seeded automatically on first request.
5. Open `/admin`, unlock with the password, and start ingesting sources.

| Env var | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | No | Enables the growing library, question logging, feedback, admin. Without it the app serves the built-in seed library. |
| `ADMIN_PASSWORD` | No | Enables `/admin` and the ingestion API. Without it admin endpoints return 501. |

## Content workflow (the real product loop)

1. Students ask questions; every question is logged.
2. `/admin` shows **abstained questions** — the exact list of what students
   need that the library doesn't cover.
3. A curator pastes the relevant vetted source (public guidelines: WHO, ICMR,
   MoHFW/NVBDCP STGs; or lab manuals with permission) with its citation
   metadata. It becomes retrievable immediately — no deploy needed.
4. Re-asking the question now returns a grounded, cited answer.

**Content rights:** only ingest text you may use — public national/international
guidelines and materials with the owner's permission. Not scanned copyrighted
textbooks.

## Roadmap

- **Phase 1 (done):** PWA, Ask mode with grounded/cited answers and honest
  abstention, Learn mode case studies, seed content.
- **Phase 2 (this iteration):** Postgres-backed growing library, FTS retrieval
  with stemming, question logging + unanswered dashboard, answer feedback,
  password-protected ingestion. **Next:** embedding-based semantic retrieval
  (pgvector) and an LLM synthesis layer that phrases retrieved passages into
  prose — only ever over the cited text, never model memory (needs API keys).
- **Phase 3:** verified PG/faculty accounts that endorse or correct answers
  ("verified by a PG" badge), per-answer flagging, WhatsApp bot front-end,
  institution partnerships.

## Important caveats

1. **The bundled seed library is a demonstration set**, not a full clinical
   knowledge base. Source URLs point at the issuing body's landing page rather
   than deep links. Do not rely on it clinically.
2. **Not medical advice and not a clinical decision tool.** It is an
   educational reference that guides users back to guidelines and seniors for
   any patient-specific decision.
3. **Retrieval is lexical + FTS**, so phrasing far from a passage's vocabulary
   may abstain even when a related fact exists — expected until semantic
   search lands.

## Getting started locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Optional: set
`DATABASE_URL` (any Postgres) and `ADMIN_PASSWORD` to exercise the full loop
locally.
