"use client";

import { useState } from "react";
import type { CaseStudy } from "@/data/cases";
import { SOURCES } from "@/data/sources";
import { EvidenceBadge } from "@/components/EvidenceBadge";

export function CaseCard({ study }: { study: CaseStudy }) {
  const [revealed, setRevealed] = useState(false);
  const sources = study.sourceIds
    .map((id) => SOURCES.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
        <span className="text-accent">{study.specialty}</span>
        <span aria-hidden>·</span>
        <span>{study.minutes} min</span>
      </div>

      <h3 className="font-serif text-lg font-bold tracking-tight">{study.title}</h3>
      <p className="text-[15px] leading-relaxed">{study.stem}</p>
      <p className="text-[15px] font-medium">{study.prompt}</p>

      {revealed ? (
        <div className="space-y-3 border-l-2 border-accent/50 pl-4">
          <p className="text-[15px] leading-relaxed">{study.teaching}</p>
          <div className="flex flex-wrap gap-3">
            {sources.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-accent hover:underline"
              >
                <EvidenceBadge level={s.evidence} />
                {s.title} — {s.publisher}, {s.year} ↗
              </a>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent transition-colors"
        >
          Reveal teaching point
        </button>
      )}
    </div>
  );
}
