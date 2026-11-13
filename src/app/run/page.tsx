import type { Metadata } from 'next';
import Link from 'next/link';
import { LiveRun } from '@/components/live-run/LiveRun';

export const metadata: Metadata = { title: 'Live run — Thuso' };

export default function RunPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 p-4 sm:p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-4xl font-extrabold uppercase">Thuso · live run</h1>
        <Link href="/" className="underline">
          Home
        </Link>
      </header>
      <LiveRun />
    </main>
  );
}
