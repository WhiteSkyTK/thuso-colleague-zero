'use client';

import { useState, useTransition } from 'react';

interface LessonFeedbackProps {
  readonly onAnswer: (helped: boolean) => Promise<{ message: string }>;
}

/** "Did this help?" — the answer teaches Thuso which format works for this learner. */
export function LessonFeedback({ onAnswer }: LessonFeedbackProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const answer = (helped: boolean) =>
    startTransition(async () => setMessage((await onAnswer(helped)).message));

  if (message) {
    return <p className="ask-reply rounded-card bg-jacaranda-50 p-4 font-semibold">{message}</p>;
  }
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-card bg-jacaranda-50 p-4">
      <p className="font-semibold">Did this help?</p>
      <button
        type="button"
        disabled={isPending}
        onClick={() => answer(true)}
        className="rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-paper"
      >
        👍 Yes
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => answer(false)}
        className="rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold"
      >
        👎 Not yet
      </button>
    </div>
  );
}
