'use client';

import { useState, useTransition } from 'react';
import type { CheckIn } from '@/core/assistant/checkIns';

interface CheckInCardProps {
  readonly checkIn: CheckIn;
  readonly onAnswer: (input: { id: string; value: string }) => Promise<{ message: string }>;
}

/** Today's one-tap question: how Thuso learns how this learner learns. */
export function CheckInCard({ checkIn, onAnswer }: CheckInCardProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (message) {
    return (
      <p className="ask-reply mt-2 rounded-lg bg-jacaranda-50 p-2 text-xs font-semibold">
        {message}
      </p>
    );
  }
  return (
    <fieldset className="mt-2 rounded-lg bg-jacaranda-50 p-2">
      <legend className="sr-only">Today’s check-in</legend>
      <p className="mb-1 text-xs font-semibold">💬 {checkIn.question}</p>
      <div className="flex flex-wrap gap-1">
        {checkIn.options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await onAnswer({ id: checkIn.id, value: option.value });
                setMessage(result.message);
              })
            }
            className="rounded-full border-2 border-ink/20 bg-white px-2 py-0.5 text-xs"
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
