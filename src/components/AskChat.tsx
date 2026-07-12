"use client";

import { useState } from "react";
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
          <p className="text-sm text-muted">Try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-accent transition-colors"
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
            <div className="flex justify-end">
              <p className="rounded-2xl rounded-br-sm bg-accent px-4 py-2 text-sm text-white max-w-[85%]">
                {turn.question}
              </p>
            </div>
            {turn.error ? (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm">
                {turn.error}
              </div>
            ) : turn.answer ? (
              <AnswerCard answer={turn.answer} />
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted animate-pulse">
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
        className="sticky bottom-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a clinical or lab question…"
          className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-[15px] outline-none focus:border-accent"
          aria-label="Your question"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length === 0}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white disabled:opacity-40 transition-opacity"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
