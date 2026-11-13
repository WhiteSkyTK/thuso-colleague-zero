'use client';

import { useState, useTransition, type FormEvent } from 'react';
import type { ActionResult } from '@/app/portal/teacher/actions';

interface SubjectOption {
  id: string;
  name: string;
  topics: readonly string[];
}

interface AddTaskFormProps {
  readonly grade: number;
  readonly subjects: readonly SubjectOption[];
  readonly onAdd: (input: unknown) => Promise<ActionResult>;
}

const KINDS = [
  { value: 'homework', label: 'Homework' },
  { value: 'test', label: 'Test' },
  { value: 'past-paper', label: 'Past paper practice' },
] as const;

const FIELD = 'rounded-lg border-2 border-ink/20 bg-white px-3 py-2';
const DEFAULT_WEEK = 8;

/** The teacher sets work in four fields; learners see it on their page straight away. */
export function AddTaskForm({ grade, subjects, onAdd }: AddTaskFormProps) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [result, setResult] = useState<ActionResult>({});
  const [isPending, startTransition] = useTransition();
  const topics = subjects.find((subject) => subject.id === subjectId)?.topics ?? [];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      grade,
      subjectId,
      title: form.get('title'),
      kind: form.get('kind'),
      week: Number(form.get('week')),
      topics: form.getAll('topics'),
    };
    startTransition(async () => setResult(await onAdd(payload)));
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-card bg-white p-5 shadow-card">
      <h3 className="font-display text-2xl font-extrabold uppercase">Set a task · Grade {grade}</h3>
      <label className="flex flex-col gap-1 font-medium">
        <span>Title</span>
        <input
          name="title"
          required
          maxLength={120}
          placeholder="e.g. Trig ratios worksheet"
          className={FIELD}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 font-medium">
          <span>Subject</span>
          <select
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            className={FIELD}
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 font-medium">
          <span>Kind</span>
          <select name="kind" className={FIELD}>
            {KINDS.map((kind) => (
              <option key={kind.value} value={kind.value}>
                {kind.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 font-medium">
          <span>Week</span>
          <input
            name="week"
            type="number"
            min={1}
            max={52}
            defaultValue={DEFAULT_WEEK}
            required
            className={FIELD}
          />
        </label>
      </div>
      <fieldset className="flex flex-col gap-1">
        <legend className="font-medium">Topics</legend>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <label
              key={topic}
              className="flex items-center gap-1 rounded-full bg-jacaranda-50 px-3 py-1 text-sm"
            >
              <input type="checkbox" name="topics" value={topic} />
              {topic}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full bg-jacaranda-500 px-6 py-2 font-bold text-white disabled:opacity-60"
      >
        {isPending ? 'Adding…' : 'Add task'}
      </button>
      <output className="block text-sm">{result.error ?? result.message}</output>
    </form>
  );
}
