import { AskChat } from "@/components/AskChat";
import { CHUNKS } from "@/data/sources";

export default function AskPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Ask a question, get a fact-checked answer
        </h1>
        <p className="text-sm text-muted">
          Every answer is composed only from vetted sources and shown with its
          citation and evidence level. If nothing in the library covers your
          question, MedCheck says so instead of guessing — currently grounded in{" "}
          {CHUNKS.length} seed passages.
        </p>
      </section>

      <AskChat />
    </div>
  );
}
