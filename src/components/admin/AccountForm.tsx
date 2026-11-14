'use client';

import { useState, useTransition, type FormEvent } from 'react';
import type { AccountResult } from '@/app/portal/admin/actions';
import type { SubjectChoice } from '@/components/papers/PaperForm';
import { GRADES } from '@/core/domain/schoolUser';
import { LEARNING_FORMATS } from '@/core/domain/vocab';
import { FORMAT_ICON, FORMAT_LABEL } from '@/lib/labels';
import { NOT_SAVED, orFallback } from '@/lib/orFallback';

interface AccountFormProps {
  readonly subjects: readonly SubjectChoice[];
  readonly onCreate: (input: unknown) => Promise<AccountResult>;
}

type Role = 'learner' | 'teacher';

const FIELD = 'w-full rounded-lg border-2 border-ink/20 bg-white px-3 py-2';
const LABEL = 'flex flex-col gap-1 text-sm font-medium';
const CHIP = 'flex items-center gap-1 rounded-full bg-jacaranda-50 px-3 py-1 text-sm';

type Created = NonNullable<AccountResult['created']>;

const loginText = (account: Created) =>
  [
    'Thuso login',
    `Name: ${account.name} (${account.role}, ${account.id})`,
    `Sign in at: ${globalThis.location?.origin ?? ''}/login`,
    `Email: ${account.email}`,
    `Temporary password: ${account.password}`,
  ].join('\n');

const SMALL_BUTTON = 'rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold';

/** The new login stays here until the person who made it has saved it and taps Done. */
function CreatedCard({ account, onDone }: Readonly<{ account: Created; onDone: () => void }>) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(loginText(account));
    setCopied(true);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([loginText(account)], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `thuso-login-${account.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="ask-reply flex flex-col gap-1 rounded-card border-2 border-jacaranda-500 bg-jacaranda-50 p-4 text-sm">
      <p className="font-semibold">
        ✓ {account.role === 'learner' ? 'Learner' : 'Teacher'} account ready: {account.name} (
        {account.id})
      </p>
      <p>
        Email: <span className="font-mono">{account.email}</span>
      </p>
      <p>
        Temporary password: <span className="font-mono font-bold">{account.password}</span>
      </p>
      <p className="opacity-80">Save it now — it is shown only here and stored only as a hash.</p>
      <div className="mt-1 flex flex-wrap gap-2">
        <button type="button" onClick={copy} className={SMALL_BUTTON}>
          {copied ? '✓ Copied' : '📋 Copy login'}
        </button>
        <button type="button" onClick={download} className={SMALL_BUTTON}>
          ⬇ Download (.txt)
        </button>
        <button type="button" onClick={onDone} className={`${SMALL_BUTTON} bg-ink text-paper`}>
          Done
        </button>
      </div>
    </div>
  );
}

/** Opens an account: learners get a grade and starting formats; teachers get their classes. */
export function AccountForm({ subjects, onCreate }: AccountFormProps) {
  const [role, setRole] = useState<Role>('learner');
  const [result, setResult] = useState<AccountResult>({});
  const [created, setCreated] = useState<Created[]>([]);
  const [isPending, startTransition] = useTransition();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const person = {
      role,
      firstName: form.get('firstName'),
      lastName: form.get('lastName'),
      email: form.get('email'),
    };
    const details =
      role === 'learner'
        ? {
            grade: Number(form.get('grade')),
            formats: form.getAll('formats'),
            guardianName: form.get('guardianName'),
            guardianEmail: form.get('guardianEmail'),
          }
        : {
            teaching: form.getAll('teaching').map((value) => {
              const [grade, subjectId] = (typeof value === 'string' ? value : '').split('|');
              return { grade: Number(grade), subjectId };
            }),
          };
    startTransition(async () => {
      const outcome = await orFallback(() => onCreate({ ...person, ...details }), {
        error: `${NOT_SAVED} Nothing was created.`,
      });
      setResult(outcome);
      const account = outcome.created;
      if (account) {
        setCreated((list) => [account, ...list]);
        formElement.reset();
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <fieldset className="flex gap-2">
        <legend className="sr-only">Account type</legend>
        {(['learner', 'teacher'] as const).map((option) => (
          <label key={option} className={`${CHIP} cursor-pointer font-semibold`}>
            <input
              type="radio"
              name="role"
              checked={role === option}
              onChange={() => setRole(option)}
            />
            {option === 'learner' ? 'Learner' : 'Teacher'}
          </label>
        ))}
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className={LABEL}>
          <span>First name</span>
          <input name="firstName" required maxLength={60} className={FIELD} />
        </label>
        <label className={LABEL}>
          <span>Last name</span>
          <input name="lastName" required maxLength={60} className={FIELD} />
        </label>
        <label className={LABEL}>
          <span>Email (use example.org for test accounts)</span>
          <input name="email" type="email" required maxLength={200} className={FIELD} />
        </label>
      </div>
      {role === 'learner' ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={LABEL}>
              <span>Grade</span>
              <select name="grade" className={FIELD} defaultValue={GRADES[0]}>
                {GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </label>
            <label className={LABEL}>
              <span>Parent or guardian</span>
              <input name="guardianName" required maxLength={60} className={FIELD} />
            </label>
            <label className={LABEL}>
              <span>Guardian email</span>
              <input name="guardianEmail" type="email" required maxLength={200} className={FIELD} />
            </label>
          </div>
          <fieldset className="flex flex-col gap-1">
            <legend className="text-sm font-medium">
              How they learn best — tick any or all; Thuso learns which works and puts it first
            </legend>
            <div className="flex flex-wrap gap-2">
              {LEARNING_FORMATS.map((format, at) => (
                <label key={format} className={CHIP}>
                  <input type="checkbox" name="formats" value={format} defaultChecked={at === 0} />
                  {FORMAT_ICON[format]} {FORMAT_LABEL[format]}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="text-sm">
            They start with a valid set of seven NSC subjects and can change it on their Subjects
            page.
          </p>
        </>
      ) : (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Classes they teach</legend>
          {GRADES.map((grade) => (
            <div key={grade} className="flex flex-wrap items-center gap-2">
              <span className="w-20 text-sm font-semibold">Grade {grade}</span>
              {subjects
                .filter((s) => s.grade === grade)
                .map((s) => (
                  <label key={s.id} className={CHIP}>
                    <input type="checkbox" name="teaching" value={`${grade}|${s.id}`} />
                    {s.name}
                  </label>
                ))}
            </div>
          ))}
        </fieldset>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full bg-jacaranda-500 px-6 py-2 font-bold text-white disabled:opacity-60"
      >
        {isPending ? 'Creating…' : 'Create account'}
      </button>
      {result.error && (
        <p role="alert" className="text-sm font-semibold text-ember-700">
          {result.error}
        </p>
      )}
      {created.map((account) => (
        <CreatedCard
          key={account.id}
          account={account}
          onDone={() => setCreated((list) => list.filter((a) => a.id !== account.id))}
        />
      ))}
    </form>
  );
}
