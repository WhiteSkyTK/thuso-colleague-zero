import { createAccountAction, importAccountsAction } from '@/app/portal/admin/actions';
import type { SchoolUser } from '@/core/domain/schoolUser';
import { subjectsInView } from '@/lib/subjectsInView';
import { AccountForm } from './AccountForm';
import { CsvImport } from './CsvImport';

/** "Create an account" for the admin and the principal: learners and teachers, with their classes. */
export async function CreateAccountSection({ user }: Readonly<{ user: SchoolUser }>) {
  const subjects = await subjectsInView(user);
  return (
    <section aria-labelledby="accounts-heading" className="rounded-card bg-white p-5 shadow-card">
      <h2 id="accounts-heading" className="font-display text-3xl font-extrabold uppercase">
        Create an account
      </h2>
      <p className="mb-3 text-sm">
        Open a learner or teacher account and give them their temporary password. Learners pick
        their own subjects; Thuso starts learning how they learn from their first day.
      </p>
      <AccountForm subjects={subjects} onCreate={createAccountAction} />
      <CsvImport onImport={importAccountsAction} />
    </section>
  );
}
