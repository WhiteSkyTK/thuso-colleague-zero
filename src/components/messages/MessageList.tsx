import type { StoredMessage } from '@/core/school/MessageRepository';

const STATUS_LABEL: Record<StoredMessage['status'], string> = {
  portal: 'In the portal',
  redirected: 'Emailed (demo inbox)',
  sent: 'Emailed',
  failed: 'Email failed — kept here',
};

const AUDIENCE_LABEL: Record<StoredMessage['audience'], string> = {
  learner: 'Learner',
  guardian: 'Guardian',
  teacher: 'Teacher',
};

interface MessageListProps {
  readonly messages: readonly StoredMessage[];
  /** Staff see who each message went to; learners only see their own. */
  readonly showRecipient: boolean;
  readonly emptyText: string;
}

/** Messages Thuso delivered, each with its calendar invite to download. */
export function MessageList({ messages, showRecipient, emptyText }: MessageListProps) {
  if (messages.length === 0) {
    return <p className="rounded-card bg-white p-4 shadow-card">{emptyText}</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {messages.map((message) => (
        <li key={message.id} className="rounded-card bg-white p-4 shadow-card">
          <details>
            <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2">
              <span className="font-semibold">{message.subject}</span>
              <span className="text-xs">
                {showRecipient && `${AUDIENCE_LABEL[message.audience]} · ${message.to} · `}
                {STATUS_LABEL[message.status]} · {message.createdAt} SAST
              </span>
            </summary>
            <p className="mt-3 whitespace-pre-wrap text-sm">{message.body}</p>
          </details>
          {message.hasInvite && (
            <a
              href={`/portal/messages/${message.id}/invite`}
              download="support-session.ics"
              className="mt-2 inline-block rounded-full bg-sun px-4 py-1 text-sm font-semibold text-ink"
            >
              📅 Add the support session to my calendar
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
