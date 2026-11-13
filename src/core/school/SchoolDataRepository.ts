import type { Database, Statement } from '../db/Database';
import { insertRows } from '../db/insertRows';
import { ClassDataSchema, type ClassData, type Task } from '../domain/classData';

interface LearnerRow {
  id: string;
  first_name: string;
  last_name: string;
  grade: number;
  email: string;
  guardian_name: string | null;
  guardian_email: string | null;
  preferred_formats: string[];
}

export interface MarkEntry {
  learnerId: string;
  scorePct: number;
}

export interface MarkSheet {
  grade: number;
  taskId: string;
  subjectId: string;
  week: number;
  topic: string;
  marks: readonly MarkEntry[];
}

export type NewGradeTask = Omit<Task, 'id'>;

const TASK_ID_DIGITS = 2;

const versionKey = (grade: number) => `data_version:${grade}`;

/** One statement that moves a grade's data version on by one. */
const bumpVersion = (grade: number): Statement => ({
  text: `INSERT INTO meta (key, value) VALUES ($1, '1')
         ON CONFLICT (key) DO UPDATE SET value = (meta.value::int + 1)::text`,
  params: [versionKey(grade)],
});

/** Class data for one grade, read in parallel (one round trip each, no N+1), plus the teacher's writes. */
export class SchoolDataRepository {
  constructor(private readonly db: Database) {}

  async loadClass(grade: number): Promise<ClassData> {
    const q = <T>(text: string) => this.db.query<T>(text, [grade]);
    const [
      teacher,
      subjects,
      learners,
      tasks,
      results,
      attendance,
      homework,
      reflections,
      resources,
      calendar,
    ] = await Promise.all([
      q<{ name: string; email: string }>(
        `SELECT u.first_name || ' ' || u.last_name AS name, u.email FROM teaching t
           JOIN users u ON u.id = t.teacher_id WHERE t.grade = $1 ORDER BY u.id LIMIT 1`,
      ),
      q<{ id: string; name: string; grade: number; topics: string[] }>(
        'SELECT id, name, grade, topics FROM subjects WHERE grade = $1 ORDER BY id',
      ),
      q<LearnerRow>(
        `SELECT id, first_name, last_name, grade, email, guardian_name, guardian_email, preferred_formats
           FROM users WHERE role = 'learner' AND grade = $1 ORDER BY id`,
      ),
      q<{
        id: string;
        subjectId: string;
        title: string;
        kind: string;
        week: number;
        topics: string[];
      }>(
        'SELECT id, subject_id AS "subjectId", title, kind, week, topics FROM tasks WHERE grade = $1 ORDER BY week, id',
      ),
      q(
        `SELECT learner_id AS "learnerId", task_id AS "taskId", subject_id AS "subjectId", week, topic,
           score_pct AS "scorePct" FROM results WHERE grade = $1`,
      ),
      q(
        `SELECT a.learner_id AS "learnerId", a.week, a.absences FROM attendance a
           JOIN users u ON u.id = a.learner_id WHERE u.grade = $1`,
      ),
      q(
        `SELECT h.learner_id AS "learnerId", h.subject_id AS "subjectId", h.assigned, h.submitted FROM homework h
           JOIN users u ON u.id = h.learner_id WHERE u.grade = $1`,
      ),
      q(
        `SELECT r.learner_id AS "learnerId", r.text FROM reflections r
           JOIN users u ON u.id = r.learner_id WHERE u.grade = $1`,
      ),
      q(
        `SELECT id, subject_id AS "subjectId", title, topic, minutes, format, rung, origin
           FROM resources WHERE grade = $1 ORDER BY id`,
      ),
      this.db.query('SELECT date, free_slots AS "freeSlots" FROM calendar ORDER BY date'),
    ]);
    // Rows are validated like any other input before the agents see them.
    return ClassDataSchema.parse({
      teacher: teacher[0] ?? { name: 'Class teacher', email: 'teacher@school.example.org' },
      subjects,
      learners: learners.map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        grade: row.grade,
        learnerEmail: row.email,
        guardianName: row.guardian_name ?? `Guardian of ${row.id}`,
        guardianEmail: row.guardian_email ?? 'guardian@families.example.org',
        preferredFormats: row.preferred_formats,
      })),
      tasks,
      results,
      attendance,
      homework,
      reflections,
      resources,
      calendar,
    });
  }

  /** Learners per grade, for the principal's overview. */
  /** Changes whenever a grade's data is written, so every server copy knows to reload. */
  async version(grade: number): Promise<number> {
    const [row] = await this.db.query<{ value: string }>('SELECT value FROM meta WHERE key = $1', [
      versionKey(grade),
    ]);
    return Number(row?.value ?? 0);
  }

  gradeSizes(): Promise<{ grade: number; learners: number }[]> {
    return this.db.query(
      `SELECT grade, count(*)::int AS learners FROM users WHERE role = 'learner' GROUP BY grade ORDER BY grade`,
    );
  }

  async addTask(task: NewGradeTask & { grade: number }, createdBy: string): Promise<Task> {
    const [row] = await this.db.query<{ next: number }>(
      `SELECT coalesce(max(substring(id FROM 3)::int), 0) + 1 AS next FROM tasks WHERE grade = $1`,
      [task.grade],
    );
    const id = `T-${String(row?.next ?? 1).padStart(TASK_ID_DIGITS, '0')}`;
    await this.db.query(
      `INSERT INTO tasks (grade, id, subject_id, title, kind, week, topics, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [task.grade, id, task.subjectId, task.title, task.kind, task.week, task.topics, createdBy],
    );
    await this.db.batch([bumpVersion(task.grade)]);
    return {
      id,
      subjectId: task.subjectId,
      title: task.title,
      kind: task.kind,
      week: task.week,
      topics: task.topics,
    };
  }

  /** Saves (or corrects) one topic's marks for a whole class in a single statement. */
  async recordMarks(sheet: MarkSheet): Promise<void> {
    await this.db.batch([
      bumpVersion(sheet.grade),
      insertRows(
        {
          table: 'results',
          onConflict:
            'ON CONFLICT (learner_id, subject_id, task_id, topic) DO UPDATE SET score_pct = EXCLUDED.score_pct',
        },
        {
          learner_id: 'text',
          grade: 'int',
          task_id: 'text',
          subject_id: 'text',
          week: 'int',
          topic: 'text',
          score_pct: 'real',
        },
        sheet.marks.map((mark) => ({
          learner_id: mark.learnerId,
          grade: sheet.grade,
          task_id: sheet.taskId,
          subject_id: sheet.subjectId,
          week: sheet.week,
          topic: sheet.topic,
          score_pct: mark.scorePct,
        })),
      ),
    ]);
  }
}
