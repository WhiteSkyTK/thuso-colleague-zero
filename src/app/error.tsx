'use client';

import Link from 'next/link';
import { ThusoFace } from '@/components/mascot/ThusoFace';

/** Any page that fails: a calm message, a retry, and a way home — never a raw error. */
export default function ErrorPage({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <ThusoFace size={96} />
      <h1 className="font-display text-5xl font-extrabold uppercase">Oops — that didn’t load</h1>
      <p className="text-lg">
        Something went wrong on our side. It’s not you. Try again, or go back to your page.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-jacaranda-500 px-6 py-2 font-bold text-white"
        >
          Try again
        </button>
        <Link href="/portal" className="rounded-full border-2 border-ink px-6 py-2 font-bold">
          My page
        </Link>
      </div>
    </main>
  );
}
