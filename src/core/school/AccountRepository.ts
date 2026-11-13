import type { Database } from '../db/Database';
import type { TeachingAssignment } from '../domain/schoolUser';
import type { LearningFormat } from '../domain/vocab';

interface NewPerson {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}

export interface NewLearner extends NewPerson {
  grade: number;
  formats: readonly LearningFormat[];
  guardianName: string;
  guardianEmail: string;
  subjects: readonly string[];
}

export interface NewTeacher extends NewPerson {
  teaching: readonly TeachingAssignment[];
}

const BLOCK = 100;
const FIRST_GRADE = 10;
const TEACHER_BLOCK = 1;

/** Accounts the admin or principal creates: learners with their subjects, teachers with classes. */
export class AccountRepository {
  constructor(private readonly db: Database) {}

  async isEmailTaken(email: string): Promise<boolean> {
    const rows = await this.db.query('SELECT 1 FROM users WHERE lower(email) = lower($1)', [email]);
    return rows.length > 0;
  }

  /**
   * Next free id in a block, e.g. L-034 (Grade 10 learners use 0–99, Grade 11 100–199, Grade 12
   * 200–299) or S-106 (teachers use 100–199), so ids keep the shape the rest of the system expects.
   */
  private async nextId(prefix: 'L' | 'S', block: number): Promise<string> {
    const low = block * BLOCK;
    const [row] = await this.db.query<{ top: number | null }>(
      `SELECT max(substring(id FROM 3)::int) AS top FROM users
       WHERE id ~ $1 AND substring(id FROM 3)::int BETWEEN $2 AND $3`,
      [`^${prefix}-[0-9]{3}$`, low, low + BLOCK - 1],
    );
    const next = Math.max(row?.top ?? low, low) + 1;
    if (next >= low + BLOCK) {
      throw new RangeError(`No free ${prefix} ids left in this block`);
    }
    return `${prefix}-${String(next).padStart(3, '0')}`;
  }

  async addLearner(learner: NewLearner): Promise<string> {
    const id = await this.nextId('L', learner.grade - FIRST_GRADE);
    await this.db.batch([
      {
        text: `INSERT INTO users (id, role, email, first_name, last_name, password_hash, grade,
                 preferred_formats, guardian_name, guardian_email)
               VALUES ($1, 'learner', $2, $3, $4, $5, $6, $7, $8, $9)`,
        params: [
          id,
          learner.email,
          learner.firstName,
          learner.lastName,
          learner.passwordHash,
          learner.grade,
          [...learner.formats],
          learner.guardianName,
          learner.guardianEmail,
        ],
      },
      {
        text: 'INSERT INTO subject_choices (learner_id, subjects) VALUES ($1, $2)',
        params: [id, [...learner.subjects]],
      },
    ]);
    return id;
  }

  async addTeacher(teacher: NewTeacher): Promise<string> {
    const id = await this.nextId('S', TEACHER_BLOCK);
    await this.db.batch([
      {
        text: `INSERT INTO users (id, role, email, first_name, last_name, password_hash)
               VALUES ($1, 'teacher', $2, $3, $4, $5)`,
        params: [id, teacher.email, teacher.firstName, teacher.lastName, teacher.passwordHash],
      },
      ...teacher.teaching.map((t) => ({
        text: 'INSERT INTO teaching (teacher_id, grade, subject_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        params: [id, t.grade, t.subjectId],
      })),
    ]);
    return id;
  }
}
