import type { AgentEvent } from '../domain/agentEvent';

export type EventListener = (event: AgentEvent) => void;

/** Observer: agents publish; the console, the SSE route and the trace recorder subscribe. */
export class EventBus {
  private readonly listeners = new Set<EventListener>();

  /** @returns a function that removes the listener. */
  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  publish(event: AgentEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
