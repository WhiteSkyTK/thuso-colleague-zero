import type { Metadata } from 'next';
import Link from 'next/link';
import { AddTaskForm } from '@/components/lecturer/AddTaskForm';
import { SubjectInsightCard } from '@/components/lecturer/SubjectInsightCard';
import { SiteNav } from '@/components/ui/SiteNav';
import { buildClassInsights } from '@/core/insights/classInsights';
import { classStore } from '@/lib/classStore';

export const metadata: Metadata = { title: 'Lecturer — Thuso' };
export const dynamic = 'force-dynamic';

const KIND_LABEL = { homework: 'Homework', test: 'Test', 'past-paper': 'Past paper' } as const;

export default function LecturerPage() {
  const { data, tasks, riskThreshold } = classStore();
  const insights = buildClassInsights(data, riskThreshold);
  const subjectName = new Map(data.subjects.map((subject) => [subject.id, subject.name]));
  const atRiskCount = new Set(
    insights.subjects.flatMap((subject) => subject.atRisk.map((l) => l.learnerId)),
  ).size;
  const stats = [
    { label: 'Learners', value: insights.learnerCount },
    { label: 'Subjects', value: insights.subjects.length },
    { label: 'Need support', value: atRiskCount },
    { label: 'Tasks set', value: tasks.length },
  ];

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-12 sm:px-6">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
              Lecturer · {data.teacher.name}
            </p>
            <h1 className="font-display text-6xl font-extrabold uppercase leading-none">
              Your class today
            </h1>
          </div>
          <Link
            href="/run"
            className="rounded-full bg-ember-700 px-6 py-3 font-bold text-white shadow-card"
          >
            Let Thuso write the catch-up plans
          </Link>
        </section>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-card bg-white p-4 shadow-card">
              <dt className="text-sm">{stat.label}</dt>
              <dd className="font-display text-5xl font-extrabold">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="subjects-heading" className="flex flex-col gap-4">
          <h2 id="subjects-heading" className="font-display text-4xl font-extrabold uppercase">
            Every subject
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {insights.subjects.map((insight) => (
              <SubjectInsightCard key={insight.subjectId} insight={insight} />
            ))}
          </div>
        </section>

        <section aria-labelledby="tasks-heading" className="grid gap-4 lg:grid-cols-2">
          <AddTaskForm subjects={data.subjects} />
          <div className="flex flex-col gap-2">
            <h2 id="tasks-heading" className="font-display text-4xl font-extrabold uppercase">
              Tasks set
            </h2>
            <ul className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
              {[...tasks].reverse().map((task) => (
                <li key={task.id} className="rounded-card bg-white px-4 py-3 shadow-card">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm">
                    {subjectName.get(task.subjectId)} · {KIND_LABEL[task.kind]} · week {task.week} ·{' '}
                    {task.topics.join(', ')}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
