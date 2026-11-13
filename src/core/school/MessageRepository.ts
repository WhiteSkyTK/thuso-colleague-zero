import type { Database } from '../db/Database';
import type { DeliveryStatus } from '../delivery/DeliveryPolicy';
import { readInvite, type InviteSummary } from '../delivery/inviteLinks';
import type { Audience } from '../delivery/Outbox';

export interface NewMessage {
  id: string;
  runId: string;
  grade: number;
  /** Learner id the message is about, or `class` for the teacher summary. */
  about: string;
  audience: Audience;
  to: string;
  subject: string;
  body: string;
  invite?: string;
  status: DeliveryStatus;
}

export type StoredMessage = Omit<NewMessage, 'invite'> & {
  hasInvite: boolean;
  createdAt: string;
  /** The booked session, read from the invite (for calendar links and the calendar page). */
  session?: InviteSummary;
};

/** A booked support session for one learner. */
export interface BookedSession {
  learnerId: string;
  grade: number;
  session: InviteSummary;
}

type Row = Omit<StoredMessage, 'session'> & { invite: string | null };

const withSession = ({ invite, ...message }: Row): StoredMessage => ({
  ...message,
  session: invite ? readInvite(invite) : undefined,
});

/** Where the database outbox writes (interface segregation: it needs nothing else). */
export interface MessageStore {
  save(message: NewMessage): Promise<void>;
}

const FIELDS = `id, run_id AS "runId", grade, about, audience, to_address AS "to", subject, body,
  invite, invite IS NOT NULL AS "hasInvite", status, to_char(created_at AT TIME ZONE 'Africa/Johannesburg', 'YYYY-MM-DD HH24:MI') AS "createdAt"`;

/** Every message Thuso sent: the portal inbox for learners, the sent log for teachers. */
export class MessageRepository implements MessageStore {
  constructor(private readonly db: Database) {}

  async save(message: NewMessage): Promise<void> {
    await this.db.query(
      `INSERT INTO messages (id, run_id, grade, about, audience, to_address, subject, body, invite, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        message.id,
        message.runId,
        message.grade,
        message.about,
        message.audience,
        message.to,
        message.subject,
        message.body,
        message.invite ?? null,
        message.status,
      ],
    );
  }

  /** What a learner received, newest first. */
  async forLearner(learnerId: string, limit: number): Promise<StoredMessage[]> {
    const rows = await this.db.query<Row>(
      `SELECT ${FIELDS} FROM messages WHERE about = $1 AND audience = 'learner' ORDER BY created_at DESC LIMIT $2`,
      [learnerId, limit],
    );
    return rows.map(withSession);
  }

  /** Everything from the latest run for a grade (the teacher's sent log). */
  async latestRunFor(grade: number): Promise<StoredMessage[]> {
    const rows = await this.db.query<Row>(
      `SELECT ${FIELDS} FROM messages WHERE grade = $1 AND run_id = (
         SELECT run_id FROM messages WHERE grade = $1 ORDER BY created_at DESC LIMIT 1
       ) ORDER BY about, audience`,
      [grade],
    );
    return rows.map(withSession);
  }

  /** The latest booked session per learner, for these grades (the staff calendar). */
  async sessionsFor(grades: readonly number[]): Promise<BookedSession[]> {
    const rows = await this.db.query<{ learnerId: string; grade: number; invite: string }>(
      `SELECT DISTINCT ON (about) about AS "learnerId", grade, invite FROM messages
       WHERE audience = 'learner' AND invite IS NOT NULL AND grade = ANY($1::int[])
       ORDER BY about, created_at DESC`,
      [grades],
    );
    return rows.flatMap((row) => {
      const session = readInvite(row.invite);
      return session ? [{ learnerId: row.learnerId, grade: row.grade, session }] : [];
    });
  }

  async invite(id: string): Promise<{ invite: string; about: string; grade: number } | undefined> {
    const [row] = await this.db.query<{ invite: string | null; about: string; grade: number }>(
      'SELECT invite, about, grade FROM messages WHERE id = $1',
      [id],
    );
    return row?.invite ? { invite: row.invite, about: row.about, grade: row.grade } : undefined;
  }
}
