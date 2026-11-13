import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { school } from '@/lib/school';

export const metadata: Metadata = { title: 'History — Thuso' };

const SHOWN = 30;
const MS_PER_SECOND = 1_000;
const STATUS = {
  running: '● Running',
  completed: '✓ Complete',
  stopped: '■ Stopped early',
  failed: '! Failed',
} as const;

/** Every run Thuso did: what was asked, what came out, and a replay of each. */
export default async function HistoryPage() {
  await requireUser(['teacher', 'principal', 'admin']);
  const { runs } = await school();
  const list = await runs.list(SHOWN);
  return (
    <>
      <section>
        <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">History</p>
        <h1 className="font-display text-6xl font-extrabold uppercase leading-none">
          Thuso&apos;s work
        </h1>
        <p className="mt-2 max-w-2xl">
          Every run is saved with its full log. Open one to replay it — the agents planning, the
          Reviewer catching mistakes, the fixes and the delivery.
        </p>
      </section>
      {list.length === 0 ? (
        <p className="rounded-card bg-white p-4 shadow-card">
          No runs yet.{' '}
          <Link href="/run" className="font-semibold underline">
            Start one
          </Link>
          .
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {list.map((run) => (
            <li key={run.id}>
              <Link
                href={`/portal/runs/${run.id}`}
                className="flex flex-col gap-2 rounded-card bg-white p-4 shadow-card hover:bg-jacaranda-50"
              >
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-display text-2xl font-extrabold uppercase">
                    Grade {run.grade} · {run.startedAt}
                  </span>
                  <span className="font-mono text-sm">
                    {STATUS[run.status]} · {Math.round(run.durationMs / MS_PER_SECOND)} s ·{' '}
                    {run.provider ?? 'model'}
                  </span>
                </span>
                <span className="text-sm">{run.goal}</span>
                <span className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-leaf px-2 py-0.5">
                    ✓ {run.delivered} delivered
                  </span>
                  <span className="rounded-full bg-ember-500 px-2 py-0.5">
                    ⚑ {run.flags} caught
                  </span>
                  <span className="rounded-full bg-sun px-2 py-0.5">↻ {run.fixes} fixed</span>
                  <span className="rounded-full bg-jacaranda-50 px-2 py-0.5">
                    Human interventions: {run.humanInterventions}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
