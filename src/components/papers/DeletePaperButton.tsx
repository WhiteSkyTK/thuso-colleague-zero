'use client';

import { useState, useTransition } from 'react';
import type { ActionResult } from '@/app/portal/teacher/actions';

interface DeletePaperButtonProps {
  readonly target: { id: string; grade: number; subjectId: string; title: string };
  readonly onDelete: (input: unknown) => Promise<ActionResult>;
}

/** Asks first: removing a paper takes it away from every learner's list. */
export function DeletePaperButton({ target, onDelete }: DeletePaperButtonProps) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const remove = () => {
    if (!globalThis.confirm(`Remove “${target.title}” for every learner?`)) {
      return;
    }
    startTransition(async () => {
      const result = await onDelete(target);
      setMessage(result.error ?? result.message ?? '');
    });
  };

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={remove}
        className="rounded-full border-2 border-ember-700 px-3 py-0.5 text-xs font-semibold text-ember-700"
      >
        {isPending ? 'Removing…' : 'Remove'}
      </button>
      <output className="text-xs">{message}</output>
    </span>
  );
}
