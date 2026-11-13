import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Role } from '@/core/domain/schoolUser';
import { requireUser } from '@/lib/auth';
import { signOut } from '../login/actions';

const LINKS: Record<Role, readonly { href: string; label: string }[]> = {
  learner: [{ href: '/portal/learner', label: 'My page' }],
  teacher: [
    { href: '/portal/teacher', label: 'My classes' },
    { href: '/run', label: 'Live run' },
  ],
  principal: [
    { href: '/portal/principal', label: 'School' },
    { href: '/run', label: 'Live run' },
  ],
  admin: [
    { href: '/portal/admin', label: 'Admin' },
    { href: '/portal/principal', label: 'School' },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  learner: 'Learner',
  teacher: 'Teacher',
  principal: 'Principal',
  admin: 'Admin',
};

/** Every portal page needs a signed-in user; the header shows who and where they can go. */
export default async function PortalLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await requireUser();
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-2xl font-extrabold uppercase tracking-wide">
          Thuso
        </Link>
        <nav aria-label="Portal" className="flex flex-wrap items-center gap-2">
          {LINKS[user.role].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 font-semibold hover:bg-jacaranda-50"
            >
              {link.label}
            </Link>
          ))}
          <span className="rounded-full bg-jacaranda-50 px-3 py-1 text-sm">
            {ROLE_LABEL[user.role]} · {user.firstName} {user.lastName}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border-2 border-ink px-3 py-1 text-sm font-semibold"
            >
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-28 sm:px-6">
        {children}
      </main>
    </>
  );
}
