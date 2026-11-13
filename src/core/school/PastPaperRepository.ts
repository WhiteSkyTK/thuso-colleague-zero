import { z } from 'zod';
import type { Database } from '../db/Database';

const FIRST_YEAR = 2008;
const LAST_YEAR = 2030;
/** An https page (e.g. the DBE archive) or a file uploaded to the school portal. */
const HttpsUrl = z.union([
  z.url({ protocol: /^https$/ }).max(500),
  z.string().regex(/^\/api\/files\/[0-9a-f-]{36}$/),
]);

/** What a teacher types to add or change a past paper. Links must be https. */
export const PastPaperInputSchema = z.object({
  grade: z.number().int().min(10).max(12),
  subjectId: z.string().regex(/^[A-Z]{3,6}$/),
  year: z.number().int().min(FIRST_YEAR).max(LAST_YEAR),
  paper: z.enum(['Paper 1', 'Paper 2', 'Paper 3']),
  title: z.string().trim().min(3).max(120),
  url: HttpsUrl,
  memoUrl: HttpsUrl.optional().or(z.literal('').transform(() => undefined)),
  topics: z.array(z.string().min(1).max(80)).max(12).default([]),
});
export type PastPaperInput = z.infer<typeof PastPaperInputSchema>;

export interface PastPaper extends PastPaperInput {
  id: string;
}

const FIELDS = `id, grade, subject_id AS "subjectId", year, paper, title, url,
  coalesce(memo_url, '') AS "memoUrl", topics`;

/** Past exam papers per grade and subject: teachers keep the list, learners practise from it. */
export class PastPaperRepository {
  constructor(private readonly db: Database) {}

  list(grades: readonly number[]): Promise<PastPaper[]> {
    return this.db.query(
      `SELECT ${FIELDS} FROM past_papers WHERE grade = ANY($1::int[])
       ORDER BY grade, subject_id, year DESC, paper`,
      [grades],
    );
  }

  async add(id: string, paper: PastPaperInput, createdBy: string): Promise<void> {
    await this.db.query(
      `INSERT INTO past_papers (id, grade, subject_id, year, paper, title, url, memo_url, topics, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        paper.grade,
        paper.subjectId,
        paper.year,
        paper.paper,
        paper.title,
        paper.url,
        paper.memoUrl ?? null,
        paper.topics,
        createdBy,
      ],
    );
  }

  async update(id: string, paper: PastPaperInput): Promise<boolean> {
    const rows = await this.db.query<{ id: string }>(
      `UPDATE past_papers SET grade = $2, subject_id = $3, year = $4, paper = $5, title = $6, url = $7,
         memo_url = $8, topics = $9 WHERE id = $1 RETURNING id`,
      [
        id,
        paper.grade,
        paper.subjectId,
        paper.year,
        paper.paper,
        paper.title,
        paper.url,
        paper.memoUrl ?? null,
        paper.topics,
      ],
    );
    return rows.length > 0;
  }

  async remove(id: string): Promise<boolean> {
    const rows = await this.db.query<{ id: string }>(
      'DELETE FROM past_papers WHERE id = $1 RETURNING id',
      [id],
    );
    return rows.length > 0;
  }
}
