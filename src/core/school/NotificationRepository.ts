import type { AlertKind } from '../alerts/alertRules';
import type { Database } from '../db/Database';

export interface NewNotification {
  id: string;
  userId: string;
  kind: AlertKind;
  title: string;
  body: string;
  learnerId?: string;
  grade?: number;
  link?: string;
}

export interface Notification {
  id: string;
  kind: AlertKind;
  title: string;
  body: string;
  link: string | null;
  createdAt: string;
}

/** The same alert about the same learner reaches a person at most once in this many days. */
const QUIET_DAYS = 7;

/** Alerts for each person: what Thuso noticed in the background, newest first. */
export class NotificationRepository {
  constructor(private readonly db: Database) {}

  /** Adds alerts in one statement, skipping any the person already got this week. */
  async add(notifications: readonly NewNotification[]): Promise<number> {
    if (notifications.length === 0) {
      return 0;
    }
    const rows = notifications.map((n) => ({
      id: n.id,
      user_id: n.userId,
      kind: n.kind,
      title: n.title,
      body: n.body,
      learner_id: n.learnerId ?? null,
      grade: n.grade ?? null,
      link: n.link ?? null,
    }));
    const inserted = await this.db.query<{ id: string }>(
      `INSERT INTO notifications (id, user_id, kind, title, body, learner_id, grade, link)
       SELECT r.id, r.user_id, r.kind, r.title, r.body, r.learner_id, r.grade, r.link
       FROM jsonb_to_recordset($1::jsonb) AS r(id text, user_id text, kind text, title text, body text,
         learner_id text, grade int, link text)
       WHERE r.kind IN ('plan-ready', 'run-summary') OR NOT EXISTS (
         SELECT 1 FROM notifications n WHERE n.user_id = r.user_id AND n.kind = r.kind
           AND n.learner_id IS NOT DISTINCT FROM r.learner_id AND n.title = r.title
           AND n.created_at > now() - make_interval(days => ${QUIET_DAYS})
       )
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [JSON.stringify(rows)],
    );
    return inserted.length;
  }

  unreadFor(userId: string, limit: number): Promise<Notification[]> {
    return this.db.query(
      `SELECT id, kind, title, body, link,
         to_char(created_at AT TIME ZONE 'Africa/Johannesburg', 'DD Mon HH24:MI') AS "createdAt"
       FROM notifications WHERE user_id = $1 AND read_at IS NULL ORDER BY created_at DESC LIMIT $2`,
      [userId, limit],
    );
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db.query(
      'UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL',
      [userId],
    );
  }
}
