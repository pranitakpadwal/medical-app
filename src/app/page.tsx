import Link from "next/link";
import { AskChat } from "@/components/AskChat";
import { getPublicStats } from "@/lib/db";

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

export default async function AskPage() {
  const stats = await getPublicStats();

  return (
    <div className="space-y-10">
      <section className="space-y-4 pt-2 pb-2">
        <p className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          साक्ष्य · evidence, not guesswork
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
          Ask a clinical question. Get a cited answer.
        </h1>
        <p className="text-sm sm:text-base text-muted max-w-2xl">
          Every answer is written only from vetted sources — guidelines,
          textbooks, PubMed — with a citation you can check. If the library
          doesn&apos;t cover it yet, Sakshya says so honestly instead of
          guessing.
        </p>

        <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2 text-sm">
          <div>
            <span className="text-xl font-semibold tabular-nums">{stats.sources}</span>{" "}
            <span className="text-muted">sources</span>
          </div>
          <div>
            <span className="text-xl font-semibold tabular-nums">{stats.chunks}</span>{" "}
            <span className="text-muted">passages</span>
          </div>
          <div>
            <span className="text-xl font-semibold tabular-nums">
              {stats.questionsAnswered}
            </span>{" "}
            <span className="text-muted">questions answered</span>
          </div>
        </div>
      </section>

      <AskChat />

      <section className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-border">
        {STEPS.map((s) => (
          <div key={s.n} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs font-semibold">
                {s.n}
              </span>
              <h3 className="text-sm font-semibold">{s.title}</h3>
            </div>
            <p className="text-xs text-muted pl-8">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">Curious what others have asked?</p>
        <Link
          href="/explore"
          className="text-sm font-medium text-accent hover:underline whitespace-nowrap"
        >
          Browse questions →
        </Link>
      </section>
    </div>
  );
}
