import { AskChat } from "@/components/AskChat";
import { CHUNKS } from "@/data/sources";
import { getDb } from "@/lib/db";

// Library size comes from the database when one is configured.
export const dynamic = "force-dynamic";

async function libraryCount(): Promise<number> {
  try {
    const sql = await getDb();
    if (sql) {
      const [{ count }] = await sql<[{ count: string }]>`SELECT count(*) FROM chunks`;
      return Number(count);
    }
  } catch (err) {
    console.error("MedCheck: failed to count library.", err);
  }
  return CHUNKS.length;
}

export default async function AskPage() {
  const count = await libraryCount();
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
          {count} vetted passage{count === 1 ? "" : "s"}.
        </p>
      </section>

      <AskChat />
    </div>
  );
}
