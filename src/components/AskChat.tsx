"use client";

import { useState } from "react";
import Link from "next/link";
import type { Answer } from "@/lib/types";
import { AnswerCard } from "@/components/AnswerCard";

interface Turn {
  question: string;
  answer: Answer | null; // null while loading
  error?: string;
}

const SUGGESTIONS = [
  "Adult CPR compression rate and depth?",
  "How do I give adrenaline in anaphylaxis?",
  "Diagnostic criteria for diabetes",
  "Order of draw for blood tubes",
  "First hour management of septic shock",
];

export function AskChat() {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);

  async function ask(question: string) {
    const q = question.trim();
    if (q.length === 0 || busy) return;

    setInput("");
    setBusy(true);
    setTurns((prev) => [...prev, { question: q, answer: null }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Request failed." }));
        throw new Error(error ?? "Request failed.");
      }
      const answer: Answer = await res.json();
      setTurns((prev) =>
        prev.map((t, i) => (i === prev.length - 1 ? { ...t, answer } : t)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setTurns((prev) =>
        prev.map((t, i) => (i === prev.length - 1 ? { ...t, error: message } : t)),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {turns.length === 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Try one of these
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:border-accent hover:text-accent transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {turns.map((turn, i) => (
          <div key={i} className="space-y-2">
            <p className="font-serif text-lg font-semibold">{turn.question}</p>
            {turn.error ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">
                {turn.error}
              </div>
            ) : turn.answer ? (
              <div className="space-y-1.5">
                <AnswerCard answer={turn.answer} />
                {typeof turn.answer.questionId === "number" && (
                  <Link
                    href={`/q/${turn.answer.questionId}`}
                    className="inline-block text-xs text-accent hover:underline"
                  >
                    Permanent link to this question ↗
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted animate-pulse">
                Searching vetted sources…
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a clinical or lab question…"
          className="flex-1 rounded-md border border-border bg-card px-4 py-3 text-[15px] outline-none focus:border-accent"
          aria-label="Your question"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length === 0}
          className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-ink disabled:opacity-40 transition-opacity"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
