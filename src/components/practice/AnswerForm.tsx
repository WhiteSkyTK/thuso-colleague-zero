'use client';

import { useState, useTransition } from 'react';
import type { SubmitResult } from '@/app/portal/practice/actions';
import { FileDrop } from '@/components/files/FileDrop';

interface AnswerFormProps {
  readonly setId: string;
  readonly questions: readonly { id: string; prompt: string; marks: number; topic: string }[];
  readonly onSubmit: (input: unknown) => Promise<SubmitResult>;
}

const FIELD = 'w-full rounded-lg border-2 border-ink/20 bg-white px-3 py-2';

/** Answer each question, add a photo of your working if you like, and hand in for marking. */
export function AnswerForm({ setId, questions, onSubmit }: AnswerFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [workUrl, setWorkUrl] = useState('');
  const [result, setResult] = useState<SubmitResult>({});
  const [isPending, startTransition] = useTransition();

  const submit = () =>
    startTransition(async () =>
      setResult(
        await onSubmit({
          setId,
          workUrl,
          answers: questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? '' })),
        }),
      ),
    );

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-3">
        {questions.map((q, at) => (
          <li key={q.id} className="rounded-card bg-white p-4 shadow-card">
            <p className="font-mono text-xs uppercase tracking-wide text-jacaranda-700">
              Question {at + 1} · {q.marks} marks · {q.topic}
            </p>
            <p className="my-2 whitespace-pre-wrap font-medium">{q.prompt}</p>
            <label className="flex flex-col gap-1 text-sm">
              <span className="sr-only">Your answer to question {at + 1}</span>
              <textarea
                rows={2}
                maxLength={1000}
                value={answers[q.id] ?? ''}
                onChange={(event) =>
                  setAnswers((current) => ({ ...current, [q.id]: event.target.value }))
                }
                placeholder="Your answer"
                className={FIELD}
              />
            </label>
          </li>
        ))}
      </ol>
      <FileDrop
        label="Add a photo or PDF of your working (optional)"
        onUploaded={(file) => setWorkUrl(file.url)}
      />
      <button
        type="button"
        disabled={isPending}
        onClick={submit}
        className="self-start rounded-full bg-ember-700 px-8 py-3 text-lg font-bold text-white disabled:opacity-60"
      >
        {isPending ? 'Thuso is marking…' : 'Hand in'}
      </button>
      <output className="block rounded-card bg-blush p-3 empty:hidden">
        {result.error ??
          (result.max
            ? `${result.message} Thuso's mark: ${result.awarded}/${result.max}.`
            : result.message)}
      </output>
    </div>
  );
}
