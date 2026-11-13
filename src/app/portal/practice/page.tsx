import type { Metadata } from 'next';
import Link from 'next/link';
import { PortalMascot } from '@/components/mascot/PortalMascot';
import { PracticeSetForm } from '@/components/practice/PracticeSetForm';
import { requireUser } from '@/lib/auth';
import { school } from '@/lib/school';
import { subjectsInView } from '@/lib/subjectsInView';
import { createSetAction } from './actions';

export const metadata: Metadata = { title: 'Practice — Thuso' };

/** Practice papers: teachers build them, learners answer, Thuso marks, teachers confirm. */
export default async function PracticePage() {
  const user = await requireUser();
  const subjects = await subjectsInView(user);
  const { practice } = await school();
  const isLearner = user.role === 'learner';
  const nameOf = new Map(subjects.map((s) => [`${s.grade}|${s.id}`, s.name]));
  const sets = (await practice.sets([...new Set(subjects.map((s) => s.grade))])).filter((set) =>
    nameOf.has(`${set.grade}|${set.subjectId}`),
  );
  const mine = isLearner
    ? new Map(
        await Promise.all(
          sets.map(async (set) => [set.id, await practice.submissionOf(set.id, user.id)] as const),
        ),
      )
    : new Map();
  const counts = isLearner
    ? new Map()
    : new Map(
        await Promise.all(
          sets.map(async (set) => {
            const list = await practice.submissions(set.id);
            return [
              set.id,
              { total: list.length, toVerify: list.filter((s) => s.status !== 'verified').length },
            ] as const;
          }),
        ),
      );

  return (
    <>
      <section>
        <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">Practice</p>
        <h1 className="font-display text-5xl font-extrabold uppercase leading-none sm:text-6xl">
          {isLearner ? 'Practise and get marked' : 'Practice papers'}
        </h1>
        <p className="mt-2 max-w-2xl">
          {isLearner
            ? 'Answer your teachers’ practice papers. Thuso marks them straight away and your teacher confirms the marks.'
            : 'Build a paper with memo answers. Thuso marks every learner, flags anything it is unsure of, and you accept or change the marks.'}
        </p>
      </section>

      {!isLearner && subjects.length > 0 && (
        <details className="rounded-card bg-white p-5 shadow-card" open={sets.length === 0}>
          <summary className="cursor-pointer font-display text-2xl font-extrabold uppercase">
            + Build a practice paper
          </summary>
          <div className="mt-4">
            <PracticeSetForm subjects={subjects} onCreate={createSetAction} />
          </div>
        </details>
      )}

      {sets.length === 0 ? (
        <p className="rounded-card bg-white p-4 shadow-card">
          No practice papers yet.{' '}
          {isLearner ? 'Your teachers will add some soon.' : 'Build the first one above.'}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {sets.map((set) => {
            const submission = mine.get(set.id);
            const count = counts.get(set.id);
            const max = set.questions.reduce((total, q) => total + q.marks, 0);
            return (
              <li key={set.id}>
                <Link
                  href={`/portal/practice/${set.id}`}
                  className="flex h-full flex-col gap-2 rounded-card bg-white p-4 shadow-card hover:bg-jacaranda-50"
                >
                  <span className="font-mono text-xs uppercase tracking-wide text-jacaranda-700">
                    Grade {set.grade} · {nameOf.get(`${set.grade}|${set.subjectId}`)} ·{' '}
                    {set.questions.length} questions · {max} marks
                  </span>
                  <span className="font-display text-2xl font-extrabold uppercase">
                    {set.title}
                  </span>
                  {isLearner ? (
                    <span className="text-sm font-semibold">
                      {!submission && '▶ Not started'}
                      {submission?.status === 'ai-marked' &&
                        `✎ Thuso marked: ${submission.scorePct}% — waiting for your teacher`}
                      {submission?.status === 'verified' && `✓ Confirmed: ${submission.scorePct}%`}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold">
                      {count?.total ?? 0} handed in · {count?.toVerify ?? 0} to verify
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <PortalMascot
        user={user}
        tips={[
          isLearner
            ? 'Try a practice paper: I mark it straight away and show you where you lost marks.'
            : 'I mark every learner’s answers; yellow rows are the ones I want you to check.',
        ]}
      />
    </>
  );
}
