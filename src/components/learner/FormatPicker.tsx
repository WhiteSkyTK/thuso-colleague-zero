'use client';

import { useState, useTransition } from 'react';
import { LEARNING_FORMATS, type LearningFormat } from '@/core/domain/vocab';
import { FORMAT_ICON, FORMAT_LABEL } from '@/lib/labels';
import { NOT_SAVED, orFallback } from '@/lib/orFallback';

interface FormatPickerProps {
  readonly current: readonly LearningFormat[];
  readonly onSave: (formats: LearningFormat[]) => Promise<{ message: string }>;
}

/** "How I learn best": tick any or all. Thuso keeps the order it has learned, ticks added at the end. */
export function FormatPicker({ current, onSave }: FormatPickerProps) {
  const [chosen, setChosen] = useState<LearningFormat[]>([...current]);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const toggle = (format: LearningFormat) => {
    setMessage('');
    setChosen((list) =>
      list.includes(format) ? list.filter((f) => f !== format) : [...list, format],
    );
  };
  return (
    <details className="rounded-card bg-white p-4 shadow-card">
      <summary className="cursor-pointer font-semibold">✎ Change how I learn best</summary>
      <fieldset className="mt-3 flex flex-col gap-2">
        <legend className="text-sm">
          Tick any or all. Thuso learns which works for you and puts it first.
        </legend>
        <div className="flex flex-wrap gap-2">
          {LEARNING_FORMATS.map((format) => (
            <label
              key={format}
              className="flex cursor-pointer items-center gap-1 rounded-full bg-jacaranda-50 px-3 py-1 text-sm"
            >
              <input
                type="checkbox"
                checked={chosen.includes(format)}
                onChange={() => toggle(format)}
              />
              {FORMAT_ICON[format]} {FORMAT_LABEL[format]}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isPending || chosen.length === 0}
            onClick={() =>
              startTransition(async () =>
                setMessage(
                  (await orFallback(() => onSave(chosen), { message: NOT_SAVED })).message,
                ),
              )
            }
            className="rounded-full bg-jacaranda-500 px-4 py-1.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
          <output className="text-sm font-semibold">{message}</output>
        </div>
      </fieldset>
    </details>
  );
}
