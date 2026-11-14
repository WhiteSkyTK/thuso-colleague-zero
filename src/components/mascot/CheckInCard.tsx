'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { AssistantLink } from '@/core/assistant/answerQuestion';
import type { CheckIn } from '@/core/assistant/checkIns';

export interface CheckInReply {
  message: string;
  links: AssistantLink[];
}

interface CheckInCardProps {
  readonly checkIn: CheckIn;
  readonly onAnswer: (input: { id: string; value: string }) => Promise<CheckInReply>;
}

/** Today's one-tap question. Thuso answers by doing something: a lesson, a plan, a word to the teacher. */
export function CheckInCard({ checkIn, onAnswer }: CheckInCardProps) {
  const [reply, setReply] = useState<CheckInReply | null>(null);
  const [isPending, startTransition] = useTransition();

  if (reply) {
    return (
      <div className="ask-reply mt-2 flex flex-col gap-2 rounded-lg bg-jacaranda-50 p-2 text-xs">
        <p className="font-semibold">{reply.message}</p>
        {reply.links.length > 0 && (
          <div className="flex flex-wrap gap-2 font-semibold">
            {reply.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border-2 border-ink bg-white px-2 py-0.5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
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
                setReply(await onAnswer({ id: checkIn.id, value: option.value }));
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
