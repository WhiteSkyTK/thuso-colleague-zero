import Link from 'next/link';
import { signOut } from '@/app/login/actions';
import { currentUser, homeFor } from '@/lib/auth';

const PILL =
  'rounded-full px-4 py-1.5 font-semibold hover:bg-jacaranda-50 focus-visible:bg-jacaranda-50';

/** The header on public pages: signed in, it shows who you are and takes you back to your portal. */
export async function SiteNav() {
  const user = await currentUser();
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <Link href="/" className="font-display text-2xl font-extrabold uppercase tracking-wide">
        Thuso
      </Link>
      <nav aria-label="Main">
        <ul className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/run" className={PILL}>
              Live run
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link href={homeFor(user.role)} className={`${PILL} bg-jacaranda-50`}>
                  My portal · {user.firstName}
                </Link>
              </li>
              <li>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-full border-2 border-ink px-3 py-1 text-sm font-semibold"
                  >
                    Sign out
                  </button>
                </form>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" className={`${PILL} bg-ink text-paper hover:bg-ink/90`}>
                Sign in
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
