import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { PortalMascot } from '@/components/mascot/PortalMascot';
import { AnswerForm } from '@/components/practice/AnswerForm';
import { ReviewSubmission } from '@/components/practice/ReviewSubmission';
import { requireUser } from '@/lib/auth';
import { classFor, school } from '@/lib/school';
import { submitAnswersAction, verifyMarksAction } from '../actions';

export const metadata: Metadata = { title: 'Practice paper — Thuso' };

/** Learners answer (or see their marks); teachers review every hand-in and confirm the marks. */
export default async function PracticeSetPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const [{ id }, user] = await Promise.all([params, requireUser()]);
  if (!z.uuid().safeParse(id).success) {
    notFound();
  }
  const { practice } = await school();
  const set = await practice.set(id);
  if (!set || (user.role === 'learner' && user.grade !== set.grade)) {
    notFound();
  }
  const data = await classFor(set.grade);
  const subjectName = data.subjects.find((s) => s.id === set.subjectId)?.name ?? set.subjectId;
  const isLearner = user.role === 'learner';
  const mine = isLearner ? await practice.submissionOf(set.id, user.id) : undefined;
  const all = isLearner ? [] : await practice.submissions(set.id);
  const nameOf = new Map(data.learners.map((l) => [l.id, `${l.firstName} ${l.lastName}`]));
  const finalOf = (questionId: string) => mine?.final?.[questionId];

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
            Practice · Grade {set.grade} · {subjectName}
          </p>
          <h1 className="font-display text-5xl font-extrabold uppercase leading-none">
            {set.title}
          </h1>
        </div>
        <span className="flex flex-wrap gap-2">
          {set.paperUrl && (
            <a
              href={set.paperUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-ember-700 px-4 py-1.5 font-bold text-white"
            >
              Open the paper ↗
            </a>
          )}
          <Link
            href="/portal/practice"
            className="rounded-full bg-white px-4 py-1.5 font-semibold shadow-card"
          >
            ← All practice
          </Link>
        </span>
      </section>

      {isLearner && !mine && (
        <AnswerForm
          setId={set.id}
          questions={set.questions.map(({ id: qid, prompt, marks, topic }) => ({
            id: qid,
            prompt,
            marks,
            topic,
          }))}
          onSubmit={submitAnswersAction}
        />
      )}

      {isLearner && mine && (
        <section className="flex flex-col gap-3" aria-label="Your marks">
          <p className="rounded-card bg-white p-4 text-lg font-semibold shadow-card">
            {mine.status === 'verified'
              ? `✓ Your teacher confirmed ${mine.scorePct}%.`
              : `✎ Thuso marked ${mine.scorePct}%. Your teacher will confirm the marks soon.`}
          </p>
          <ol className="flex flex-col gap-2">
            {set.questions.map((q, at) => {
              const proposed = mine.proposed.find((m) => m.questionId === q.id);
              const awarded = finalOf(q.id) ?? proposed?.awarded ?? 0;
              return (
                <li key={q.id} className="rounded-card bg-white p-4 shadow-card">
                  <p className="font-mono text-xs uppercase text-jacaranda-700">
                    Question {at + 1} · {awarded}/{q.marks}
                  </p>
                  <p className="font-medium">{q.prompt}</p>
                  <p className="text-sm">
                    Your answer: {mine.answers.find((a) => a.questionId === q.id)?.answer || '—'}
                  </p>
                  <p className="text-sm">{proposed?.reason}</p>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {!isLearner && (
        <section className="flex flex-col gap-3" aria-label="Hand-ins">
          <h2 className="font-display text-3xl font-extrabold uppercase">
            Hand-ins ({all.length})
          </h2>
          {all.length === 0 && (
            <p className="rounded-card bg-white p-4 shadow-card">No learner has handed in yet.</p>
          )}
          {all.map((submission) => (
            <ReviewSubmission
              key={submission.id}
              setId={set.id}
              learnerName={nameOf.get(submission.learnerId) ?? submission.learnerId}
              questions={set.questions}
              submission={submission}
              onVerify={verifyMarksAction}
            />
          ))}
        </section>
      )}
      <PortalMascot
        user={user}
        tips={[
          isLearner
            ? 'Write each answer in its box. Thuso checks numbers, the memo wording and the key points.'
            : 'Yellow rows: Thuso was unsure. Change any mark, then save — it goes into the learner’s record.',
        ]}
      />
    </>
  );
}
