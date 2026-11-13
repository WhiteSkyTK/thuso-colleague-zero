'use client';

import { useState } from 'react';
import { ThusoFace } from './ThusoFace';

interface ThusoMascotProps {
  /** What Thuso says, in order; the newest live update can be passed as `live`. */
  readonly tips: readonly string[];
  readonly live?: string;
}

/**
 * Thuso, the on-screen helper: says what is happening and what to do next. Messages are
 * announced politely to screen readers; the viewer can tuck Thuso away at any time.
 */
export function ThusoMascot({ tips, live }: ThusoMascotProps) {
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const message = live ?? tips[index % Math.max(tips.length, 1)] ?? '';

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Show Thuso, your helper"
        className="fixed bottom-4 right-4 z-40 rounded-full bg-white p-1 shadow-card"
      >
        <ThusoFace size={56} />
      </button>
    );
  }

  return (
    <aside
      aria-label="Thuso, your helper"
      className="fixed bottom-4 right-4 z-40 flex max-w-xs items-end gap-2"
    >
      <div
        key={message}
        className="mascot-bubble relative rounded-card bg-white p-3 pr-8 text-sm shadow-card"
      >
        <p role="status" aria-live="polite">
          {message}
        </p>
        <div className="mt-2 flex gap-3 text-xs font-semibold">
          {!live && tips.length > 1 && (
            <button
              type="button"
              onClick={() => setIndex((value) => value + 1)}
              className="underline"
            >
              Next tip
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Hide Thuso"
          className="absolute right-2 top-1 text-lg leading-none"
        >
          ×
        </button>
      </div>
      <ThusoFace isTalking={Boolean(live)} />
    </aside>
  );
}
