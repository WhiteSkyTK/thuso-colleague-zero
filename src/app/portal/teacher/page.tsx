import type { Metadata } from 'next';
import Link from 'next/link';
import { AddTaskForm } from '@/components/lecturer/AddTaskForm';
import { MarkSheetForm } from '@/components/lecturer/MarkSheetForm';
import { SubjectInsightCard } from '@/components/lecturer/SubjectInsightCard';
import { PortalMascot } from '@/components/mascot/PortalMascot';
import { WatchButton } from '@/components/mascot/WatchButton';
import { MessageList } from '@/components/messages/MessageList';
import { buildClassInsights } from '@/core/insights/classInsights';
import { requireUser } from '@/lib/auth';
import { teacherTips } from '@/lib/mascotTips';
import { CategoryGroups } from '@/components/insights/CategoryGroups';
import { categoriseClass } from '@/core/insights/learnerCategory';
import { classFor, school } from '@/lib/school';

const UPDATED = new Intl.DateTimeFormat('en-ZA', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Africa/Johannesburg',
});
import { addTaskAction, runWatchAction, saveMarksAction } from './actions';

export const metadata: Metadata = { title: 'My classes — Thuso' };

export default async function TeacherPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ grade?: string }> }>) {
  const [user, query, { users, messages, riskThreshold }] = await Promise.all([
    requireUser(['teacher']),
    searchParams,
    school(),
  ]);
  const teaching = await users.teachingOf(user.id);
  const grades = [...new Set(teaching.map((t) => t.grade))];
  const grade = grades.find((g) => String(g) === query.grade) ?? grades[0] ?? 10;
  const mine = new Set(teaching.filter((t) => t.grade === grade).map((t) => t.subjectId));

  const data = await classFor(grade);
  const all = buildClassInsights(data, riskThreshold);
  const insights = { ...all, subjects: all.subjects.filter((s) => mine.has(s.subjectId)) };
  const subjects = data.subjects.filter((s) => mine.has(s.id));
  const tasks = data.tasks.filter((t) => mine.has(t.subjectId));
  const existing = Object.fromEntries(
    data.results
      .filter((r) => mine.has(r.subjectId))
      .map((r) => [`${r.taskId}|${r.topic}|${r.learnerId}`, r.scorePct]),
  );
  const sent = await messages.latestRunFor(grade);
  const atRisk = new Set(insights.subjects.flatMap((s) => s.atRisk.map((l) => l.learnerId))).size;

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
            {user.firstName} {user.lastName} · {subjects.map((s) => s.name).join(', ')}
          </p>
          <h1 className="font-display text-6xl font-extrabold uppercase leading-none">
            Grade {grade} today
          </h1>
        </div>
        <Link
          href={`/run?grade=${grade}`}
          className="rounded-full bg-ember-700 px-6 py-3 font-bold text-white shadow-card"
        >
          Let Thuso write the plans
        </Link>
      </section>

      <WatchButton onWatch={runWatchAction} />
      <nav aria-label="Grades" className="flex gap-2">
        {grades.map((g) => (
          <Link
            key={g}
            href={`/portal/teacher?grade=${g}`}
            aria-current={g === grade ? 'page' : undefined}
            className={`rounded-full px-4 py-1.5 font-semibold ${g === grade ? 'bg-ink text-paper' : 'bg-white shadow-card'}`}
          >
            Grade {g}
          </Link>
        ))}
      </nav>

      <p className="text-sm">
        Grade {grade} · {subjects.map((s) => s.name).join(' and ')} · live from the database,
        updated {UPDATED.format(new Date())}
      </p>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: `Learners in Grade ${grade}`, value: data.learners.length },
          { label: 'At risk in your subjects', value: atRisk },
          { label: 'Tasks you set this term', value: tasks.length },
          { label: 'Topic marks captured', value: Object.keys(existing).length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-card bg-white p-4 shadow-card">
            <dt className="text-sm">{stat.label}</dt>
            <dd className="font-display text-5xl font-extrabold">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <CategoryGroups
        learners={categoriseClass(data, riskThreshold)}
        title={`Grade ${grade} in groups`}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {insights.subjects.map((insight) => (
          <SubjectInsightCard key={insight.subjectId} insight={insight} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MarkSheetForm
          key={grade}
          grade={grade}
          tasks={tasks}
          learners={data.learners.map((l) => ({ id: l.id, name: `${l.firstName} ${l.lastName}` }))}
          existing={existing}
          onSave={saveMarksAction}
        />
        <AddTaskForm
          key={`task-${grade}`}
          grade={grade}
          subjects={subjects}
          onAdd={addTaskAction}
        />
      </div>
      <section aria-labelledby="sent-heading" className="flex flex-col gap-3">
        <h2 id="sent-heading" className="font-display text-4xl font-extrabold uppercase">
          Sent by Thuso · Grade {grade}
        </h2>
        <MessageList
          messages={sent}
          showRecipient
          emptyText="Nothing sent yet for this grade. Press Let Thuso write the plans."
        />
      </section>
      <PortalMascot user={user} tips={teacherTips(insights, grade)} runGrade={grade} />
    </>
  );
}
