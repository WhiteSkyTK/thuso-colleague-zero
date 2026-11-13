import type { Metadata } from 'next';
import { SiteNav } from '@/components/ui/SiteNav';
import { LiveRun } from '@/components/live-run/LiveRun';

export const metadata: Metadata = { title: 'Live run — Thuso' };

export default function RunPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 pb-12 sm:px-6">
        <h1 className="font-display text-4xl font-extrabold uppercase">Thuso · live run</h1>
        <LiveRun />
      </main>
    </>
  );
}
