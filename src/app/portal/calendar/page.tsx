import type { Metadata } from 'next';
import Link from 'next/link';
import { PortalMascot } from '@/components/mascot/PortalMascot';
import { formatSession } from '@/components/messages/MessageList';
import { googleCalendarLink, inviteTime } from '@/core/delivery/inviteLinks';
import { GRADES } from '@/core/domain/schoolUser';
import type { BookedSession } from '@/core/school/MessageRepository';
import { requireUser } from '@/lib/auth';
import { classFor, school } from '@/lib/school';

export const metadata: Metadata = { title: 'Calendar — Thuso' };

const DAY_FORMAT = new Intl.DateTimeFormat('en-ZA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'Africa/Johannesburg',
});
const dayKey = (start: string) =>
  inviteTime(start).toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' });

/** Which grades' sessions this person may see. */
async function sessionsInView(
  user: Awaited<ReturnType<typeof requireUser>>,
): Promise<BookedSession[]> {
  const { users, messages } = await school();
  if (user.role === 'learner') {
    const all = await messages.sessionsFor(user.grade ? [user.grade] : []);
    return all.filter((booked) => booked.learnerId === user.id);
  }
  const grades =
    user.role === 'teacher'
      ? [...new Set((await users.teachingOf(user.id)).map((t) => t.grade))]
      : [...GRADES];
  return messages.sessionsFor(grades);
}

/** Support sessions Thuso booked, day by day — the same events the calendar invites carry. */
export default async function CalendarPage() {
  const user = await requireUser();
  const sessions = await sessionsInView(user);
  const grades = [...new Set(sessions.map((s) => s.grade))];
  const classes = await Promise.all(grades.map((grade) => classFor(grade)));
  const nameOf = new Map(
    classes.flatMap((c) => c.learners.map((l) => [l.id, `${l.firstName} ${l.lastName}`])),
  );
  const byDay = Map.groupBy(
    [...sessions].sort((a, b) => a.session.start.localeCompare(b.session.start)),
    (booked) => dayKey(booked.session.start),
  );
  const isLearner = user.role === 'learner';

  return (
    <>
      <section>
        <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">Calendar</p>
        <h1 className="font-display text-5xl font-extrabold uppercase leading-none sm:text-6xl">
          {isLearner ? 'My sessions' : 'Support sessions'}
        </h1>
        <p className="mt-2 max-w-2xl">
          Every session Thuso booked, in South African time. Add one to your own calendar with one
          tap.
        </p>
      </section>
      {byDay.size === 0 ? (
        <p className="rounded-card bg-white p-4 shadow-card">
          Nothing booked yet. {isLearner ? 'Your teacher' : 'You'} can press &ldquo;Let Thuso write
          the plans&rdquo; to book sessions.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {[...byDay].map(([day, list]) => (
            <li key={day} className="rounded-card bg-white p-4 shadow-card">
              <h2 className="font-display text-2xl font-extrabold uppercase">
                {DAY_FORMAT.format(inviteTime(list[0]?.session.start ?? ''))}
              </h2>
              <ul className="mt-2 flex flex-col gap-2">
                {list.map((booked) => (
                  <li
                    key={booked.learnerId}
                    className="flex flex-col gap-2 rounded-lg bg-jacaranda-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span>
                      <strong>{formatSession(booked.session.start).split(' at ').at(-1)}</strong> ·{' '}
                      {isLearner ? (
                        booked.session.title
                      ) : (
                        <Link
                          href={`/portal/learners/${booked.learnerId}`}
                          className="font-semibold underline"
                        >
                          {nameOf.get(booked.learnerId) ?? booked.learnerId}
                        </Link>
                      )}{' '}
                      · Grade {booked.grade} · {booked.session.location}
                    </span>
                    <a
                      href={googleCalendarLink(booked.session)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-sun px-3 py-1 text-center text-sm font-semibold text-ink"
                    >
                      Add to Google Calendar
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
      <PortalMascot
        user={user}
        tips={[
          isLearner
            ? 'Tap “Add to Google Calendar” so your phone reminds you before the session.'
            : 'Each learner’s session is also in their inbox and their guardian’s, with a calendar invite.',
        ]}
      />
    </>
  );
}
