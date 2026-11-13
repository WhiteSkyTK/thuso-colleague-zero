'use client';

import { useActionState } from 'react';
import { signIn, type SignInState } from '@/app/login/actions';

const FIELD = 'rounded-lg border-2 border-ink/20 bg-white px-3 py-2';
const INITIAL: SignInState = { error: '' };

/** Email and password sign-in for every role. */
export function LoginForm() {
  const [state, action, isPending] = useActionState(signIn, INITIAL);
  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 font-medium">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="username" className={FIELD} />
      </label>
      <label className="flex flex-col gap-1 font-medium">
        <span>Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={FIELD}
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-jacaranda-500 px-6 py-2.5 font-bold text-white disabled:opacity-60"
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
      {state.error && (
        <p role="alert" className="rounded-lg bg-blush p-2 text-sm">
          {state.error}
        </p>
      )}
    </form>
  );
}
