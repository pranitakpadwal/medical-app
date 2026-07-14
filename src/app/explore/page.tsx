import type { Metadata } from "next";
import Link from "next/link";
import { listQuestions } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore questions | Sakshya",
  description:
    "Browse clinical and lab questions other students have asked, with cited answers.",
};

export default async function ExplorePage() {
  const dbAvailable = Boolean(process.env.DATABASE_URL);
  const questions = dbAvailable ? await listQuestions(100) : [];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Explore</h1>
        <p className="text-sm text-muted">
          Questions other students have asked, most-asked first. Tap one to see
          its cited answer.
        </p>
      </section>

      {!dbAvailable && (
        <p className="text-sm text-muted rounded-xl border border-border bg-card p-4">
          Explore isn&apos;t enabled on this deployment yet — it needs a database.
        </p>
      )}

      {dbAvailable && questions.length === 0 && (
        <p className="text-sm text-muted rounded-xl border border-border bg-card p-4">
          No questions asked yet — be the first on the{" "}
          <Link href="/" className="text-accent hover:underline">
            Ask page
          </Link>
          .
        </p>
      )}

      <div className="space-y-2">
        {questions.map((q) => (
          <Link
            key={q.id}
            href={`/q/${q.id}`}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-accent transition-colors"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                q.status === "answered" ? "bg-accent" : "bg-amber-500"
              }`}
              aria-hidden
            />
            <span className="flex-1 text-sm">{q.question}</span>
            <span className="text-xs text-muted tabular-nums shrink-0">
              asked {q.ask_count}×
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
