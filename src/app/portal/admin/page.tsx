import type { Metadata } from 'next';
import Link from 'next/link';
import { CreateAccountSection } from '@/components/admin/CreateAccountSection';
import { PortalMascot } from '@/components/mascot/PortalMascot';
import { WatchButton } from '@/components/mascot/WatchButton';
import { requireUser } from '@/lib/auth';
import { runWatchAction } from '../teacher/actions';
import { school } from '@/lib/school';

export const metadata: Metadata = { title: 'Admin — Thuso' };

/** Who is in the school, how big each grade is, and opening new learner and teacher accounts. */
export default async function AdminPage() {
  const user = await requireUser(['admin']);
  const { users, data } = await school();
  const [staff, grades] = await Promise.all([users.listStaff(), data.gradeSizes()]);
  return (
    <>
      <section>
        <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">Admin</p>
        <h1 className="font-display text-6xl font-extrabold uppercase leading-none">
          School set-up
        </h1>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="grades-heading" className="rounded-card bg-white p-5 shadow-card">
          <h2 id="grades-heading" className="font-display text-3xl font-extrabold uppercase">
            Grades
          </h2>
          <ul className="mt-2 flex flex-col gap-1">
            {grades.map((g) => (
              <li key={g.grade}>
                <Link href={`/portal/principal?grade=${g.grade}`} className="underline">
                  Grade {g.grade}
                </Link>{' '}
                · {g.learners} learners
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="staff-heading" className="rounded-card bg-white p-5 shadow-card">
          <h2 id="staff-heading" className="font-display text-3xl font-extrabold uppercase">
            Staff
          </h2>
          <ul className="mt-2 flex flex-col gap-1">
            {staff.map((member) => (
              <li key={member.id}>
                <strong>
                  {member.firstName} {member.lastName}
                </strong>{' '}
                · {member.role} · <span className="font-mono text-sm">{member.email}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <WatchButton onWatch={runWatchAction} />
      <CreateAccountSection user={user} />
      <PortalMascot
        user={user}
        tips={['Every school morning I check every grade on my own and alert the right teachers.']}
        runGrade={10}
      />
    </>
  );
}
