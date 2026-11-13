import type { Database } from '../db/Database';

/** Each learner's seven NSC subjects. The rules are checked before anything is saved. */
export class SubjectChoiceRepository {
  constructor(private readonly db: Database) {}

  async get(learnerId: string): Promise<string[] | undefined> {
    const [row] = await this.db.query<{ subjects: string[] }>(
      'SELECT subjects FROM subject_choices WHERE learner_id = $1',
      [learnerId],
    );
    return row?.subjects;
  }

  async save(learnerId: string, subjects: readonly string[]): Promise<void> {
    await this.db.query(
      `INSERT INTO subject_choices (learner_id, subjects) VALUES ($1, $2)
       ON CONFLICT (learner_id) DO UPDATE SET subjects = EXCLUDED.subjects, updated_at = now()`,
      [learnerId, [...subjects]],
    );
  }
}
