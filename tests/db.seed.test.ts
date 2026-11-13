import { beforeAll, describe, expect, it } from 'vitest';
import { PgliteDatabase } from '@/core/db/PgliteDatabase';
import { migrate } from '@/core/db/schema';
import { isSeeded, seedSchool } from '@/core/seed/seedSchool';
import { hashPassword, hashToken, newSessionToken, verifyPassword } from '@/core/auth/passwords';
import { buildClassInsights } from '@/core/insights/classInsights';
import { SchoolDataRepository } from '@/core/school/SchoolDataRepository';
import { UserRepository } from '@/core/school/UserRepository';
import { seedClassData } from './helpers/testKit';

let db: PgliteDatabase;

beforeAll(async () => {
  db = await PgliteDatabase.create();
  await migrate(db);
  await migrate(db);
}, 60_000);

describe('seedSchool', () => {
  it('loads Grades 10 to 12 and the staff in one transaction, and can run twice', async () => {
    expect(await isSeeded(db)).toBe(false);
    const options = { grade10: seedClassData(), demoPasswordHash: 'scrypt$x$y' };
    expect(await seedSchool(db, options)).toEqual({ learners: 96 });
    await seedSchool(db, options);
    const grades = await db.query<{ grade: number; count: number }>(
      "SELECT grade, count(*)::int AS count FROM users WHERE role = 'learner' GROUP BY grade ORDER BY grade",
    );
    expect(grades).toEqual([
      { grade: 10, count: 32 },
      { grade: 11, count: 32 },
      { grade: 12, count: 32 },
    ]);
    const staff = await db.query<{ role: string }>(
      "SELECT role FROM users WHERE role <> 'learner' ORDER BY id",
    );
    expect(staff.map((s) => s.role)).toEqual(['teacher', 'teacher', 'principal']);
    const [topics] = await db.query<{ topics: string[] }>(
      "SELECT topics FROM subjects WHERE grade = 12 AND id = 'MATH'",
    );
    expect(topics?.topics).toContain('differential calculus');
    const [refilwe] = await db.query<{ preferred_formats: string[] }>(
      "SELECT preferred_formats FROM users WHERE id = 'L-014'",
    );
    expect(refilwe?.preferred_formats.length).toBeGreaterThan(0);
  }, 60_000);
});

describe('SchoolDataRepository and UserRepository on Postgres', () => {
  it('gives the agents the same Grade 10 class as the seed files, and valid Grades 11 and 12', async () => {
    const repo = new SchoolDataRepository(db);
    const seed = seedClassData();
    const grade10 = await repo.loadClass(10);
    expect(grade10.learners).toHaveLength(32);
    expect(grade10.results).toHaveLength(seed.results.length);
    const maths = buildClassInsights(grade10, 40).subjects.find((s) => s.subjectId === 'MATH');
    expect(maths?.atRisk).toHaveLength(7);
    const grade12 = await repo.loadClass(12);
    expect(grade12.learners[0]?.id).toBe('L-201');
    expect(await repo.gradeSizes()).toEqual([
      { grade: 10, learners: 32 },
      { grade: 11, learners: 32 },
      { grade: 12, learners: 32 },
    ]);
  }, 60_000);

  it('adds a task with the next id and saves or corrects a class mark sheet', async () => {
    const repo = new SchoolDataRepository(db);
    const task = await repo.addTask(
      {
        grade: 11,
        subjectId: 'MATH',
        title: 'Surds quiz',
        kind: 'test',
        week: 9,
        topics: ['exponents and surds'],
      },
      'S-101',
    );
    expect(task.id).toBe('T-11');
    const sheet = {
      grade: 11,
      taskId: task.id,
      subjectId: 'MATH',
      week: 9,
      topic: 'exponents and surds',
    };
    await repo.recordMarks({ ...sheet, marks: [{ learnerId: 'L-101', scorePct: 40 }] });
    await repo.recordMarks({ ...sheet, marks: [{ learnerId: 'L-101', scorePct: 64 }] });
    const rows = await db.query<{ score_pct: number }>(
      "SELECT score_pct FROM results WHERE learner_id = 'L-101' AND task_id = 'T-11'",
    );
    expect(rows).toEqual([{ score_pct: 64 }]);
  }, 60_000);

  it('signs in with a hashed password and a hashed session token', async () => {
    const users = new UserRepository(db);
    const hash = await hashPassword('correct horse');
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, 'S-101']);
    const found = await users.findForLogin('MATHS.teacher@school.example.org');
    expect(found?.user.role).toBe('teacher');
    expect(await verifyPassword('correct horse', found?.passwordHash ?? '')).toBe(true);
    expect(await verifyPassword('wrong', found?.passwordHash ?? '')).toBe(false);
    const token = newSessionToken();
    await users.createSession('S-101', hashToken(token), new Date(Date.now() + 60_000));
    expect((await users.userForSession(hashToken(token)))?.id).toBe('S-101');
    expect(await users.teachingOf('S-101')).toEqual([
      { grade: 10, subjectId: 'MATH' },
      { grade: 11, subjectId: 'MATH' },
      { grade: 12, subjectId: 'MATH' },
    ]);
    await users.deleteSession(hashToken(token));
    expect(await users.userForSession(hashToken(token))).toBeUndefined();
  }, 60_000);
});
