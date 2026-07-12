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
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="font-medium text-foreground">{study.specialty}</span>
        <span>·</span>
        <span>{study.minutes} min</span>
      </div>

      <h3 className="text-lg font-semibold tracking-tight">{study.title}</h3>
      <p className="text-[15px] leading-relaxed">{study.stem}</p>
      <p className="text-[15px] font-medium">{study.prompt}</p>

      {revealed ? (
        <div className="space-y-3 rounded-lg border border-border bg-background/50 p-3">
          <p className="text-[15px] leading-relaxed">{study.teaching}</p>
          <div className="flex flex-wrap gap-2">
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
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:border-accent transition-colors"
        >
          Reveal teaching point
        </button>
      )}
    </div>
  );
}
