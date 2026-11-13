'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

const KEY = 'thuso-seen-tips';
const MAX_REMEMBERED = 200;
const EMPTY = '[]';

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? EMPTY;
  } catch {
    // Private windows and blocked storage: behave as if nothing was seen.
    return EMPTY;
  }
}

function subscribe(onChange: () => void): () => void {
  globalThis.addEventListener('storage', onChange);
  return () => globalThis.removeEventListener('storage', onChange);
}

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

/** Which of Thuso's tips this browser has already shown, so it only pops up for something new. */
export function useSeenTips(): {
  seen: ReadonlySet<string>;
  markSeen: (tips: readonly string[]) => void;
} {
  const raw = useSyncExternalStore(subscribe, read, () => EMPTY);
  const seen = useMemo(() => new Set(parse(raw)), [raw]);
  const markSeen = useCallback((tips: readonly string[]) => {
    const next = [...new Set([...parse(read()), ...tips])].slice(-MAX_REMEMBERED);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      globalThis.dispatchEvent(new StorageEvent('storage', { key: KEY }));
    } catch {
      // Not remembered this time; Thuso just shows the tips again next visit.
    }
  }, []);
  return { seen, markSeen };
}
