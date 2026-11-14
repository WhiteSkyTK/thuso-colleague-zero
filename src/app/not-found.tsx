import Link from 'next/link';
import { ThusoFace } from '@/components/mascot/ThusoFace';

/** A link that goes nowhere: say so plainly and show the way back. */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <ThusoFace size={96} />
      <h1 className="font-display text-5xl font-extrabold uppercase">I can’t find that page</h1>
      <p className="text-lg">The link may be old, or the page has moved. Let’s get you back.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/portal"
          className="rounded-full bg-jacaranda-500 px-6 py-2 font-bold text-white"
        >
          My page
        </Link>
        <Link href="/" className="rounded-full border-2 border-ink px-6 py-2 font-bold">
          Home
        </Link>
      </div>
    </main>
  );
}
