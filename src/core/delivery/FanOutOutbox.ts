import type { OutboundMessage, Outbox } from './Outbox';

/** Delivers every message to several outboxes at once (e.g. memory for the run and the database). */
export class FanOutOutbox implements Outbox {
  constructor(private readonly outboxes: readonly Outbox[]) {}

  async deliver(message: OutboundMessage): Promise<void> {
    await Promise.all(this.outboxes.map((outbox) => outbox.deliver(message)));
  }
}
