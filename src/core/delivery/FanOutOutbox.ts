import type { OutboundMessage, Outbox } from './Outbox';

/** Delivers every message to several outboxes in turn (e.g. memory for the run and the database). */
export class FanOutOutbox implements Outbox {
  constructor(private readonly outboxes: readonly Outbox[]) {}

  async deliver(message: OutboundMessage): Promise<void> {
    for (const outbox of this.outboxes) {
      await outbox.deliver(message);
    }
  }
}
