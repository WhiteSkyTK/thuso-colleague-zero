'use client';

import { useState, useTransition } from 'react';
import type { ActionResult } from '@/app/portal/teacher/actions';
import { FileDrop } from '@/components/files/FileDrop';
import type { SubjectChoice } from '@/components/papers/PaperForm';
import { draftPaper } from '@/core/lessons/draftPaper';

interface QuestionDraft {
  key: number;
  prompt: string;
  answer: string;
  marks: number;
  topic: string;
}

interface PracticeSetFormProps {
  readonly subjects: readonly SubjectChoice[];
  readonly onCreate: (input: unknown) => Promise<ActionResult>;
}

const FIELD = 'w-full rounded-lg border-2 border-ink/20 bg-white px-3 py-2';
const MAX_QUESTIONS = 30;

/** Fresh numbers for drafted questions (Web Crypto: no predictable sequence). */
function pick(min: number, max: number): number {
  const [value = 0] = crypto.getRandomValues(new Uint32Array(1));
  return min + (value % (max - min + 1));
}

/** Build a practice paper: questions with memo answers Thuso marks against, plus the paper file. */
export function PracticeSetForm({ subjects, onCreate }: PracticeSetFormProps) {
  const first = subjects[0];
  const [choice, setChoice] = useState(`${first?.grade}|${first?.id}`);
  const subject = subjects.find((s) => `${s.grade}|${s.id}` === choice);
  const blank = (key: number): QuestionDraft => ({
    key,
    prompt: '',
    answer: '',
    marks: 2,
    topic: subject?.topics[0] ?? '',
  });
  const [title, setTitle] = useState('');
  const [paperUrl, setPaperUrl] = useState('');
  const [questions, setQuestions] = useState<QuestionDraft[]>([blank(1)]);
  const [result, setResult] = useState<ActionResult>({});
  const [isPending, startTransition] = useTransition();

  const change = (key: number, patch: Partial<QuestionDraft>) =>
    setQuestions((list) => list.map((q) => (q.key === key ? { ...q, ...patch } : q)));

  const create = () =>
    startTransition(async () => {
      const outcome = await onCreate({
        grade: subject?.grade,
        subjectId: subject?.id,
        title,
        paperUrl,
        questions: questions.map(({ prompt, answer, marks, topic }) => ({
          prompt,
          answer,
          marks,
          topic,
        })),
      });
      setResult(outcome);
      if (!outcome.error) {
        setTitle('');
        setQuestions([blank(1)]);
      }
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
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
        <label className="flex flex-col gap-1 text-sm font-medium">
          <span>Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. 2024 Paper 1 — functions"
            className={FIELD}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FileDrop
          label="Attach the paper (optional)"
          onUploaded={(file) => setPaperUrl(file.url)}
        />
        <label className="flex flex-col gap-1 text-sm font-medium">
          <span>…or link to it (https://)</span>
          <input
            value={paperUrl}
            onChange={(event) => setPaperUrl(event.target.value)}
            placeholder="https://www.education.gov.za/…"
            className={FIELD}
          />
        </label>
      </div>
      <ol className="flex flex-col gap-3">
        {questions.map((q, at) => (
          <li key={q.key} className="rounded-lg bg-jacaranda-50 p-3">
            <p className="mb-2 font-semibold">Question {at + 1}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span>Question</span>
                <textarea
                  value={q.prompt}
                  rows={2}
                  onChange={(event) => change(q.key, { prompt: event.target.value })}
                  className={FIELD}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Memo answer (or key points split by ;)</span>
                <input
                  value={q.answer}
                  onChange={(event) => change(q.key, { answer: event.target.value })}
                  className={FIELD}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span>Marks</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={q.marks}
                    onChange={(event) => change(q.key, { marks: Number(event.target.value) })}
                    className={FIELD}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Topic</span>
                  <select
                    value={q.topic}
                    onChange={(event) => change(q.key, { topic: event.target.value })}
                    className={FIELD}
                  >
                    {(subject?.topics ?? []).map((topic) => (
                      <option key={topic}>{topic}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => setQuestions((list) => list.filter((x) => x.key !== q.key))}
                className="mt-2 text-sm font-semibold text-ember-700 underline"
              >
                Remove question
              </button>
            )}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            const drafted = draftPaper(subject?.id ?? '', subject?.topics ?? [], pick);
            if (drafted.length > 0) {
              setQuestions(drafted.map((q, at) => ({ key: Date.now() + at, ...q })));
              setTitle((value) => value || `${subject?.name ?? 'Practice'} — practice by Thuso`);
            }
          }}
          className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper"
        >
          ✦ Let Thuso write the questions
        </button>
        <button
          type="button"
          disabled={questions.length >= MAX_QUESTIONS}
          onClick={() => setQuestions((list) => [...list, blank((list.at(-1)?.key ?? 0) + 1)])}
          className="rounded-full border-2 border-ink px-4 py-1.5 font-semibold"
        >
          + Add a question
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={create}
          className="rounded-full bg-jacaranda-500 px-6 py-2 font-bold text-white disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Publish to learners'}
        </button>
      </div>
      <output className="text-sm">{result.error ?? result.message}</output>
    </div>
  );
}
