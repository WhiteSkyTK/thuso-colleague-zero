import type { AgentEvent } from '../domain/agentEvent';
import type { EventBus, EventListener } from './EventBus';

const MAX_RUNS_KEPT = 20;

/** The last event of every run: the orchestrator's DONE, or ERROR when it stopped early. */
export const isFinalEvent = (event: AgentEvent): boolean =>
  event.agent === 'SYS' && (event.level === 'DONE' || event.level === 'ERROR');

/**
 * Keeps every run's events so a viewer that connects late (or reconnects) still
 * sees the whole log. Bounded: only the most recent runs are kept.
 */
export class TraceRecorder {
  private readonly traces = new Map<string, AgentEvent[]>();
  private readonly followers = new Map<string, Set<EventListener>>();

  constructor(bus: EventBus) {
    bus.subscribe((event) => {
      this.record(event);
    });
  }

  eventsOf(runId: string): readonly AgentEvent[] {
    return this.traces.get(runId) ?? [];
  }

  /**
   * Replays what has been recorded, then keeps delivering new events.
   * @returns a function that stops following.
   */
  follow(runId: string, listener: EventListener): () => void {
    for (const event of this.eventsOf(runId)) {
      listener(event);
    }
    const listeners = this.followers.get(runId) ?? new Set<EventListener>();
    listeners.add(listener);
    this.followers.set(runId, listeners);
    return () => {
      listeners.delete(listener);
    };
  }

  private record(event: AgentEvent): void {
    const trace = this.traces.get(event.runId) ?? [];
    trace.push(event);
    this.traces.set(event.runId, trace);
    for (const listener of this.followers.get(event.runId) ?? []) {
      listener(event);
    }
    if (isFinalEvent(event)) {
      this.followers.delete(event.runId);
      this.dropOldest();
    }
  }

  private dropOldest(): void {
    while (this.traces.size > MAX_RUNS_KEPT) {
      const oldest = this.traces.keys().next().value;
      if (oldest === undefined) {
        return;
      }
      this.traces.delete(oldest);
    }
  }
}
