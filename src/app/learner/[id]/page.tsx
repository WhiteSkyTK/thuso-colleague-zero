import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PathwayFinder } from '@/components/learner/PathwayFinder';
import { SubjectStandingCard } from '@/components/learner/SubjectStandingCard';
import { SiteNav } from '@/components/ui/SiteNav';
import { buildLearnerProfile, tasksForLearner } from '@/core/insights/learnerProfile';
import { classStore } from '@/lib/classStore';
import { DBE_PAST_PAPERS_URL, FORMAT_ICON, FORMAT_LABEL } from '@/lib/labels';

export const metadata: Metadata = { title: 'My page — Thuso' };
export const dynamic = 'force-dynamic';

const KIND_LABEL = { homework: 'Homework', test: 'Test', 'past-paper': 'Past paper' } as const;

export default async function LearnerPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const { data, tasks, riskThreshold } = classStore();
  const profile = buildLearnerProfile(data, id, riskThreshold);
  if (!profile) {
    notFound();
  }
  const { learner, subjects } = profile;
  const subjectName = new Map(data.subjects.map((subject) => [subject.id, subject.name]));
  const myTasks = tasksForLearner(tasks, profile);

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 sm:px-6">
        <section>
          <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
            My page · {learner.id}
          </p>
          <h1 className="font-display text-6xl font-extrabold uppercase leading-none">
            Hi {learner.firstName}!
          </h1>
          <p className="mt-2 text-lg">
            You learn best with{' '}
            {learner.preferredFormats.map((format) => (
              <strong key={format} className="mr-2 rounded-full bg-jacaranda-50 px-3 py-0.5">
                {FORMAT_ICON[format]} {FORMAT_LABEL[format]}
              </strong>
            ))}
            — so that is how Thuso teaches you.
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          {subjects.map((standing) => (
            <SubjectStandingCard key={standing.subjectId} standing={standing} />
          ))}
        </div>

        <section aria-labelledby="tasks-heading" className="flex flex-col gap-3">
          <h2 id="tasks-heading" className="font-display text-4xl font-extrabold uppercase">
            My tasks
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {myTasks.map((task) => (
              <li key={task.id} className="rounded-card bg-white px-4 py-3 shadow-card">
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm">
                  {subjectName.get(task.subjectId)} · {KIND_LABEL[task.kind]} · week {task.week}
                </p>
                {task.kind === 'past-paper' && (
                  <a
                    href={DBE_PAST_PAPERS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold underline"
                  >
                    Open official DBE past papers ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
          <a
            href={DBE_PAST_PAPERS_URL}
            target="_blank"
            rel="noreferrer"
            className="self-start font-semibold underline"
          >
            All Department of Basic Education past papers and memos ↗
          </a>
        </section>

        <PathwayFinder
          initialMarks={subjects.map((standing) => ({
            subject: standing.subjectName,
            percent: standing.averagePct,
          }))}
        />
      </main>
    </>
  );
}
