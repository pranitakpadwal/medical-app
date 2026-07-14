import type { EvidenceLevel } from "@/lib/types";

const LABELS: Record<EvidenceLevel, { text: string; className: string }> = {
  guideline: {
    text: "Guideline",
    className: "border-emerald-600 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300",
  },
  review: {
    text: "Systematic review",
    className: "border-sky-600 text-sky-800 dark:border-sky-400 dark:text-sky-300",
  },
  study: {
    text: "Single study",
    className: "border-accent text-accent",
  },
  textbook: {
    text: "Textbook / consensus",
    className: "border-muted text-muted",
  },
};

/**
 * A small evidence-strength label, styled as an editorial small-caps tag
 * (colored left rule, no fill) rather than a rounded pastel pill.
 */
export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const { text, className } = LABELS[level];
  return (
    <span
      className={`inline-flex items-center border-l-2 pl-1.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}
    >
      {text}
    </span>
  );
}
