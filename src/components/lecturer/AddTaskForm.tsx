'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

interface SubjectOption {
  id: string;
  name: string;
  topics: readonly string[];
}

const KINDS = [
  { value: 'homework', label: 'Homework' },
  { value: 'test', label: 'Test' },
  { value: 'past-paper', label: 'Past paper practice' },
] as const;

const FIELD = 'rounded-lg border-2 border-ink/20 bg-white px-3 py-2';
const DEFAULT_WEEK = 8;

/** The lecturer sets work in four fields; learners see it on their own page straight away. */
export function AddTaskForm({ subjects }: Readonly<{ subjects: readonly SubjectOption[] }>) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [message, setMessage] = useState('');
  const topics = subjects.find((subject) => subject.id === subjectId)?.topics ?? [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId,
        title: form.get('title'),
        kind: form.get('kind'),
        week: Number(form.get('week')),
        topics: form.getAll('topics'),
      }),
    });
    const result: unknown = await response.json().catch(() => null);
    const error =
      typeof result === 'object' && result !== null && 'error' in result
        ? String(result.error)
        : '';
    setMessage(
      response.ok ? 'Task added — learners can see it now.' : error || 'Could not add the task.',
    );
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="flex flex-col gap-3 rounded-card bg-white p-5 shadow-card"
    >
      <h3 className="font-display text-2xl font-extrabold uppercase">Set a task</h3>
      <label className="flex flex-col gap-1 font-medium">
        Title
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
          Subject
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
          Kind
          <select name="kind" className={FIELD}>
            {KINDS.map((kind) => (
              <option key={kind.value} value={kind.value}>
                {kind.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 font-medium">
          Week
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
        className="self-start rounded-full bg-jacaranda-500 px-6 py-2 font-bold text-white"
      >
        Add task
      </button>
      <p role="status" className="text-sm">
        {message}
      </p>
    </form>
  );
}
