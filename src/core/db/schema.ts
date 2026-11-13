import type { Database } from './Database';

/**
 * The school's tables. Idempotent (IF NOT EXISTS), so running it on every cold start is safe and
 * costs one round trip. Subjects, tasks and resources are scoped by grade; ids are unique per grade.
 */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    role text NOT NULL CHECK (role IN ('learner', 'teacher', 'principal', 'admin')),
    email text NOT NULL UNIQUE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    password_hash text NOT NULL,
    grade int CHECK (grade BETWEEN 10 AND 12),
    preferred_formats text[] NOT NULL DEFAULT '{}',
    guardian_name text,
    guardian_email text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS users_grade ON users (grade) WHERE role = 'learner'`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS subjects (
    grade int NOT NULL, id text NOT NULL, name text NOT NULL, topics text[] NOT NULL,
    PRIMARY KEY (grade, id)
  )`,
  `CREATE TABLE IF NOT EXISTS teaching (
    teacher_id text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    grade int NOT NULL, subject_id text NOT NULL,
    PRIMARY KEY (teacher_id, grade, subject_id)
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    grade int NOT NULL, id text NOT NULL, subject_id text NOT NULL, title text NOT NULL,
    kind text NOT NULL, week int NOT NULL, topics text[] NOT NULL,
    created_by text, created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (grade, id)
  )`,
  `CREATE TABLE IF NOT EXISTS results (
    learner_id text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    grade int NOT NULL, task_id text NOT NULL, subject_id text NOT NULL,
    week int NOT NULL, topic text NOT NULL, score_pct real NOT NULL CHECK (score_pct BETWEEN 0 AND 100),
    PRIMARY KEY (learner_id, subject_id, task_id, topic)
  )`,
  `CREATE INDEX IF NOT EXISTS results_grade_subject ON results (grade, subject_id)`,
  `CREATE TABLE IF NOT EXISTS attendance (
    learner_id text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    week int NOT NULL, absences int NOT NULL CHECK (absences BETWEEN 0 AND 5),
    PRIMARY KEY (learner_id, week)
  )`,
  `CREATE TABLE IF NOT EXISTS homework (
    learner_id text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    subject_id text NOT NULL, assigned int NOT NULL, submitted int NOT NULL,
    PRIMARY KEY (learner_id, subject_id)
  )`,
  `CREATE TABLE IF NOT EXISTS reflections (
    learner_id text PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    text text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS resources (
    grade int NOT NULL, id text NOT NULL, subject_id text NOT NULL, title text NOT NULL,
    topic text NOT NULL, minutes int NOT NULL, format text NOT NULL, rung text NOT NULL, origin text NOT NULL,
    PRIMARY KEY (grade, id)
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id text PRIMARY KEY,
    run_id text NOT NULL, grade int NOT NULL, about text NOT NULL, audience text NOT NULL,
    to_address text NOT NULL, subject text NOT NULL, body text NOT NULL, invite text,
    status text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS messages_about ON messages (about, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS messages_grade ON messages (grade, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS runs (
    id text PRIMARY KEY, grade int NOT NULL, goal text NOT NULL, started_by text, provider text,
    started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
    status text NOT NULL DEFAULT 'running',
    delivered int NOT NULL DEFAULT 0, fixes int NOT NULL DEFAULT 0, flags int NOT NULL DEFAULT 0,
    escalations int NOT NULL DEFAULT 0, human_interventions int NOT NULL DEFAULT 0,
    duration_ms int NOT NULL DEFAULT 0, events jsonb NOT NULL DEFAULT '[]'
  )`,
  `CREATE INDEX IF NOT EXISTS runs_started ON runs (started_at DESC)`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    kind text NOT NULL, title text NOT NULL, body text NOT NULL,
    learner_id text, grade int, link text,
    created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz
  )`,
  `CREATE INDEX IF NOT EXISTS notifications_user ON notifications (user_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS past_papers (
    id text PRIMARY KEY, grade int NOT NULL, subject_id text NOT NULL, year int NOT NULL,
    paper text NOT NULL, title text NOT NULL, url text NOT NULL, memo_url text,
    topics text[] NOT NULL DEFAULT '{}', created_by text, created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS past_papers_grade ON past_papers (grade, subject_id, year DESC)`,
  `CREATE TABLE IF NOT EXISTS subject_choices (
    learner_id text PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    subjects text[] NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS meta (key text PRIMARY KEY, value text NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS files (
    id text PRIMARY KEY, owner_id text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name text NOT NULL, content_type text NOT NULL, size int NOT NULL, data_base64 text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS practice_sets (
    id text PRIMARY KEY, grade int NOT NULL, subject_id text NOT NULL, title text NOT NULL,
    task_id text, paper_url text, questions jsonb NOT NULL, created_by text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS submissions (
    id text PRIMARY KEY, set_id text NOT NULL REFERENCES practice_sets (id) ON DELETE CASCADE,
    learner_id text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    answers jsonb NOT NULL, work_url text, proposed jsonb NOT NULL, final jsonb,
    status text NOT NULL, score_pct real NOT NULL, verified_by text, verified_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (set_id, learner_id)
  )`,
  `CREATE TABLE IF NOT EXISTS calendar (date text PRIMARY KEY, free_slots text[] NOT NULL)`,
] as const;

export async function migrate(db: Database): Promise<void> {
  await db.batch(SCHEMA.map((text) => ({ text })));
}
