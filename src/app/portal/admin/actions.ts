'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { hashPassword } from '@/core/auth/passwords';
import { LearningFormatSchema } from '@/core/domain/vocab';
import { defaultSubjectChoice } from '@/core/seed/extraSubjects';
import { requireUser } from '@/lib/auth';
import { classFor, forgetClass, school } from '@/lib/school';

const Name = z.string().trim().min(1).max(60);
const Email = z
  .email()
  .max(200)
  .transform((email) => email.toLowerCase());
const Grade = z.number().int().min(10).max(12);

const AccountSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('learner'),
    firstName: Name,
    lastName: Name,
    email: Email,
    grade: Grade,
    formats: z.array(LearningFormatSchema).min(1).max(2),
    guardianName: Name,
    guardianEmail: Email,
  }),
  z.object({
    role: z.literal('teacher'),
    firstName: Name,
    lastName: Name,
    email: Email,
    teaching: z
      .array(z.object({ grade: Grade, subjectId: z.string().regex(/^[A-Z]{3,6}$/) }))
      .min(1)
      .max(24),
  }),
]);
type Account = z.infer<typeof AccountSchema>;

export interface CreatedAccount {
  id: string;
  name: string;
  email: string;
  role: 'learner' | 'teacher';
  /** Shown once to the person who created the account, never stored in plain text. */
  password: string;
}

export interface AccountResult {
  error?: string;
  created?: CreatedAccount;
}

const PASSWORD_BYTES = 9;

async function teachesRealSubjects(teaching: readonly { grade: number; subjectId: string }[]) {
  const grades = [...new Set(teaching.map((t) => t.grade))];
  const classes = await Promise.all(grades.map((grade) => classFor(grade)));
  return teaching.every((t) =>
    classes[grades.indexOf(t.grade)]?.subjects.some((s) => s.id === t.subjectId),
  );
}

async function save(account: Account, passwordHash: string): Promise<string> {
  const { accounts, data } = await school();
  if (account.role === 'teacher') {
    return accounts.addTeacher({ ...account, passwordHash });
  }
  const id = await accounts.addLearner({
    ...account,
    passwordHash,
    subjects: defaultSubjectChoice(0),
  });
  await data.touch(account.grade);
  forgetClass(account.grade);
  return id;
}

/** The admin or principal opens an account: a learner in a grade, or a teacher with classes. */
export async function createAccountAction(input: unknown): Promise<AccountResult> {
  await requireUser(['admin', 'principal']);
  const parsed = AccountSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      error: `Check ${issue?.path.join(' ') || 'the form'}: ${issue?.message ?? 'invalid'}`,
    };
  }
  const account = parsed.data;
  const { accounts } = await school();
  if (await accounts.isEmailTaken(account.email)) {
    return { error: 'That email address already has an account.' };
  }
  if (account.role === 'teacher' && !(await teachesRealSubjects(account.teaching))) {
    return { error: 'Pick subjects that exist in those grades.' };
  }
  const password = randomBytes(PASSWORD_BYTES).toString('base64url');
  const id = await save(account, await hashPassword(password));
  revalidatePath('/portal/admin');
  revalidatePath('/portal/principal');
  return {
    created: {
      id,
      name: `${account.firstName} ${account.lastName}`,
      email: account.email,
      role: account.role,
      password,
    },
  };
}
