'use client';

import Link from 'next/link';
import { demoGoalFor } from '@/core/config/constants';
import { useRunStream } from '@/hooks/useRunStream';
import { narrationFor } from '@/lib/worldSpeed';

/** The live run inside Thuso's bubble: one button, then step-by-step narration and counters. */
export function MascotRun({ grade }: Readonly<{ grade: number }>) {
  const { view, start } = useRunStream(grade);
  const isRunning = view.status === 'running';
  const line = narrationFor(view.events);

  if (view.status === 'idle') {
    return (
      <button
        type="button"
        onClick={() => void start(demoGoalFor(grade))}
        className="mt-2 w-full rounded-full bg-ember-700 px-3 py-1.5 text-xs font-bold text-white"
      >
        ▶ Run Thuso for Grade {grade}
      </button>
    );
  }

  return (
    <div
      className="mt-2 flex flex-col gap-1 border-t border-ink/10 pt-2 text-xs"
      aria-live="polite"
    >
      <p className="font-mono">
        {isRunning ? '● Working' : '✓ Done'} · step {view.stepIndex}/{view.stepsTotal} · ⚑{' '}
        {view.flags} · ↻ {view.fixes} · 👤 {view.humanInterventions}
      </p>
      {line && <p className="line-clamp-3">{line}</p>}
      {view.error && <p role="alert">{view.error}</p>}
      {!isRunning && (
        <span className="flex gap-3 font-semibold">
          <Link href="/portal/runs" className="underline">
            See it in History
          </Link>
          <button
            type="button"
            onClick={() => void start(demoGoalFor(grade))}
            className="underline"
          >
            Run again
          </button>
        </span>
      )}
    </div>
  );
}
