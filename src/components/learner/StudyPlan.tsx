import Link from 'next/link';
import type { StudyDay } from '@/core/lessons/studyPlan';
import { FORMAT_ICON, FORMAT_LABEL } from '@/lib/labels';

interface StudyPlanProps {
  readonly days: readonly StudyDay[];
  readonly grade: number;
  readonly isOwnPage: boolean;
}

/** The learner's personal two-week plan: one lesson a day, each a tap away. */
export function StudyPlan({ days, grade, isOwnPage }: StudyPlanProps) {
  if (days.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="plan-heading" className="flex flex-col gap-3">
      <div>
        <h2 id="plan-heading" className="font-display text-4xl font-extrabold uppercase">
          {isOwnPage ? 'My 2-week study plan' : '2-week study plan'}
        </h2>
        <p className="text-sm">
          Built by Thuso from the subjects that need the most work, in the way{' '}
          {isOwnPage ? 'you learn' : 'this learner learns'} best. About 20 minutes a day.
        </p>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {days.map((day) => (
          <li key={day.label}>
            <Link
              href={`/portal/lesson/${day.resource.id}?grade=${grade}`}
              className="flex h-full flex-col gap-1 rounded-card bg-white p-3 text-sm shadow-card"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-jacaranda-700">
                {day.label}
              </span>
              <span className="font-semibold">
                <span aria-hidden="true">{FORMAT_ICON[day.resource.format]} </span>
                {day.resource.title}
              </span>
              <span>
                {day.subjectName} · {FORMAT_LABEL[day.resource.format]}
              </span>
              <span className="mt-auto pt-1 text-xs font-semibold">→ {day.task}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
