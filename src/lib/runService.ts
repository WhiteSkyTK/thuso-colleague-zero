import { randomUUID } from 'node:crypto';
import { loadConfig } from '@/core/config/env';
import { createColleague, type Colleague } from '@/core/createColleague';
import { DatabaseOutbox } from '@/core/delivery/DatabaseOutbox';
import type { RunSummary } from '@/core/domain/runSummary';
import type { EventListener } from '@/core/events/EventBus';
import { notifyRunFinished } from './alerts';
import { classFor, school } from './school';

/** One run at a time: protects the token budget and keeps the demo readable. */
const MAX_ACTIVE_RUNS = 1;
/** Finished runs kept in memory for late viewers on this server; history lives in the database. */
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

export type StartResult = { runId: string; done: Promise<void> } | { busy: true };

/** Saves the finished run for history and replay, then tells learners, teachers and the principal. */
async function recordFinish(finished: {
  colleague: Colleague;
  runId: string;
  grade: number;
  summary: RunSummary;
}): Promise<void> {
  const { colleague, runId, grade, summary } = finished;
  const { runs } = await school();
  try {
    const events = colleague.trace.eventsOf(runId);
    await runs.finish(runId, summary, events);
    const learnerIds = [
      ...new Set(
        colleague.outbox.sent.filter((m) => m.audience === 'learner').map((m) => m.subjectId),
      ),
    ];
    const flags = events.filter((event) => event.level === 'FLAG').length;
    await notifyRunFinished({ id: runId, grade, summary, flags }, learnerIds);
  } catch {
    await runs.fail(runId);
  }
}

/**
 * Starts a run on that grade's class (read from the database). `done` resolves once the run is
 * saved and everyone is notified — the route keeps the server alive until then.
 */
export async function startRun(
  goalText: string,
  grade: number,
  startedBy?: string,
): Promise<StartResult> {
  const { runs: memory, active } = store();
  if (active.size >= MAX_ACTIVE_RUNS) {
    return { busy: true };
  }
  const runId = randomUUID();
  active.add(runId);
  try {
    const config = loadConfig();
    const [{ messages, delivery, transport, runs }, classData] = await Promise.all([
      school(),
      classFor(grade),
    ]);
    // Every message is kept for the portal inbox and emailed when SMTP and the delivery mode allow.
    const outbox = new DatabaseOutbox({
      store: messages,
      runId,
      grade,
      mode: delivery.mode,
      demoRecipient: delivery.demoRecipient,
      transport,
      newId: randomUUID,
    });
    const colleague = createColleague({ config, classData, outbox });
    keep(memory, runId, colleague);
    await runs.start({
      id: runId,
      grade,
      goal: goalText,
      startedBy,
      provider: config.llm.provider,
    });
    const done = colleague
      .run(goalText, runId)
      .then((summary) => recordFinish({ colleague, runId, grade, summary }))
      .finally(() => {
        active.delete(runId);
      });
    return { runId, done };
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
