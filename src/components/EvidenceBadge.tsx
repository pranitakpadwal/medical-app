import type { EvidenceLevel } from "@/lib/types";

const LABELS: Record<EvidenceLevel, { text: string; className: string }> = {
  guideline: {
    text: "Guideline",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  review: {
    text: "Systematic review",
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  study: {
    text: "Single study",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  textbook: {
    text: "Textbook / consensus",
    className: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  },
};

/** A small colour-coded label showing how strong a cited source is. */
export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const { text, className } = LABELS[level];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
    >
      {text}
    </span>
  );
}
