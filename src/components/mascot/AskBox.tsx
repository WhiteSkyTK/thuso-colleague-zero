'use client';

import Link from 'next/link';
import { useId, useState, useTransition, type FormEvent } from 'react';
import type { AssistantAnswer } from '@/core/assistant/answerQuestion';

interface AskBoxProps {
  readonly onAsk: (question: string) => Promise<AssistantAnswer>;
  /** Tap-to-ask starters, so nobody faces an empty box. */
  readonly examples: readonly string[];
}

const QUESTION_MAX = 300;

/** The text box in Thuso's bubble: ask anything about your classes (or your own learning). */
export function AskBox({ onAsk, examples }: AskBoxProps) {
  const inputId = useId();
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState<(AssistantAnswer & { question: string }) | null>(null);
  const [isPending, startTransition] = useTransition();

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      return;
    }
    startTransition(async () => {
      const answer = await onAsk(trimmed);
      setReply({ ...answer, question: trimmed });
      setQuestion('');
    });
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ask(question);
  };

  return (
    <div className="mt-3 border-t border-ink/10 pt-2">
      {reply && (
        <div key={reply.question} className="ask-reply mb-2 flex flex-col gap-1">
          <p className="self-end rounded-lg bg-ink px-2 py-1 text-xs text-paper">
            {reply.question}
          </p>
          <p className="whitespace-pre-line rounded-lg bg-jacaranda-50 p-2" aria-live="polite">
            {reply.answer}
          </p>
          {reply.links.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {reply.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border-2 border-ink px-2 py-0.5"
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      {!reply && (
        <div className="mb-2 flex flex-wrap gap-1">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              disabled={isPending}
              onClick={() => ask(example)}
              className="rounded-full bg-jacaranda-50 px-2 py-0.5 text-xs"
            >
              {example}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Ask Thuso a question
        </label>
        <input
          id={inputId}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={QUESTION_MAX}
          placeholder="Ask Thuso…"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full border-2 border-ink/20 bg-white px-3 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={isPending || question.trim().length < 2}
          className="rounded-full bg-jacaranda-500 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
        >
          {isPending ? <span className="thinking">…</span> : 'Ask'}
        </button>
      </form>
    </div>
  );
}
