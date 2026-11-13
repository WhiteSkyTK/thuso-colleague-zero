import type { Database } from '../db/Database';

export interface LearnerNote {
  question: string;
  answer: string;
  createdAt: string;
}

/** What learners told Thuso in check-ins — the notes it keeps to learn how each one learns. */
export class NoteRepository {
  constructor(private readonly db: Database) {}

  async add(note: {
    id: string;
    learnerId: string;
    question: string;
    answer: string;
  }): Promise<void> {
    await this.db.query(
      'INSERT INTO learner_notes (id, learner_id, question, answer) VALUES ($1, $2, $3, $4)',
      [note.id, note.learnerId, note.question, note.answer],
    );
  }

  recent(learnerId: string, limit: number): Promise<LearnerNote[]> {
    return this.db.query(
      `SELECT question, answer, to_char(created_at AT TIME ZONE 'Africa/Johannesburg', 'DD Mon') AS "createdAt"
       FROM learner_notes WHERE learner_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [learnerId, limit],
    );
  }

  /** The learner's own notes for one lesson (empty when none yet). */
  async lessonNote(learnerId: string, resourceId: string): Promise<string> {
    const [row] = await this.db.query<{ text: string }>(
      'SELECT text FROM lesson_notes WHERE learner_id = $1 AND resource_id = $2',
      [learnerId, resourceId],
    );
    return row?.text ?? '';
  }

  async saveLessonNote(note: {
    learnerId: string;
    resourceId: string;
    text: string;
  }): Promise<void> {
    await this.db.query(
      `INSERT INTO lesson_notes (learner_id, resource_id, text) VALUES ($1, $2, $3)
       ON CONFLICT (learner_id, resource_id) DO UPDATE SET text = EXCLUDED.text, updated_at = now()`,
      [note.learnerId, note.resourceId, note.text],
    );
  }

  /** True when the learner already answered a check-in today (South African time). */
  async answeredToday(learnerId: string): Promise<boolean> {
    const [row] = await this.db.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM learner_notes WHERE learner_id = $1
       AND (created_at AT TIME ZONE 'Africa/Johannesburg')::date = (now() AT TIME ZONE 'Africa/Johannesburg')::date`,
      [learnerId],
    );
    return (row?.count ?? 0) > 0;
  }
}
