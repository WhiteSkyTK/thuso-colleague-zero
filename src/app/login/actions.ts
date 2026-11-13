'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { verifyPassword } from '@/core/auth/passwords';
import { loadConfig } from '@/core/config/env';
import type { Role } from '@/core/domain/schoolUser';
import { endSession, homeFor, startSession } from '@/lib/auth';
import { school } from '@/lib/school';

export interface SignInState {
  error: string;
}

const CredentialsSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(1).max(200),
});

/** Five tries per email per minute (in memory: enough for one server at the hackathon). */
const MAX_TRIES = 5;
const WINDOW_MS = 60_000;
const tries = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const entry = tries.get(email);
  if (!entry || entry.resetAt < now) {
    tries.set(email, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_TRIES;
}

/** Demo accounts behind the one-click buttons; the shared password never leaves the server. */
const DEMO_EMAIL: Partial<Record<Role, string>> = {
  learner: 'l014@learners.example.org',
  teacher: 'maths.teacher@school.example.org',
  principal: 'principal@school.example.org',
};

async function trySignIn(email: string, password: string): Promise<SignInState> {
  const { users } = await school();
  const found = await users.findForLogin(email);
  const isValid = found ? await verifyPassword(password, found.passwordHash) : false;
  if (!found || !isValid) {
    return { error: 'That email and password do not match.' };
  }
  await startSession(found.user);
  redirect(homeFor(found.user.role));
}

export async function signIn(_previous: SignInState, form: FormData): Promise<SignInState> {
  const parsed = CredentialsSchema.safeParse({
    email: form.get('email'),
    password: form.get('password'),
  });
  if (!parsed.success) {
    return { error: 'Enter your email address and password.' };
  }
  const email = parsed.data.email.toLowerCase();
  if (isRateLimited(email)) {
    return { error: 'Too many tries. Wait a minute, then try again.' };
  }
  return trySignIn(email, parsed.data.password);
}

export async function demoSignIn(role: Role): Promise<void> {
  const email = DEMO_EMAIL[role];
  if (!email) {
    redirect('/login');
  }
  await trySignIn(email, loadConfig().school.demoPassword);
  // Only reached when the demo account is missing or its password was changed.
  redirect('/login?demo=unavailable');
}

export async function signOut(): Promise<void> {
  await endSession();
  redirect('/login');
}
