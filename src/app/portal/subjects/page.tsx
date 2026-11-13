import type { Metadata } from 'next';
import { PortalMascot } from '@/components/mascot/PortalMascot';
import { SubjectPicker } from '@/components/subjects/SubjectPicker';
import { requireUser } from '@/lib/auth';
import { school } from '@/lib/school';
import { saveSubjectsAction } from './actions';

export const metadata: Metadata = { title: 'My subjects — Thuso' };

/** Grade 10 subject choice with the NSC rules checked as the learner picks. */
export default async function SubjectsPage() {
  const user = await requireUser(['learner']);
  const { choices } = await school();
  const current = (await choices.get(user.id)) ?? [];
  return (
    <>
      <section>
        <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
          My subjects · Grade {user.grade}
        </p>
        <h1 className="font-display text-5xl font-extrabold uppercase leading-none sm:text-6xl">
          Choose your seven
        </h1>
        <p className="mt-2 max-w-2xl">
          Every learner takes two languages, Mathematics or Mathematical Literacy, Life Orientation
          and three electives. Thuso checks the rules as you choose and shows which careers your
          choice keeps open.
        </p>
      </section>
      <SubjectPicker initial={current} onSave={saveSubjectsAction} />
      <PortalMascot
        user={user}
        tips={[
          'Want engineering or medicine later? Keep Mathematics and Physical Sciences — the list shows why.',
        ]}
      />
    </>
  );
}
