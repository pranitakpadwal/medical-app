import type { Answer } from "@/lib/types";
import { EvidenceBadge } from "@/components/EvidenceBadge";

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

      <p className="text-[11px] text-muted border-t border-border pt-3">
        {answer.disclaimer}
      </p>
    </div>
  );
}
