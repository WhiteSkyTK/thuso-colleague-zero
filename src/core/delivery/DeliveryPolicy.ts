import type { Mail } from './MailTransport';
import type { OutboundMessage } from './Outbox';

export type DeliveryMode = 'sandbox' | 'redirect' | 'live';

/** What happened to a message: kept in the portal only, emailed to the demo inbox, or emailed. */
export type DeliveryStatus = 'portal' | 'redirected' | 'sent' | 'failed';

export interface Routing {
  mail?: Mail;
  status: DeliveryStatus;
}

/**
 * Strategy for where a message goes (CLAUDE.md §5.4). sandbox: the portal inbox only.
 * redirect: every message to one demo inbox, with the real recipient named in the subject.
 * live: to the real recipient. Without a mail transport everything stays in the portal.
 */
export function route(
  message: OutboundMessage,
  mode: DeliveryMode,
  demoRecipient?: string,
): Routing {
  const mail = { subject: message.subject, text: message.body, invite: message.invite };
  if (mode === 'live') {
    return { mail: { ...mail, to: message.to }, status: 'sent' };
  }
  if (mode === 'redirect' && demoRecipient) {
    return {
      mail: { ...mail, to: demoRecipient, subject: `[for ${message.to}] ${message.subject}` },
      status: 'redirected',
    };
  }
  return { status: 'portal' };
}
