import { randomUUID } from 'node:crypto';
import { loadConfig } from '@/core/config/env';
import { createColleague, type Colleague } from '@/core/createColleague';
import type { EventListener } from '@/core/events/EventBus';
import { classFor } from './school';

/** One run at a time: protects the token budget and keeps the demo readable. */
const MAX_ACTIVE_RUNS = 1;
/** Finished runs kept for late viewers and replays; the oldest is dropped first. */
const MAX_KEPT_RUNS = 20;

interface RunStore {
  runs: Map<string, Colleague>;
  active: Set<string>;
}

/** Kept on globalThis so the dev server's hot reload does not lose running runs. */
const holder = globalThis as typeof globalThis & { thusoRunStore?: RunStore };

function store(): RunStore {
  holder.thusoRunStore ??= { runs: new Map(), active: new Set() };
  return holder.thusoRunStore;
}

function keep(runs: Map<string, Colleague>, runId: string, colleague: Colleague): void {
  runs.set(runId, colleague);
  const oldest = runs.keys().next().value;
  if (runs.size > MAX_KEPT_RUNS && oldest !== undefined) {
    runs.delete(oldest);
  }
}

export type StartResult = { runId: string } | { busy: true };

/** Starts a run on that grade's class (read from the database) and returns its id straight away. */
export async function startRun(goalText: string, grade: number): Promise<StartResult> {
  const { runs, active } = store();
  if (active.size >= MAX_ACTIVE_RUNS) {
    return { busy: true };
  }
  const runId = randomUUID();
  active.add(runId);
  try {
    const colleague = createColleague({ config: loadConfig(), classData: await classFor(grade) });
    keep(runs, runId, colleague);
    // The orchestrator always resolves with a summary; `finally` only frees the slot.
    void colleague.run(goalText, runId).finally(() => {
      active.delete(runId);
    });
    return { runId };
  } catch (error) {
    active.delete(runId);
    throw error;
  }
}

export function hasRun(runId: string): boolean {
  return store().runs.has(runId);
}

/** Replays the run's log so far, then follows it live. */
export function followRun(runId: string, listener: EventListener): () => void {
  const colleague = store().runs.get(runId);
  return colleague ? colleague.trace.follow(runId, listener) : () => undefined;
}
