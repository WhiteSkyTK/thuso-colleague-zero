import type { Database, Statement } from '../db/Database';
import { insertRows } from '../db/insertRows';
import type { ClassData } from '../domain/classData';
import type { Role } from '../domain/schoolUser';
import { deriveGrade } from './deriveGrade';

interface StaffMember {
  id: string;
  role: Exclude<Role, 'learner'>;
  email: string;
  firstName: string;
  lastName: string;
  teaches?: string;
}

/** Invented staff on example.org. Teachers teach their subject in every grade. */
export const DEMO_STAFF: readonly StaffMember[] = [
  {
    id: 'S-101',
    role: 'teacher',
    email: 'maths.teacher@school.example.org',
    firstName: 'Nomvula',
    lastName: 'Khoza',
    teaches: 'MATH',
  },
  {
    id: 'S-102',
    role: 'teacher',
    email: 'science.teacher@school.example.org',
    firstName: 'Pieter',
    lastName: 'Botha',
    teaches: 'PHSC',
  },
  {
    id: 'S-201',
    role: 'principal',
    email: 'principal@school.example.org',
    firstName: 'Grace',
    lastName: 'Molefe',
  },
  {
    id: 'S-301',
    role: 'admin',
    email: 'admin@school.example.org',
    firstName: 'School',
    lastName: 'Admin',
  },
];

export interface SeedOptions {
  /** The Grade 10 class with the demo's hard cases; Grades 11 and 12 are derived from it. */
  grade10: ClassData;
  /** Hash of the shared demo password for learners, teachers and the principal. */
  demoPasswordHash: string;
  /** The admin is only created when an admin password was configured. */
  adminPasswordHash?: string;
}

const USER_COLUMNS = {
  id: 'text',
  role: 'text',
  email: 'text',
  first_name: 'text',
  last_name: 'text',
  password_hash: 'text',
  grade: 'int',
  preferred_formats: 'text[]',
  guardian_name: 'text',
  guardian_email: 'text',
} as const;

function classStatements(data: ClassData, grade: number, passwordHash: string): Statement[] {
  return [
    insertRows(
      'users',
      USER_COLUMNS,
      data.learners.map((l) => ({
        id: l.id,
        role: 'learner',
        email: l.learnerEmail,
        first_name: l.firstName,
        last_name: l.lastName,
        password_hash: passwordHash,
        grade,
        preferred_formats: l.preferredFormats,
        guardian_name: l.guardianName,
        guardian_email: l.guardianEmail,
      })),
    ),
    insertRows(
      'subjects',
      { grade: 'int', id: 'text', name: 'text', topics: 'text[]' },
      data.subjects.map((s) => ({ grade, id: s.id, name: s.name, topics: s.topics })),
    ),
    insertRows(
      'tasks',
      {
        grade: 'int',
        id: 'text',
        subject_id: 'text',
        title: 'text',
        kind: 'text',
        week: 'int',
        topics: 'text[]',
      },
      data.tasks.map((t) => ({
        grade,
        id: t.id,
        subject_id: t.subjectId,
        title: t.title,
        kind: t.kind,
        week: t.week,
        topics: t.topics,
      })),
    ),
    insertRows(
      'results',
      {
        learner_id: 'text',
        grade: 'int',
        task_id: 'text',
        subject_id: 'text',
        week: 'int',
        topic: 'text',
        score_pct: 'real',
      },
      data.results.map((r) => ({
        learner_id: r.learnerId,
        grade,
        task_id: r.taskId,
        subject_id: r.subjectId,
        week: r.week,
        topic: r.topic,
        score_pct: r.scorePct,
      })),
    ),
    insertRows(
      'attendance',
      { learner_id: 'text', week: 'int', absences: 'int' },
      data.attendance.map((a) => ({ learner_id: a.learnerId, week: a.week, absences: a.absences })),
    ),
    insertRows(
      'homework',
      { learner_id: 'text', subject_id: 'text', assigned: 'int', submitted: 'int' },
      data.homework.map((h) => ({
        learner_id: h.learnerId,
        subject_id: h.subjectId,
        assigned: h.assigned,
        submitted: h.submitted,
      })),
    ),
    insertRows(
      'reflections',
      { learner_id: 'text', text: 'text' },
      data.reflections.map((r) => ({ learner_id: r.learnerId, text: r.text })),
    ),
    insertRows(
      'resources',
      {
        grade: 'int',
        id: 'text',
        subject_id: 'text',
        title: 'text',
        topic: 'text',
        minutes: 'int',
        format: 'text',
        rung: 'text',
        origin: 'text',
      },
      data.resources.map((r) => ({
        grade,
        id: r.id,
        subject_id: r.subjectId,
        title: r.title,
        topic: r.topic,
        minutes: r.minutes,
        format: r.format,
        rung: r.rung,
        origin: r.origin,
      })),
    ),
  ];
}

function staffStatements(
  options: SeedOptions,
  subjectsByGrade: Map<number, string[]>,
): Statement[] {
  const staff = DEMO_STAFF.filter((member) => member.role !== 'admin' || options.adminPasswordHash);
  const passwordOf = (member: StaffMember) =>
    member.role === 'admin' ? (options.adminPasswordHash ?? '') : options.demoPasswordHash;
  const teaching = staff.flatMap((member) =>
    [...subjectsByGrade].flatMap(([grade, subjects]) =>
      member.teaches && subjects.includes(member.teaches)
        ? [{ teacher_id: member.id, grade, subject_id: member.teaches }]
        : [],
    ),
  );
  return [
    insertRows(
      'users',
      USER_COLUMNS,
      staff.map((m) => ({
        id: m.id,
        role: m.role,
        email: m.email,
        first_name: m.firstName,
        last_name: m.lastName,
        password_hash: passwordOf(m),
        grade: null,
        preferred_formats: [],
        guardian_name: null,
        guardian_email: null,
      })),
    ),
    insertRows('teaching', { teacher_id: 'text', grade: 'int', subject_id: 'text' }, teaching),
  ];
}

/**
 * Loads the demo school — Grades 10, 11 and 12 plus staff — in one transaction. Idempotent:
 * rows that already exist are left alone, so a second run (or two cold starts at once) is harmless.
 */
export async function seedSchool(
  db: Database,
  options: SeedOptions,
): Promise<{ learners: number }> {
  const classes = [
    { grade: 10, data: options.grade10 },
    { grade: 11, data: deriveGrade(options.grade10, 11) },
    { grade: 12, data: deriveGrade(options.grade10, 12) },
  ];
  const subjectsByGrade = new Map(
    classes.map(({ grade, data }) => [grade, data.subjects.map((s) => s.id)]),
  );
  await db.batch([
    ...classes.flatMap(({ grade, data }) => classStatements(data, grade, options.demoPasswordHash)),
    ...staffStatements(options, subjectsByGrade),
    insertRows(
      'calendar',
      { date: 'text', free_slots: 'text[]' },
      options.grade10.calendar.map((day) => ({ date: day.date, free_slots: day.freeSlots })),
    ),
  ]);
  return { learners: classes.reduce((total, { data }) => total + data.learners.length, 0) };
}

export async function isSeeded(db: Database): Promise<boolean> {
  const [row] = await db.query<{ count: number }>('SELECT count(*)::int AS count FROM users');
  return (row?.count ?? 0) > 0;
}
