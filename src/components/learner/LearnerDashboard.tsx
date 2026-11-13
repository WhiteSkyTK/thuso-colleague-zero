import type { Task } from '@/core/domain/classData';
import type { LearnerProfile } from '@/core/insights/learnerProfile';
import { DBE_PAST_PAPERS_URL, FORMAT_ICON, FORMAT_LABEL } from '@/lib/labels';
import { PathwayFinder } from './PathwayFinder';
import { SubjectStandingCard } from './SubjectStandingCard';

const KIND_LABEL = { homework: 'Homework', test: 'Test', 'past-paper': 'Past paper' } as const;

interface LearnerDashboardProps {
  readonly profile: LearnerProfile;
  readonly tasks: readonly Task[];
  readonly subjectNames: ReadonlyMap<string, string>;
  /** "Hi Refilwe!" for the learner; the learner's name for staff. */
  readonly isOwnPage: boolean;
}

/** Everything about one learner: standing per subject, why they slip, what to study, tasks, future. */
export function LearnerDashboard({
  profile,
  tasks,
  subjectNames,
  isOwnPage,
}: LearnerDashboardProps) {
  const { learner, subjects } = profile;
  return (
    <>
      <section>
        <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
          {isOwnPage ? 'My page' : 'Learner'} · {learner.id} · Grade {learner.grade}
        </p>
        <h1 className="font-display text-6xl font-extrabold uppercase leading-none">
          {isOwnPage ? `Hi ${learner.firstName}!` : `${learner.firstName} ${learner.lastName}`}
        </h1>
        <p className="mt-2 text-lg">
          {isOwnPage ? 'You learn' : 'Learns'} best with{' '}
          {learner.preferredFormats.map((format) => (
            <strong key={format} className="mr-2 rounded-full bg-jacaranda-50 px-3 py-0.5">
              {FORMAT_ICON[format]} {FORMAT_LABEL[format]}
            </strong>
          ))}
          — so that is how Thuso teaches.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {subjects.map((standing) => (
          <SubjectStandingCard key={standing.subjectId} standing={standing} />
        ))}
      </div>

      <section aria-labelledby="tasks-heading" className="flex flex-col gap-3">
        <h2 id="tasks-heading" className="font-display text-4xl font-extrabold uppercase">
          {isOwnPage ? 'My tasks' : 'Tasks'}
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {tasks.map((task) => (
            <li key={task.id} className="rounded-card bg-white px-4 py-3 shadow-card">
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm">
                {subjectNames.get(task.subjectId)} · {KIND_LABEL[task.kind]} · week {task.week}
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
    </>
  );
}
