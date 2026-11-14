/** Said when a button's request does not reach the server (network drop, signed out, server busy). */
export const NOT_SAVED = 'That didn’t go through — check your connection and try again.';

/**
 * Runs a server action from a button and never lets a failure crash the page: on any error the
 * caller's fallback is shown instead, and whatever the person typed stays on screen.
 */
export async function orFallback<T>(call: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await call();
  } catch {
    return fallback;
  }
}
