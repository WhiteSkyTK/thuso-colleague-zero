import type { Database } from '../db/Database';
import type { Role, SchoolUser, TeachingAssignment } from '../domain/schoolUser';

interface UserRow {
  id: string;
  role: SchoolUser['role'];
  email: string;
  first_name: string;
  last_name: string;
  grade: number | null;
}

const USER_FIELDS = 'u.id, u.role, u.email, u.first_name, u.last_name, u.grade';

const toUser = (row: UserRow): SchoolUser => ({
  id: row.id,
  role: row.role,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  grade: row.grade,
});

/** People, sign-in sessions and teaching assignments. Passwords are only ever read as hashes. */
export class UserRepository {
  constructor(private readonly db: Database) {}

  async findForLogin(
    email: string,
  ): Promise<{ user: SchoolUser; passwordHash: string } | undefined> {
    const [row] = await this.db.query<UserRow & { password_hash: string }>(
      `SELECT ${USER_FIELDS}, u.password_hash FROM users u WHERE lower(u.email) = lower($1)`,
      [email],
    );
    return row ? { user: toUser(row), passwordHash: row.password_hash } : undefined;
  }

  async findById(id: string): Promise<SchoolUser | undefined> {
    const [row] = await this.db.query<UserRow>(
      `SELECT ${USER_FIELDS} FROM users u WHERE u.id = $1`,
      [id],
    );
    return row ? toUser(row) : undefined;
  }

  /** Creates a session and clears expired ones in the same transaction. */
  async createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.db.batch([
      { text: 'DELETE FROM sessions WHERE expires_at < now()' },
      {
        text: 'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
        params: [tokenHash, userId, expiresAt.toISOString()],
      },
    ]);
  }

  async userForSession(tokenHash: string): Promise<SchoolUser | undefined> {
    const [row] = await this.db.query<UserRow>(
      `SELECT ${USER_FIELDS} FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [tokenHash],
    );
    return row ? toUser(row) : undefined;
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await this.db.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
  }

  teachingOf(teacherId: string): Promise<TeachingAssignment[]> {
    return this.db.query<TeachingAssignment>(
      'SELECT grade, subject_id AS "subjectId" FROM teaching WHERE teacher_id = $1 ORDER BY grade, subject_id',
      [teacherId],
    );
  }

  /** Who teaches a subject in a grade (the people to tell about a learner). */
  async teachersFor(grade: number, subjectId: string): Promise<string[]> {
    const rows = await this.db.query<{ id: string }>(
      'SELECT teacher_id AS id FROM teaching WHERE grade = $1 AND subject_id = $2 ORDER BY teacher_id',
      [grade, subjectId],
    );
    return rows.map((row) => row.id);
  }

  /** Everyone teaching in a grade, in any subject. */
  async teachersOfGrade(grade: number): Promise<string[]> {
    const rows = await this.db.query<{ id: string }>(
      'SELECT DISTINCT teacher_id AS id FROM teaching WHERE grade = $1 ORDER BY teacher_id',
      [grade],
    );
    return rows.map((row) => row.id);
  }

  async idsWithRole(role: Role): Promise<string[]> {
    const rows = await this.db.query<{ id: string }>(
      'SELECT id FROM users WHERE role = $1 ORDER BY id',
      [role],
    );
    return rows.map((row) => row.id);
  }

  async listStaff(): Promise<SchoolUser[]> {
    const rows = await this.db.query<UserRow>(
      `SELECT ${USER_FIELDS} FROM users u WHERE u.role <> 'learner' ORDER BY u.role, u.id`,
    );
    return rows.map(toUser);
  }
}
