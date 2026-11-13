'use client';

import { useState, useTransition } from 'react';
import type { ActionResult } from '@/app/portal/teacher/actions';
import type { Question } from '@/core/marking/markAnswers';
import type { Submission } from '@/core/school/PracticeRepository';

interface ReviewSubmissionProps {
  readonly setId: string;
  readonly learnerName: string;
  readonly questions: readonly Question[];
  readonly submission: Submission;
  readonly onVerify: (input: unknown) => Promise<ActionResult>;
}

const FIELD = 'w-16 rounded-lg border-2 border-ink/20 bg-white px-2 py-1';

/** One learner's answers next to the memo and Thuso's proposed marks: accept them or change any. */
export function ReviewSubmission({
  setId,
  learnerName,
  questions,
  submission,
  onVerify,
}: ReviewSubmissionProps) {
  const proposed = new Map(submission.proposed.map((m) => [m.questionId, m]));
  const answers = new Map(submission.answers.map((a) => [a.questionId, a.answer]));
  const start =
    submission.final ??
    Object.fromEntries(submission.proposed.map((m) => [m.questionId, m.awarded]));
  const [final, setFinal] = useState<Record<string, number>>(start);
  const [result, setResult] = useState<ActionResult>({});
  const [isPending, startTransition] = useTransition();
  const total = Object.values(final).reduce((sum, mark) => sum + mark, 0);
  const max = questions.reduce((sum, q) => sum + q.marks, 0);
  const toCheck = submission.proposed.filter((m) => !m.isConfident).length;

  const verify = (marks: Record<string, number>) =>
    startTransition(async () =>
      setResult(await onVerify({ setId, learnerId: submission.learnerId, final: marks })),
    );

  return (
    <details
      className="rounded-card bg-white p-4 shadow-card"
      open={submission.status !== 'verified' && toCheck > 0}
    >
      <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2">
        <span className="font-semibold">{learnerName}</span>
        <span className="text-sm">
          {submission.status === 'verified' ? '✓ Verified' : `Thuso: ${submission.scorePct}%`}
          {submission.status !== 'verified' && toCheck > 0 && ` · ${toCheck} to check`} ·{' '}
          {submission.createdAt}
        </span>
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10">
              <th className="py-1 pr-2">Q</th>
              <th className="py-1 pr-2">Answer</th>
              <th className="py-1 pr-2">Memo</th>
              <th className="py-1 pr-2">Thuso</th>
              <th className="py-1">Mark</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, at) => {
              const mark = proposed.get(q.id);
              return (
                <tr
                  key={q.id}
                  className={`border-b border-ink/5 align-top ${mark && !mark.isConfident ? 'bg-sun/20' : ''}`}
                >
                  <td className="py-2 pr-2 font-mono">{at + 1}</td>
                  <td className="py-2 pr-2">{answers.get(q.id) || '—'}</td>
                  <td className="py-2 pr-2">{q.answer}</td>
                  <td className="py-2 pr-2">
                    {mark?.awarded}/{q.marks}
                    <span className="block text-xs">{mark?.reason}</span>
                  </td>
                  <td className="py-2">
                    <label>
                      <span className="sr-only">Final mark for question {at + 1}</span>
                      <input
                        type="number"
                        min={0}
                        max={q.marks}
                        value={final[q.id] ?? 0}
                        onChange={(event) =>
                          setFinal((current) => ({
                            ...current,
                            [q.id]: Number(event.target.value),
                          }))
                        }
                        className={FIELD}
                      />
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {submission.workUrl && (
        <a
          href={submission.workUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm font-semibold underline"
        >
          Open the learner&apos;s working ↗
        </a>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            verify(Object.fromEntries(submission.proposed.map((m) => [m.questionId, m.awarded])))
          }
          className="rounded-full bg-leaf px-4 py-1.5 text-sm font-bold text-ink"
        >
          ✓ Accept Thuso&apos;s marks
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => verify(final)}
          className="rounded-full bg-jacaranda-500 px-4 py-1.5 text-sm font-bold text-white"
        >
          Save my marks ({total}/{max})
        </button>
        <output className="text-sm">{result.error ?? result.message}</output>
      </div>
    </details>
  );
}
