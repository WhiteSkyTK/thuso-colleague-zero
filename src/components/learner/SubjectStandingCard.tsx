import type { SubjectStanding } from '@/core/insights/learnerProfile';
import { CAUSE_FOR_LEARNER, FORMAT_ICON, FORMAT_LABEL } from '@/lib/labels';

const RUNG_LABEL = {
  foundation: 'Start here',
  guided: 'Guided',
  independent: 'On your own',
  exam: 'Exam level',
} as const;

/** One subject for the learner: marks per topic, what is holding them back, and what to study next. */
export function SubjectStandingCard({ standing }: Readonly<{ standing: SubjectStanding }>) {
  return (
    <article className="flex flex-col gap-4 rounded-card bg-white p-5 shadow-card">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-3xl font-extrabold uppercase">{standing.subjectName}</h2>
        <p className="font-mono text-sm">
          {standing.averagePct}% · CAPS {standing.capsLevel} ({standing.capsLabel})
        </p>
      </header>

      {standing.isAtRisk && (
        <p className="rounded-lg bg-blush p-3">
          <strong>What is holding you back: </strong>
          {CAUSE_FOR_LEARNER[standing.risk.primaryCause]}{' '}
          <span className="text-sm">({standing.risk.evidence})</span>
        </p>
      )}

      <ul
        className="flex flex-col gap-2"
        aria-label={`${standing.subjectName} topics, weakest first`}
      >
        {standing.topics.map((topic) => (
          <li key={topic.topic} className="text-sm">
            <div className="flex justify-between gap-2">
              <span>{topic.topic}</span>
              <span className="font-mono">{topic.scorePct}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-jacaranda-50">
              <div
                className={`bar-fill h-2 rounded-full ${topic.capsLevel <= 2 ? 'bg-ember-500' : 'bg-teal'}`}
                style={{ width: `${topic.scorePct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {standing.suggestions.length > 0 && (
        <section aria-label={`Study next in ${standing.subjectName}`}>
          <h3 className="font-semibold">Study next — in the way you learn best</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {standing.suggestions.map((resource) => (
              <li
                key={resource.id}
                className="flex items-start gap-3 rounded-lg bg-jacaranda-50 p-3 text-sm"
              >
                <span aria-hidden="true" className="text-2xl leading-none">
                  {FORMAT_ICON[resource.format]}
                </span>
                <span>
                  <strong>{resource.title}</strong>
                  <span className="block">
                    {FORMAT_LABEL[resource.format]} · {RUNG_LABEL[resource.rung]} ·{' '}
                    {resource.minutes} min
                    {resource.origin === 'past-paper' && ' · past paper'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
