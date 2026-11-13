import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { RunReplay } from '@/components/live-run/RunReplay';
import { requireUser } from '@/lib/auth';
import { school } from '@/lib/school';

export const metadata: Metadata = { title: 'Replay — Thuso' };

/** One saved run, replayed from its recorded log. */
export default async function ReplayPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const [{ id }] = await Promise.all([params, requireUser(['teacher', 'principal', 'admin'])]);
  if (!z.uuid().safeParse(id).success) {
    notFound();
  }
  const { runs } = await school();
  const found = await runs.find(id);
  if (!found) {
    notFound();
  }
  const { run, events } = found;
  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
            Replay · Grade {run.grade} · {run.startedAt} SAST
          </p>
          <h1 className="font-display text-5xl font-extrabold uppercase leading-none">
            {run.goal}
          </h1>
        </div>
        <Link
          href="/portal/runs"
          className="rounded-full bg-white px-4 py-1.5 font-semibold shadow-card"
        >
          ← All runs
        </Link>
      </section>
      <RunReplay events={events} />
    </>
  );
}
