import Link from "next/link";
import { AnswerCard } from "@/components/AnswerCard";
import { AskChat } from "@/components/AskChat";
import { DISCLAIMER } from "@/lib/answer";
import { getPublicStats } from "@/lib/db";
import { CHUNKS, sourceFor } from "@/data/sources";
import type { Answer } from "@/lib/types";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "1",
    title: "Retrieve",
    body: "Every question is matched against a library of vetted guidelines, textbooks and PubMed abstracts.",
  },
  {
    n: "2",
    title: "Cite",
    body: "Answers are written only from what's retrieved — every claim traces back to a numbered source.",
  },
  {
    n: "3",
    title: "Or say so",
    body: "If the library doesn't cover it yet, Sakshya says so honestly instead of guessing.",
  },
];

/** A real answer from the live library, not a mockup — proof before you ask anything yourself. */
function buildExampleAnswer(): Answer {
  const chunk = CHUNKS.find((c) => c.id === "anaphylaxis-adrenaline")!;
  const source = sourceFor(chunk);
  return {
    status: "answered",
    question: "How do I give adrenaline in anaphylaxis?",
    headline: "Grounded in 1 passage from a vetted guideline.",
    passages: [{ chunk, source, score: 1 }],
    sources: [source],
    disclaimer: DISCLAIMER,
  };
}

export default async function AskPage() {
  const stats = await getPublicStats();
  const example = buildExampleAnswer();

  return (
    <div className="space-y-14">
      <section className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-start">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
            साक्ष्य — evidence, not guesswork
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-balance">
            Ask a clinical question. Get a cited answer.
          </h1>
          <p className="text-base text-muted max-w-lg">
            Every answer is written only from vetted sources — guidelines,
            textbooks, PubMed — with a citation you can check. If the library
            doesn&apos;t cover it yet, Sakshya says so honestly instead of
            guessing.
          </p>

          <div className="flex divide-x divide-border rounded border border-border w-fit text-sm">
            <div className="px-4 py-2.5">
              <div className="text-xl font-serif font-bold tabular-nums">{stats.sources}</div>
              <div className="text-[11px] text-muted">sources</div>
            </div>
            <div className="px-4 py-2.5">
              <div className="text-xl font-serif font-bold tabular-nums">{stats.chunks}</div>
              <div className="text-[11px] text-muted">passages</div>
            </div>
            <div className="px-4 py-2.5">
              <div className="text-xl font-serif font-bold tabular-nums">
                {stats.questionsAnswered}
              </div>
              <div className="text-[11px] text-muted">answered</div>
            </div>
          </div>

          <a
            href="#ask"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-ink hover:opacity-90 transition-opacity"
          >
            Ask your first question ↓
          </a>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            See it in action — a real answer from the library
          </p>
          <div className="rounded-lg border-2 border-accent-soft bg-card-raised overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-border bg-background px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-border" aria-hidden />
              <span className="h-2 w-2 rounded-full bg-border" aria-hidden />
              <span className="h-2 w-2 rounded-full bg-border" aria-hidden />
              <span className="ml-2 text-[11px] text-muted font-mono">sakshya.app/q/2</span>
            </div>
            <div className="p-3 space-y-3">
              <p className="font-serif text-base font-semibold px-1">{example.question}</p>
              <AnswerCard answer={example} />
            </div>
          </div>
        </div>
      </section>

      <section id="ask" className="scroll-mt-20 space-y-3">
        <h2 className="font-serif text-xl font-bold">Your turn</h2>
        <AskChat />
      </section>

      <section className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-border">
        {STEPS.map((s) => (
          <div key={s.n} className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-accent text-accent font-serif text-xs font-bold">
                {s.n}
              </span>
              <h3 className="font-serif text-sm font-bold">{s.title}</h3>
            </div>
            <p className="text-xs text-muted pl-[34px]">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-accent-soft p-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">Curious what others have asked?</p>
        <Link
          href="/explore"
          className="text-sm font-semibold text-accent hover:underline whitespace-nowrap"
        >
          Browse questions →
        </Link>
      </section>
    </div>
  );
}
