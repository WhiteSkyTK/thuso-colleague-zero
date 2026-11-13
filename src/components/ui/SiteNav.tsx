import Link from 'next/link';

const LINKS = [
  { href: '/run', label: 'Live run' },
  { href: '/login', label: 'Sign in' },
] as const;

/** The same simple header on every page: the live demo and the portal sign-in. */
export function SiteNav() {
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <Link href="/" className="font-display text-2xl font-extrabold uppercase tracking-wide">
        Thuso
      </Link>
      <nav aria-label="Main">
        <ul className="flex flex-wrap gap-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-full px-4 py-1.5 font-semibold hover:bg-jacaranda-50 focus-visible:bg-jacaranda-50"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
