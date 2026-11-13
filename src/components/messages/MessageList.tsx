import { googleCalendarLink, inviteTime } from '@/core/delivery/inviteLinks';
import type { StoredMessage } from '@/core/school/MessageRepository';

const SESSION_FORMAT = new Intl.DateTimeFormat('en-ZA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Johannesburg',
});

/** "Monday 16 November at 14:30" in South African time. */
export const formatSession = (start: string) => SESSION_FORMAT.format(inviteTime(start));

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
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              {message.session && (
                <>
                  <p className="text-sm font-semibold">
                    📅 Support session {formatSession(message.session.start)}
                  </p>
                  <a
                    href={googleCalendarLink(message.session)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-sun px-4 py-1.5 text-center text-sm font-semibold text-ink"
                  >
                    Add to Google Calendar
                  </a>
                </>
              )}
              <a
                href={`/portal/messages/${message.id}/invite`}
                download="support-session.ics"
                className="rounded-full border-2 border-ink/20 bg-white px-4 py-1.5 text-center text-sm font-semibold"
              >
                Outlook / Apple (.ics)
              </a>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
