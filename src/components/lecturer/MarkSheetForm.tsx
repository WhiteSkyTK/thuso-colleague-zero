'use client';

import { useState, useTransition } from 'react';
import type { ActionResult } from '@/app/portal/teacher/actions';

export interface MarkSheetTask {
  id: string;
  title: string;
  topics: readonly string[];
}

interface MarkSheetFormProps {
  readonly grade: number;
  readonly tasks: readonly MarkSheetTask[];
  readonly learners: readonly { id: string; name: string }[];
  /** Existing marks keyed `taskId|topic|learnerId`. */
  readonly existing: Readonly<Record<string, number>>;
  readonly onSave: (input: unknown) => Promise<ActionResult>;
}

const FIELD = 'rounded-lg border-2 border-ink/20 bg-white px-2 py-1';

/** Capture a whole class's marks for one task topic; blanks are skipped, saved marks can be corrected. */
export function MarkSheetForm({ grade, tasks, learners, existing, onSave }: MarkSheetFormProps) {
  const [taskId, setTaskId] = useState(tasks.at(-1)?.id ?? '');
  const task = tasks.find((candidate) => candidate.id === taskId);
  const [topic, setTopic] = useState(task?.topics[0] ?? '');
  const activeTopic = task?.topics.includes(topic) ? topic : (task?.topics[0] ?? '');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ActionResult>({});
  const [isPending, startTransition] = useTransition();

  const keyOf = (learnerId: string) => `${taskId}|${activeTopic}|${learnerId}`;
  const valueOf = (learnerId: string) =>
    draft[keyOf(learnerId)] ?? String(existing[keyOf(learnerId)] ?? '');
  // The React Compiler memoises this; a class is at most a few dozen learners anyway.
  const filled = learners.flatMap(({ id }) => {
    const raw = valueOf(id);
    return raw.trim() === '' ? [] : [{ learnerId: id, scorePct: Number(raw) }];
  });

  const save = () =>
    startTransition(async () =>
      setResult(await onSave({ grade, taskId, topic: activeTopic, marks: filled })),
    );

  return (
    <section
      className="flex flex-col gap-3 rounded-card bg-white p-5 shadow-card"
      aria-labelledby="marks-heading"
    >
      <h3 id="marks-heading" className="font-display text-2xl font-extrabold uppercase">
        Mark sheet · Grade {grade}
      </h3>
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          <span>Task</span>
          <select
            value={taskId}
            onChange={(event) => setTaskId(event.target.value)}
            className={FIELD}
          >
            {tasks.map((option) => (
              <option key={option.id} value={option.id}>
                {option.id} · {option.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          <span>Topic</span>
          <select
            value={activeTopic}
            onChange={(event) => setTopic(event.target.value)}
            className={FIELD}
          >
            {(task?.topics ?? []).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <ul className="grid max-h-80 grid-cols-1 gap-1 overflow-y-auto pr-1 sm:grid-cols-2">
        {learners.map((learner) => (
          <li key={learner.id} className="flex items-center justify-between gap-2 text-sm">
            <label htmlFor={`mark-${learner.id}`}>{learner.name}</label>
            <input
              id={`mark-${learner.id}`}
              type="number"
              min={0}
              max={100}
              value={valueOf(learner.id)}
              onChange={(event) =>
                setDraft((current) => ({ ...current, [keyOf(learner.id)]: event.target.value }))
              }
              className={`${FIELD} w-20`}
            />
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={save}
        disabled={isPending || filled.length === 0}
        className="self-start rounded-full bg-jacaranda-500 px-6 py-2 font-bold text-white disabled:opacity-60"
      >
        {isPending ? 'Saving…' : `Save ${filled.length} marks`}
      </button>
      <output className="block text-sm">{result.error ?? result.message}</output>
    </section>
  );
}
