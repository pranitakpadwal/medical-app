import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnswerCard } from "@/components/AnswerCard";
import { getQuestionById, passagesForIds } from "@/lib/db";
import { DISCLAIMER } from "@/lib/answer";
import type { Answer, Source } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function dedupeSources(sources: Source[]): Source[] {
  const seen = new Map<string, Source>();
  for (const s of sources) {
    if (!seen.has(s.id)) seen.set(s.id, s);
  }
  return [...seen.values()];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await getQuestionById(Number(id));
  if (!row) return { title: "Question not found | Sakshya" };
  return {
    title: `${row.question} | Sakshya`,
    description:
      row.synthesis?.slice(0, 155) ??
      `Asked ${row.ask_count} time${row.ask_count === 1 ? "" : "s"} on Sakshya — evidence-based answers for Indian medical students.`,
  };
}

export default async function QuestionPage({ params }: Props) {
  const { id } = await params;
  const row = await getQuestionById(Number(id));
  if (!row) notFound();

  const passages = row.status === "answered" ? await passagesForIds(row.passage_ids) : [];

  const answer: Answer = {
    status: row.status,
    question: row.question,
    questionId: row.id,
    headline:
      row.status === "answered"
        ? `Asked ${row.ask_count} time${row.ask_count === 1 ? "" : "s"} · grounded in ${passages.length} passage${passages.length === 1 ? "" : "s"}`
        : `Not yet covered — asked ${row.ask_count} time${row.ask_count === 1 ? "" : "s"}. Ask your PG or faculty, and we'll prioritise adding a vetted source for it.`,
    passages,
    sources: dedupeSources(passages.map((p) => p.source)),
    synthesis: row.synthesis ?? undefined,
    disclaimer: DISCLAIMER,
  };

  return (
    <div className="space-y-4">
      <Link href="/explore" className="text-sm text-accent hover:underline">
        ← Back to Explore
      </Link>
      <h1 className="font-serif text-2xl font-bold tracking-tight">{row.question}</h1>
      <AnswerCard answer={answer} />
    </div>
  );
}
