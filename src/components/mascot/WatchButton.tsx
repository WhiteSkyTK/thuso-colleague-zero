'use client';

import { useState, useTransition } from 'react';
import type { ActionResult } from '@/app/portal/teacher/actions';

/** Runs Thuso's background check now (it also runs every school morning on its own). */
export function WatchButton({ onWatch }: Readonly<{ onWatch: () => Promise<ActionResult> }>) {
  const [result, setResult] = useState<ActionResult>({});
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => setResult(await onWatch()))}
        className="rounded-full bg-jacaranda-500 px-5 py-2 font-bold text-white disabled:opacity-60"
      >
        {isPending ? 'Thuso is checking every learner…' : '🔍 Run the background check now'}
      </button>
      <p role="status" className="text-sm">
        {result.error ?? result.message ?? 'Thuso also checks every grade at 07:00 on school days.'}
      </p>
    </div>
  );
}
