'use client';

import { useState } from 'react';
import type { SubjectMark } from '@/core/pathways/recommendPathways';

/** Common NSC subjects a learner may add next to the ones the school already has marks for. */
const OTHER_SUBJECTS = [
  'English Home Language',
  'English First Additional Language',
  'isiZulu Home Language',
  'Sesotho Home Language',
  'Afrikaans First Additional Language',
  'Life Sciences',
  'Geography',
  'History',
  'Accounting',
  'Business Studies',
  'Information Technology',
  'Computer Applications Technology',
  'Life Orientation',
] as const;

const FIELD = 'rounded-lg border-2 border-ink/20 bg-white px-2 py-1 text-ink';
const DEFAULT_PERCENT = 60;
const clampPercent = (value: number) =>
  Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

interface MarksEditorProps {
  readonly marks: readonly SubjectMark[];
  readonly onChange: (marks: SubjectMark[]) => void;
}

/** Edit, add and remove subject marks. */
export function MarksEditor({ marks, onChange }: MarksEditorProps) {
  const available = OTHER_SUBJECTS.filter(
    (subject) => !marks.some((mark) => mark.subject === subject),
  );
  const [newSubject, setNewSubject] = useState<string>(available[0] ?? '');
  const chosen = available.includes(newSubject as (typeof OTHER_SUBJECTS)[number])
    ? newSubject
    : (available[0] ?? '');

  const update = (index: number, percent: number) =>
    onChange(
      marks.map((mark, at) => (at === index ? { ...mark, percent: clampPercent(percent) } : mark)),
    );

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {marks.map((mark, index) => (
          <li key={mark.subject} className="flex items-center justify-between gap-2">
            <label htmlFor={`mark-${index}`}>{mark.subject}</label>
            <span className="flex items-center gap-1">
              <input
                id={`mark-${index}`}
                type="number"
                min={0}
                max={100}
                value={mark.percent}
                onChange={(event) => update(index, Number(event.target.value))}
                className={`${FIELD} w-20`}
              />
              <button
                type="button"
                aria-label={`Remove ${mark.subject}`}
                onClick={() => onChange(marks.filter((_, at) => at !== index))}
                className="rounded-full px-2 text-lg"
              >
                ×
              </button>
            </span>
          </li>
        ))}
      </ul>
      {chosen && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="new-subject" className="sr-only">
            Subject to add
          </label>
          <select
            id="new-subject"
            value={chosen}
            onChange={(event) => setNewSubject(event.target.value)}
            className={FIELD}
          >
            {available.map((subject) => (
              <option key={subject}>{subject}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onChange([...marks, { subject: chosen, percent: DEFAULT_PERCENT }])}
            className="rounded-full bg-jacaranda-500 px-3 py-1 text-sm font-semibold text-white"
          >
            + Add subject
          </button>
        </div>
      )}
    </div>
  );
}
