import type { MessageStore } from '../school/MessageRepository';
import { route, type DeliveryMode, type DeliveryStatus } from './DeliveryPolicy';
import type { MailTransport } from './MailTransport';
import type { OutboundMessage, Outbox } from './Outbox';

export interface DatabaseOutboxOptions {
  store: MessageStore;
  runId: string;
  grade: number;
  mode: DeliveryMode;
  demoRecipient?: string;
  /** Present only when SMTP is configured; without it every message stays in the portal. */
  transport?: MailTransport;
  newId: () => string;
}

/**
 * Keeps every message in the database (so learners and teachers see it in the portal, with the
 * invite to download) and emails it when the delivery mode and an SMTP server allow.
 */
export class DatabaseOutbox implements Outbox {
  constructor(private readonly options: DatabaseOutboxOptions) {}

  async deliver(message: OutboundMessage): Promise<void> {
    const { store, runId, grade, mode, demoRecipient, transport, newId } = this.options;
    const routing = transport ? route(message, mode, demoRecipient) : { status: 'portal' as const };
    let status: DeliveryStatus = routing.status;
    if (transport && routing.mail) {
      try {
        await transport.send(routing.mail);
      } catch {
        // A mail server problem must not lose the plan: it is kept and marked for a retry.
        status = 'failed';
      }
    }
    await store.save({
      id: newId(),
      runId,
      grade,
      about: message.subjectId,
      audience: message.audience,
      to: message.to,
      subject: message.subject,
      body: message.body,
      invite: message.invite,
      status,
    });
  }
}
