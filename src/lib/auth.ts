import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { hashToken, newSessionToken } from '@/core/auth/passwords';
import type { Role, SchoolUser } from '@/core/domain/schoolUser';
import { school } from './school';

const COOKIE = 'thuso_session';
const SESSION_DAYS = 7;
const MS_PER_DAY = 86_400_000;

export const homeFor = (role: Role): string => `/portal/${role}`;

/** Who is signed in. Cached per request, so a layout and its page share one database read. */
export const currentUser = cache(async (): Promise<SchoolUser | undefined> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) {
    return undefined;
  }
  const { users } = await school();
  return users.userForSession(hashToken(token));
});

/** Sends visitors to sign in, and people to their own portal if the page is not for their role. */
export async function requireUser(roles?: readonly Role[]): Promise<SchoolUser> {
  const user = await currentUser();
  if (!user) {
    redirect('/login');
  }
  if (roles && !roles.includes(user.role)) {
    redirect(homeFor(user.role));
  }
  return user;
}

/** HttpOnly, SameSite=Lax, Secure in production; the database stores only the token's hash. */
export async function startSession(user: SchoolUser): Promise<void> {
  const token = newSessionToken();
  const expires = new Date(Date.now() + SESSION_DAYS * MS_PER_DAY);
  const { users } = await school();
  await users.createSession(user.id, hashToken(token), expires);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const { users } = await school();
    await users.deleteSession(hashToken(token));
  }
  jar.delete(COOKIE);
}
