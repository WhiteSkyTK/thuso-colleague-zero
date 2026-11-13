import { z } from 'zod';
import type { Database } from '../db/Database';
import {
  QuestionSchema,
  type Answer,
  type ProposedMark,
  type Question,
} from '../marking/markAnswers';

export interface PracticeSet {
  id: string;
  grade: number;
  subjectId: string;
  title: string;
  taskId: string | null;
  paperUrl: string | null;
  questions: Question[];
}

export type SubmissionStatus = 'ai-marked' | 'verified';

export interface Submission {
  id: string;
  setId: string;
  learnerId: string;
  answers: Answer[];
  workUrl: string | null;
  proposed: ProposedMark[];
  final: Record<string, number> | null;
  status: SubmissionStatus;
  scorePct: number;
  createdAt: string;
}

const QuestionsSchema = z.array(QuestionSchema);
const json = <T>(value: unknown): T =>
  typeof value === 'string' ? (JSON.parse(value) as T) : (value as T);

const SET_FIELDS = `id, grade, subject_id AS "subjectId", title, task_id AS "taskId", paper_url AS "paperUrl", questions`;
const SUBMISSION_FIELDS = `id, set_id AS "setId", learner_id AS "learnerId", answers, work_url AS "workUrl", proposed, final,
  status, score_pct AS "scorePct", to_char(created_at AT TIME ZONE 'Africa/Johannesburg', 'DD Mon HH24:MI') AS "createdAt"`;

const toSet = (row: PracticeSet): PracticeSet => ({
  ...row,
  questions: QuestionsSchema.parse(json(row.questions)),
});
const toSubmission = (row: Submission): Submission => ({
  ...row,
  answers: json(row.answers),
  proposed: json(row.proposed),
  final: row.final ? json(row.final) : null,
});

/** Practice papers teachers build, and the answers learners hand in with Thuso's proposed marks. */
export class PracticeRepository {
  constructor(private readonly db: Database) {}

  async addSet(set: PracticeSet, createdBy: string): Promise<void> {
    await this.db.query(
      `INSERT INTO practice_sets (id, grade, subject_id, title, task_id, paper_url, questions, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)`,
      [
        set.id,
        set.grade,
        set.subjectId,
        set.title,
        set.taskId,
        set.paperUrl,
        JSON.stringify(set.questions),
        createdBy,
      ],
    );
  }

  async sets(grades: readonly number[]): Promise<PracticeSet[]> {
    const rows = await this.db.query<PracticeSet>(
      `SELECT ${SET_FIELDS} FROM practice_sets WHERE grade = ANY($1::int[]) ORDER BY created_at DESC`,
      [grades],
    );
    return rows.map(toSet);
  }

  async set(id: string): Promise<PracticeSet | undefined> {
    const [row] = await this.db.query<PracticeSet>(
      `SELECT ${SET_FIELDS} FROM practice_sets WHERE id = $1`,
      [id],
    );
    return row ? toSet(row) : undefined;
  }

  /** A learner's latest attempt replaces the previous one until a teacher has verified it. */
  async submit(entry: Omit<Submission, 'final' | 'status' | 'createdAt'>): Promise<void> {
    await this.db.query(
      `INSERT INTO submissions (id, set_id, learner_id, answers, work_url, proposed, status, score_pct)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb, 'ai-marked', $7)
       ON CONFLICT (set_id, learner_id) DO UPDATE SET answers = EXCLUDED.answers, work_url = EXCLUDED.work_url,
         proposed = EXCLUDED.proposed, score_pct = EXCLUDED.score_pct, status = 'ai-marked', final = NULL,
         created_at = now()
       WHERE submissions.status <> 'verified'`,
      [
        entry.id,
        entry.setId,
        entry.learnerId,
        JSON.stringify(entry.answers),
        entry.workUrl,
        JSON.stringify(entry.proposed),
        entry.scorePct,
      ],
    );
  }

  async submissions(setId: string): Promise<Submission[]> {
    const rows = await this.db.query<Submission>(
      `SELECT ${SUBMISSION_FIELDS} FROM submissions WHERE set_id = $1 ORDER BY status, created_at DESC`,
      [setId],
    );
    return rows.map(toSubmission);
  }

  async submissionOf(setId: string, learnerId: string): Promise<Submission | undefined> {
    const [row] = await this.db.query<Submission>(
      `SELECT ${SUBMISSION_FIELDS} FROM submissions WHERE set_id = $1 AND learner_id = $2`,
      [setId, learnerId],
    );
    return row ? toSubmission(row) : undefined;
  }

  async verify(
    id: string,
    verdict: { final: Record<string, number>; scorePct: number; teacherId: string },
  ): Promise<void> {
    const { final, scorePct, teacherId } = verdict;
    await this.db.query(
      `UPDATE submissions SET final = $2::jsonb, score_pct = $3, status = 'verified', verified_by = $4, verified_at = now()
       WHERE id = $1`,
      [id, JSON.stringify(final), scorePct, teacherId],
    );
  }
}
