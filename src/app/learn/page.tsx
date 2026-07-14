import type { Metadata } from "next";
import { CASES } from "@/data/cases";
import { CaseCard } from "@/components/CaseCard";

export const metadata: Metadata = {
  title: "Learn — case studies | Sakshya",
  description:
    "Short clinical case studies for quick revision, each with a guided reveal and cited teaching point.",
};

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-serif text-3xl font-bold tracking-tight">Learn mode</h1>
        <p className="text-sm text-muted">
          No specific question in mind? Work through a short case. Read the
          scenario, think about the prompt, then reveal a teaching point backed
          by the same vetted sources Ask mode uses.
        </p>
      </section>

      <div className="space-y-4">
        {CASES.map((study) => (
          <CaseCard key={study.id} study={study} />
        ))}
      </div>
    </div>
  );
}
