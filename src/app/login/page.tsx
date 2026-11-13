import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { ThusoFace } from '@/components/mascot/ThusoFace';
import { SiteNav } from '@/components/ui/SiteNav';
import type { Role } from '@/core/domain/schoolUser';
import { currentUser, homeFor } from '@/lib/auth';
import { demoSignIn } from './actions';

export const metadata: Metadata = { title: 'Sign in — Thuso' };

const DEMOS: readonly { role: Role; label: string; who: string; className: string }[] = [
  { role: 'learner', label: 'Learner', who: 'Refilwe, Grade 10', className: 'bg-sun text-ink' },
  {
    role: 'teacher',
    label: 'Teacher',
    who: 'Ms Khoza, Mathematics',
    className: 'bg-teal text-ink',
  },
  {
    role: 'principal',
    label: 'Principal',
    who: 'Mrs Molefe, whole school',
    className: 'bg-jacaranda-500 text-white',
  },
];

export default async function LoginPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ demo?: string }> }>) {
  const user = await currentUser();
  if (user) {
    redirect(homeFor(user.role));
  }
  const { demo } = await searchParams;

  return (
    <>
      <SiteNav />
      <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <ThusoFace size={120} />
          <h1 className="font-display text-6xl font-extrabold uppercase leading-none">
            Sawubona!
            <span className="block font-extralight text-jacaranda-500">I&apos;m Thuso.</span>
          </h1>
          <p className="text-lg">
            Sign in and I&apos;ll show you what matters today — the learners who need you, the
            topics to reteach, or what to study next in the way you learn best.
          </p>
        </section>
        <section className="flex flex-col gap-5 rounded-card bg-white p-6 shadow-card">
          <h2 className="font-display text-3xl font-extrabold uppercase">Try the demo school</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {DEMOS.map((demoAccount) => (
              <form key={demoAccount.role} action={demoSignIn.bind(null, demoAccount.role)}>
                <button
                  type="submit"
                  className={`flex h-full w-full flex-col rounded-card p-3 text-left ${demoAccount.className}`}
                >
                  <span className="font-display text-2xl font-extrabold uppercase">
                    {demoAccount.label}
                  </span>
                  <span className="text-xs">{demoAccount.who}</span>
                </button>
              </form>
            ))}
          </div>
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
