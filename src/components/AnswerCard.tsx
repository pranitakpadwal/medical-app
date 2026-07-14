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
        className="rounded border border-border px-2 py-0.5 hover:border-accent hover:text-accent transition-colors"
        aria-label="Helpful"
      >
        Yes
      </button>
      <button
        onClick={() => send(false)}
        className="rounded border border-border px-2 py-0.5 hover:border-accent hover:text-accent transition-colors"
        aria-label="Not helpful"
      >
        No
      </button>
    </span>
  );
}

/**
 * Renders one grounded answer: either cited passages or an honest abstention.
 * Synthesized prose (sans, upright) is typographically distinct from the
 * verbatim source excerpts (serif, italic, quoted) — a visual reinforcement
 * of the trust promise: this is what was written for you vs. what the
 * source actually says.
 */
export function AnswerCard({ answer }: { answer: Answer }) {
  const abstained = answer.status === "abstained";

  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-5">
      <div className="flex items-start gap-2">
        <span
          className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
            abstained ? "bg-amber-500" : "bg-accent"
          }`}
          aria-hidden
        />
        <p className={`text-sm ${abstained ? "text-foreground" : "text-muted"}`}>
          {answer.headline}
        </p>
      </div>

      {answer.synthesis && (
        <p className="text-[15.5px] leading-relaxed whitespace-pre-wrap">{answer.synthesis}</p>
      )}

      {answer.synthesis && answer.passages.length > 0 && (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Sources</p>
      )}

      <div className="space-y-4">
        {answer.passages.map(({ chunk, source, score }, i) => (
          <div key={chunk.id} className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {answer.synthesis && (
                <span className="text-xs font-bold text-accent tabular-nums">[{i + 1}]</span>
              )}
              <span className="text-xs font-semibold text-foreground">{chunk.topic}</span>
              <EvidenceBadge level={source.evidence} />
              <span className="ml-auto text-[11px] text-muted tabular-nums">
                match {(Math.min(score, 1) * 100).toFixed(0)}%
              </span>
            </div>

            <blockquote className="border-l-2 border-accent/50 pl-4 font-serif text-[15.5px] italic leading-relaxed text-foreground/90">
              {chunk.text}
            </blockquote>

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
      </div>

      {answer.sources.length > 1 && (
        <div className="text-xs text-muted">{answer.sources.length} sources cited.</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <p className="text-[11px] text-muted">{answer.disclaimer}</p>
        {typeof answer.questionId === "number" && (
          <FeedbackRow questionId={answer.questionId} />
        )}
      </div>
    </div>
  );
}
