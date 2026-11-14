'use client';

import { useState, useTransition } from 'react';
import { NOT_SAVED, orFallback } from '@/lib/orFallback';

interface LessonNotesProps {
  readonly initial: string;
  /** Thuso's summary, for "copy into my notes". */
  readonly summary: string;
  readonly onSave: (text: string) => Promise<{ message: string }>;
}

const MAX_CHARS = 4000;

/** The learner's own notes for this lesson — writing it down helps it stick. */
export function LessonNotes({ initial, summary, onSave }: LessonNotesProps) {
  const [text, setText] = useState(initial);
  const [status, setStatus] = useState('');
  const [isPending, startTransition] = useTransition();
  const save = (value: string) =>
    startTransition(async () =>
      setStatus(
        (
          await orFallback(() => onSave(value), {
            message: `${NOT_SAVED} Your notes are still here.`,
          })
        ).message,
      ),
    );

  return (
    <section className="rounded-card bg-white p-5 shadow-card">
      <label
        htmlFor="lesson-notes"
        className="font-mono text-xs uppercase tracking-widest text-jacaranda-700"
      >
        ✍ My notes
      </label>
      <textarea
        id="lesson-notes"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setStatus('');
        }}
        maxLength={MAX_CHARS}
        rows={6}
        placeholder="Write it in your own words: the key idea, one example, and what you got wrong."
        className="mt-2 w-full rounded-lg border-2 border-ink/20 bg-paper/40 p-3 font-mono text-sm"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => save(text)}
          className="rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-paper"
        >
          {isPending ? 'Saving…' : 'Save my notes'}
        </button>
        <button
          type="button"
          onClick={() => setText((value) => (value ? `${value}\n\n${summary}` : summary))}
          className="rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold"
        >
          📋 Copy Thuso’s summary in
        </button>
        <output className="text-sm font-semibold">{status}</output>
      </div>
    </section>
  );
}
