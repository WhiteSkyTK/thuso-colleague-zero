import { randomUUID } from 'node:crypto';
import { loadConfig } from '@/core/config/env';
import { createColleague, type Colleague } from '@/core/createColleague';
import type { EventListener } from '@/core/events/EventBus';
import { loadSeedClass } from '@/core/repositories/loadSeedClass';

/** One run at a time: protects the token budget and keeps the demo readable. */
const MAX_ACTIVE_RUNS = 1;

interface RunStore {
  colleague: Colleague;
  active: Set<string>;
}

/** Kept on globalThis so the dev server's hot reload does not lose running runs. */
const holder = globalThis as typeof globalThis & { thusoRunStore?: RunStore };

function store(): RunStore {
  holder.thusoRunStore ??= {
    colleague: createColleague({ config: loadConfig(), classData: loadSeedClass() }),
    active: new Set<string>(),
  };
  return holder.thusoRunStore;
}

export type StartResult = { runId: string } | { busy: true };

/** Starts a run in the background and returns its id straight away. */
export function startRun(goalText: string): StartResult {
  const { colleague, active } = store();
  if (active.size >= MAX_ACTIVE_RUNS) {
    return { busy: true };
  }
  const runId = randomUUID();
  active.add(runId);
  // The orchestrator always resolves with a summary; `finally` only frees the slot.
  void colleague.run(goalText, runId).finally(() => {
    active.delete(runId);
  });
  return { runId };
}

export function hasRun(runId: string): boolean {
  const { colleague, active } = store();
  return active.has(runId) || colleague.trace.eventsOf(runId).length > 0;
}

/** Replays the run's log so far, then follows it live. */
export function followRun(runId: string, listener: EventListener): () => void {
  return store().colleague.trace.follow(runId, listener);
}
