import type { OutboundMessage, Outbox } from './Outbox';

/** Keeps delivered messages in memory — used by tests and the offline demo. */
export class InMemoryOutbox implements Outbox {
  private readonly messages: OutboundMessage[] = [];

  get sent(): readonly OutboundMessage[] {
    return this.messages;
  }

  deliver(message: OutboundMessage): Promise<void> {
    this.messages.push(message);
    return Promise.resolve();
  }
}
