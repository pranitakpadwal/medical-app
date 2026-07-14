"use client";

import { useCallback, useState } from "react";

interface Overview {
  stats: { sources: number; chunks: number; questions: number; abstained: number };
  recent: {
    id: number;
    question: string;
    status: string;
    top_score: number;
    helpful: boolean | null;
    created_at: string;
  }[];
}

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent";

export function AdminPanel() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadOverview = useCallback(
    async (adminKey: string) => {
      const res = await fetch("/api/admin/overview", {
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load dashboard.");
      setOverview(data);
    },
    [],
  );

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await loadOverview(key);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock.");
    } finally {
      setBusy(false);
    }
  }

  async function addSource(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
        body: JSON.stringify({
          title: fd.get("title"),
          publisher: fd.get("publisher"),
          year: Number(fd.get("year")),
          url: fd.get("url"),
          evidence: fd.get("evidence"),
          topic: fd.get("topic"),
          keywords: fd.get("keywords"),
          text: fd.get("text"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ingestion failed.");
      setNotice(`Added "${data.sourceId}" as ${data.chunks} searchable passage(s).`);
      form.reset();
      await loadOverview(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingestion failed.");
    } finally {
      setBusy(false);
    }
  }

  async function addFromPubMed(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/admin/pubmed", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
        body: JSON.stringify({
          query: fd.get("query"),
          topic: fd.get("topic"),
          keywords: fd.get("keywords"),
          maxResults: Number(fd.get("maxResults")),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "PubMed ingestion failed.");
      setNotice(
        `Added ${data.count} article(s) from PubMed: ${data.added
          .map((a: { title: string }) => a.title)
          .join("; ")}`,
      );
      form.reset();
      await loadOverview(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PubMed ingestion failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!unlocked) {
    return (
      <form onSubmit={unlock} className="max-w-sm space-y-3">
        <p className="text-sm text-muted">
          Content curation for Sakshya. Enter the admin password.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Admin password"
          className={inputCls}
          aria-label="Admin password"
        />
        <button
          type="submit"
          disabled={busy || key.length === 0}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Unlock
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    );
  }

  return (
    <div className="space-y-8">
      {overview && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              ["Sources", overview.stats.sources],
              ["Passages", overview.stats.chunks],
              ["Questions asked", overview.stats.questions],
              ["Unanswered", overview.stats.abstained],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-card p-3">
              <div className="text-2xl font-semibold tabular-nums">{value}</div>
              <div className="text-xs text-muted">{label}</div>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Add a source</h2>
        <p className="text-xs text-muted">
          Paste text you have the right to use (public guidelines, your own lab
          manuals with permission). It is split into searchable passages that Ask
          mode can quote with this citation.
        </p>
        <form onSubmit={addSource} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input name="title" placeholder="Title (e.g. National STG — Dengue)" required className={inputCls} />
            <input name="publisher" placeholder="Publisher (e.g. MoHFW / ICMR)" required className={inputCls} />
            <input name="year" type="number" placeholder="Year" required className={inputCls} />
            <input name="url" type="url" placeholder="https://… (official source page)" required className={inputCls} />
            <select name="evidence" required className={inputCls} defaultValue="guideline">
              <option value="guideline">Guideline</option>
              <option value="review">Systematic review</option>
              <option value="study">Single study</option>
              <option value="textbook">Textbook / consensus</option>
            </select>
            <input name="topic" placeholder="Topic (e.g. Dengue management)" required className={inputCls} />
          </div>
          <input
            name="keywords"
            placeholder="Keywords, comma-separated (synonyms, abbreviations)"
            className={inputCls}
          />
          <textarea
            name="text"
            placeholder="Paste the source text here…"
            required
            rows={8}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {busy ? "Ingesting…" : "Ingest source"}
          </button>
          {notice && <p className="text-sm text-accent">{notice}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Ingest from PubMed</h2>
        <p className="text-xs text-muted">
          Pull real, citable abstracts straight from PubMed — the fastest way to
          grow the library. One search can add several sources at once.
        </p>
        <form onSubmit={addFromPubMed} className="space-y-3">
          <input
            name="query"
            placeholder="PubMed search (e.g. dengue warning signs management)"
            required
            className={inputCls}
          />
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              name="topic"
              placeholder="Topic label (e.g. Dengue management)"
              required
              className={`${inputCls} sm:col-span-2`}
            />
            <input
              name="maxResults"
              type="number"
              min={1}
              max={10}
              defaultValue={5}
              className={inputCls}
              aria-label="Max results"
            />
          </div>
          <input
            name="keywords"
            placeholder="Keywords, comma-separated (applied to all results in this search)"
            className={inputCls}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {busy ? "Searching PubMed…" : "Search & ingest"}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Recent questions</h2>
        <p className="text-xs text-muted">
          Abstained questions are your content roadmap — add sources that answer them.
        </p>
        <div className="space-y-2">
          {overview?.recent.length === 0 && (
            <p className="text-sm text-muted">No questions logged yet.</p>
          )}
          {overview?.recent.map((q) => (
            <div
              key={q.id}
              className="rounded-lg border border-border bg-card px-3 py-2 flex flex-wrap items-center gap-2 text-sm"
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  q.status === "answered" ? "bg-accent" : "bg-amber-500"
                }`}
                aria-hidden
              />
              <span className="flex-1 min-w-40">{q.question}</span>
              <span className="text-[11px] text-muted">
                {q.status}
                {q.helpful === true && " · 👍"}
                {q.helpful === false && " · 👎"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
