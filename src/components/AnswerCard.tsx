"use client";

import { useState } from "react";
import type { Answer } from "@/lib/types";
import { EvidenceBadge } from "@/components/EvidenceBadge";

function FeedbackRow({ questionId }: { questionId: number }) {
  const [sent, setSent] = useState<null | boolean>(null);

  async function send(helpful: boolean) {
    setSent(helpful); // optimistic; logging feedback is best-effort
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, helpful }),
      });
    } catch {
      // Feedback is non-critical; stay silent.
    }
  }

  if (sent !== null) {
    return <span className="text-[11px] text-muted">Thanks for the feedback.</span>;
  }
  return (
    <span className="inline-flex items-center gap-2 text-[11px] text-muted">
      Was this helpful?
      <button
        onClick={() => send(true)}
        className="rounded border border-border px-2 py-0.5 hover:border-accent transition-colors"
        aria-label="Helpful"
      >
        👍
      </button>
      <button
        onClick={() => send(false)}
        className="rounded border border-border px-2 py-0.5 hover:border-accent transition-colors"
        aria-label="Not helpful"
      >
        👎
      </button>
    </span>
  );
}

/** Renders one grounded answer: either cited passages or an honest abstention. */
export function AnswerCard({ answer }: { answer: Answer }) {
  const abstained = answer.status === "abstained";

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full ${
            abstained ? "bg-amber-500" : "bg-accent"
          }`}
          aria-hidden
        />
        <p className={`text-sm ${abstained ? "text-foreground" : "text-muted"}`}>
          {answer.headline}
        </p>
      </div>

      {answer.passages.map(({ chunk, source, score }) => (
        <div
          key={chunk.id}
          className="rounded-lg border border-border bg-background/50 p-3 space-y-2"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-foreground">{chunk.topic}</span>
            <EvidenceBadge level={source.evidence} />
            <span className="ml-auto text-[11px] text-muted tabular-nums">
              match {(Math.min(score, 1) * 100).toFixed(0)}%
            </span>
          </div>

          <p className="text-[15px] leading-relaxed">{chunk.text}</p>

          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
          >
            {source.title} — {source.publisher}, {source.year} ↗
          </a>
        </div>
      ))}

      {answer.sources.length > 1 && (
        <div className="text-xs text-muted">
          {answer.sources.length} sources cited.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-[11px] text-muted">{answer.disclaimer}</p>
        {typeof answer.questionId === "number" && (
          <FeedbackRow questionId={answer.questionId} />
        )}
      </div>
    </div>
  );
}
