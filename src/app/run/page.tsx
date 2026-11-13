import type { Metadata } from 'next';
import Link from 'next/link';
import { LiveRun } from '@/components/live-run/LiveRun';
import { SiteNav } from '@/components/ui/SiteNav';
import { GRADES } from '@/core/domain/schoolUser';

export const metadata: Metadata = { title: 'Live run — Thuso' };

export default async function RunPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ grade?: string }> }>) {
  const { grade: asked } = await searchParams;
  const grade = GRADES.find((g) => String(g) === asked) ?? GRADES[0];
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 pb-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-4xl font-extrabold uppercase">Thuso · live run</h1>
          <nav aria-label="Grade" className="flex gap-2">
            {GRADES.map((g) => (
              <Link
                key={g}
                href={`/run?grade=${g}`}
                aria-current={g === grade ? 'page' : undefined}
                className={`rounded-full px-4 py-1.5 font-semibold ${g === grade ? 'bg-ink text-paper' : 'bg-white shadow-card'}`}
              >
                Grade {g}
              </Link>
            ))}
          </nav>
        </div>
        <LiveRun grade={grade} />
      </main>
    </>
  );
}
