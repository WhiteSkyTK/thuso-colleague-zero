'use client';

import { useState, useTransition, type FormEvent } from 'react';
import type { ActionResult } from '@/app/portal/teacher/actions';
import { FileDrop } from '@/components/files/FileDrop';
import type { PastPaper } from '@/core/school/PastPaperRepository';

export interface SubjectChoice {
  grade: number;
  id: string;
  name: string;
  topics: readonly string[];
}

interface PaperFormProps {
  readonly subjects: readonly SubjectChoice[];
  readonly onSave: (input: unknown) => Promise<ActionResult>;
  /** Editing an existing paper; adding a new one when absent. */
  readonly paper?: PastPaper;
}

const FIELD = 'w-full rounded-lg border-2 border-ink/20 bg-white px-3 py-2';
const PAPERS = ['Paper 1', 'Paper 2', 'Paper 3'] as const;
const CURRENT_YEAR = 2025;

/** Add or edit a past paper: subject, year, paper, title, links and topics. */
export function PaperForm({ subjects, onSave, paper }: PaperFormProps) {
  const first = subjects[0];
  const [choice, setChoice] = useState(
    paper ? `${paper.grade}|${paper.subjectId}` : `${first?.grade}|${first?.id}`,
  );
  const [url, setUrl] = useState(paper?.url ?? '');
  const [memoUrl, setMemoUrl] = useState(paper?.memoUrl ?? '');
  const [result, setResult] = useState<ActionResult>({});
  const [isPending, startTransition] = useTransition();
  const subject = subjects.find((s) => `${s.grade}|${s.id}` === choice);
  const saveLabel = paper ? 'Save changes' : 'Add paper';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const outcome = await onSave({
        id: paper?.id,
        grade: subject?.grade,
        subjectId: subject?.id,
        year: Number(form.get('year')),
        paper: form.get('paper'),
        title: form.get('title'),
        url: form.get('url'),
        memoUrl: form.get('memoUrl'),
        topics: form.getAll('topics'),
      });
      setResult(outcome);
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span>Grade and subject</span>
        <select
          value={choice}
          onChange={(event) => setChoice(event.target.value)}
          className={FIELD}
        >
          {subjects.map((s) => (
            <option key={`${s.grade}|${s.id}`} value={`${s.grade}|${s.id}`}>
              Grade {s.grade} · {s.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          <span>Year</span>
          <input
            name="year"
            type="number"
            min={2008}
            max={2030}
            defaultValue={paper?.year ?? CURRENT_YEAR}
            required
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          <span>Paper</span>
          <select name="paper" defaultValue={paper?.paper ?? 'Paper 1'} className={FIELD}>
            {PAPERS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          <span>Title</span>
          <input
            name="title"
            required
            minLength={3}
            maxLength={120}
            defaultValue={paper?.title ?? 'NSC November'}
            className={FIELD}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FileDrop label="Upload the paper" onUploaded={(file) => setUrl(file.url)} />
        <FileDrop label="Upload the memo (optional)" onUploaded={(file) => setMemoUrl(file.url)} />
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span>…or link to the paper (https://)</span>
        <input
          name="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.education.gov.za/…"
          className={FIELD}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span>…and to the memo (optional)</span>
        <input
          name="memoUrl"
          value={memoUrl}
          onChange={(event) => setMemoUrl(event.target.value)}
          className={FIELD}
        />
      </label>
      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm font-medium">Topics it covers</legend>
        <div className="flex flex-wrap gap-2">
          {(subject?.topics ?? []).map((topic) => (
            <label
              key={topic}
              className="flex items-center gap-1 rounded-full bg-jacaranda-50 px-3 py-1 text-sm"
            >
              <input
                type="checkbox"
                name="topics"
                value={topic}
                defaultChecked={paper?.topics.includes(topic)}
              />
              <span>{topic}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full bg-jacaranda-500 px-6 py-2 font-bold text-white disabled:opacity-60"
      >
        {isPending ? 'Saving…' : saveLabel}
      </button>
      <output className="text-sm">{result.error ?? result.message}</output>
    </form>
  );
}
