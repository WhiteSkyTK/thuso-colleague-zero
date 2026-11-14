import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { ThusoFace } from '@/components/mascot/ThusoFace';
import { SiteNav } from '@/components/ui/SiteNav';
import { currentUser, homeFor } from '@/lib/auth';
import { DEMO_ACCOUNTS } from '@/lib/demoAccounts';
import { school } from '@/lib/school';
import { demoSignIn } from './actions';

export const metadata: Metadata = { title: 'Sign in — Thuso' };

/** The demo learners' first names, read from the database so the buttons match the data. */
async function learnerNames(): Promise<Map<string, string>> {
  const { users } = await school();
  const ids = DEMO_ACCOUNTS.flatMap((account) => (account.learnerId ? [account.learnerId] : []));
  const found = await Promise.all(ids.map((id) => users.findById(id)));
  return new Map(found.flatMap((user) => (user ? [[user.id, user.firstName] as const] : [])));
}

export default async function LoginPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ demo?: string; staff?: string }> }>) {
  const user = await currentUser();
  if (user) {
    redirect(homeFor(user.role));
  }
  const [{ demo, staff }, names] = await Promise.all([searchParams, learnerNames()]);
  // The admin demo stays out of sight for the room; presenters open /login?staff=1.
  const accounts = DEMO_ACCOUNTS.filter((account) => !account.isHidden || staff === '1');

  return (
    <>
      <SiteNav />
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[2fr_3fr]">
        <section className="flex flex-col gap-4">
          <ThusoFace size={110} />
          <h1 className="font-display text-5xl font-extrabold uppercase leading-none sm:text-6xl">
            <span className="block">Sawubona!</span>
            <span className="block font-extralight text-jacaranda-500">I&apos;m Thuso.</span>
          </h1>
          <p className="text-lg">
            I work in the background for everyone at school: I tell teachers who is slipping and
            why, show learners what to study next in the way they learn best, and give the principal
            the whole picture.
          </p>
        </section>
        <section className="flex flex-col gap-5 rounded-card bg-white p-5 shadow-card sm:p-6">
          <h2 className="font-display text-3xl font-extrabold uppercase">Try the demo school</h2>
          <ul className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const name = account.learnerId ? names.get(account.learnerId) : undefined;
              return (
                <li key={account.key}>
                  <form action={demoSignIn.bind(null, account.key)} className="h-full">
                    <button
                      type="submit"
                      className={`flex h-full w-full flex-col rounded-card p-3 text-left ${account.className}`}
                    >
                      <span className="font-display text-xl font-extrabold uppercase leading-tight">
                        {account.label}
                      </span>
                      {name && <span className="text-sm font-semibold">{name}</span>}
                      <span className="text-xs">{account.detail}</span>
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
          {demo === 'unavailable' && (
            <p role="alert" className="rounded-lg bg-blush p-2 text-sm">
              That demo account is not available right now. Sign in with your own details below.
            </p>
          )}
          <h2 className="font-display text-2xl font-extrabold uppercase">Or sign in</h2>
          <LoginForm />
          <p className="text-xs">
            Synthetic demo data only — every person and address is invented.
          </p>
        </section>
      </main>
    </>
  );
}
