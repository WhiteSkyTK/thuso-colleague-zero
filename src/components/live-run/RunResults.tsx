import { LearnerCards } from '@/components/learners/LearnerCards';
import type { RunStatus, RunView } from '@/lib/runView';

const STATUS_LABEL: Record<RunStatus, string> = {
  idle: 'ready',
  running: 'running',
  completed: 'complete',
  stopped: 'stopped early',
  failed: 'failed',
};

/** Counters, the teacher's notes and one card per learner — shared by the live run and replays. */
export function RunResults({ view }: Readonly<{ view: RunView }>) {
  return (
    <>
      <dl className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm">
        <div className="flex gap-2">
          <dt>Step</dt>
          <dd className="font-semibold">
            {view.stepIndex} of {view.stepsTotal} · {STATUS_LABEL[view.status]}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt>Mistakes caught</dt>
          <dd className="font-semibold">{view.flags}</dd>
        </div>
        <div className="flex gap-2">
          <dt>Fixed</dt>
          <dd className="font-semibold">{view.fixes}</dd>
        </div>
        <div className="flex gap-2">
          <dt>Human interventions</dt>
          <dd className="font-semibold">{view.humanInterventions}</dd>
        </div>
      </dl>
      {view.error && (
        <p role="alert" className="rounded-card bg-blush p-3 font-medium text-ink">
          {view.error}
        </p>
      )}
      {view.teacherNotes.length > 0 && (
        <section aria-labelledby="teacher-heading" className="rounded-card bg-blush p-4">
          <h2 id="teacher-heading" className="font-display text-2xl font-extrabold uppercase">
            For the teacher
          </h2>
          <ul className="mt-2 list-disc pl-5">
            {view.teacherNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}
      {view.learners.length > 0 && <LearnerCards cards={view.learners} />}
      <p className="sr-only" aria-live="polite">
        {view.announcement}
      </p>
    </>
  );
}
