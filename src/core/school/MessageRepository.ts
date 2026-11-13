import type { Database } from '../db/Database';
import type { DeliveryStatus } from '../delivery/DeliveryPolicy';
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

export type StoredMessage = Omit<NewMessage, 'invite'> & { hasInvite: boolean; createdAt: string };

/** Where the database outbox writes (interface segregation: it needs nothing else). */
export interface MessageStore {
  save(message: NewMessage): Promise<void>;
}

const FIELDS = `id, run_id AS "runId", grade, about, audience, to_address AS "to", subject, body,
  invite IS NOT NULL AS "hasInvite", status, to_char(created_at AT TIME ZONE 'Africa/Johannesburg', 'YYYY-MM-DD HH24:MI') AS "createdAt"`;

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
  forLearner(learnerId: string, limit: number): Promise<StoredMessage[]> {
    return this.db.query(
      `SELECT ${FIELDS} FROM messages WHERE about = $1 AND audience = 'learner' ORDER BY created_at DESC LIMIT $2`,
      [learnerId, limit],
    );
  }

  /** Everything from the latest run for a grade (the teacher's sent log). */
  latestRunFor(grade: number): Promise<StoredMessage[]> {
    return this.db.query(
      `SELECT ${FIELDS} FROM messages WHERE grade = $1 AND run_id = (
         SELECT run_id FROM messages WHERE grade = $1 ORDER BY created_at DESC LIMIT 1
       ) ORDER BY about, audience`,
      [grade],
    );
  }

  async invite(id: string): Promise<{ invite: string; about: string; grade: number } | undefined> {
    const [row] = await this.db.query<{ invite: string | null; about: string; grade: number }>(
      'SELECT invite, about, grade FROM messages WHERE id = $1',
      [id],
    );
    return row?.invite ? { invite: row.invite, about: row.about, grade: row.grade } : undefined;
  }
}
