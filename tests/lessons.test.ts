import { beforeAll, describe, expect, it } from 'vitest';
import { PgliteDatabase } from '@/core/db/PgliteDatabase';
import { migrate } from '@/core/db/schema';
import { LEARNING_FORMATS } from '@/core/domain/vocab';
import { buildLearnerProfile } from '@/core/insights/learnerProfile';
import { buildLesson } from '@/core/lessons/buildLesson';
import { isRightAnswer, makeQuestion, makerKey } from '@/core/lessons/questionMakers';
import { buildStudyPlan } from '@/core/lessons/studyPlan';
import { AccountRepository } from '@/core/school/AccountRepository';
import { NoteRepository } from '@/core/school/NoteRepository';
import { SchoolDataRepository } from '@/core/school/SchoolDataRepository';
import { deriveGrade } from '@/core/seed/deriveGrade';
import { withExtraSubjects } from '@/core/seed/extraSubjects';
import { seedSchool } from '@/core/seed/seedSchool';
import { seedClassData } from './helpers/testKit';

const data = seedClassData();
const resourceOn = (topic: string) => data.resources.find((r) => r.topic === topic)!;

describe('lessons in the learner’s format', () => {
  it('teaches the same topic in every format, each in its own order', () => {
    const resource = resourceOn('functions');
    const firstKinds = LEARNING_FORMATS.map(
      (f) => buildLesson(resource, 'Mathematics', f).blocks[0]?.kind,
    );
    expect(firstKinds).toEqual(['idea', 'pattern', 'diagram', 'listen', 'maker']);
  });

  it('includes gossip, a real-world problem, a picture and a spoken summary', () => {
    const lesson = buildLesson(resourceOn('functions'), 'Mathematics', 'visual-story');
    const kinds = lesson.blocks.map((b) => b.kind);
    expect(kinds).toEqual(expect.arrayContaining(['diagram', 'story', 'gossip', 'realWorld']));
    expect(lesson.hasTopicNotes).toBe(true);
    expect(lesson.summary).toContain('Watch out');
  });

  it('falls back to a study method for topics without notes, without empty blocks', () => {
    const resource = { ...resourceOn('functions'), subjectId: 'HIST', topic: 'the cold war' };
    const lesson = buildLesson(resource, 'History', 'patterns');
    expect(lesson.hasTopicNotes).toBe(false);
    expect(lesson.blocks.map((b) => b.kind)).toEqual([
      'pattern',
      'idea',
      'gossip',
      'steps',
      'questions',
    ]);
    const gossip = lesson.blocks.find((b) => b.kind === 'gossip');
    expect(gossip?.kind === 'gossip' && gossip.lines.some(([who]) => who === 'y')).toBe(true);
  });

  it('has a full lesson with a gossip chat for every topic of six subjects in Grades 10–12', () => {
    const covered = ['ACCN', 'LIFE', 'ENGL', 'LIFO', 'MATH', 'PHSC'];
    const missing: string[] = [];
    for (const grade of [10, 11, 12] as const) {
      const base = grade === 10 ? data : deriveGrade(data, grade);
      const subjects = withExtraSubjects(base, grade).subjects.filter((s) =>
        covered.includes(s.id),
      );
      expect(subjects).toHaveLength(covered.length);
      for (const subject of subjects) {
        for (const topic of subject.topics) {
          const resource = { ...resourceOn('functions'), subjectId: subject.id, topic };
          const lesson = buildLesson(resource, subject.name, 'audio');
          const gossip = lesson.blocks.find((b) => b.kind === 'gossip');
          const isFull =
            lesson.hasTopicNotes && gossip?.kind === 'gossip' && gossip.lines.length >= 5;
          if (!isFull) {
            missing.push(`${subject.id}: ${topic}`);
          }
        }
      }
    }
    expect([...new Set(missing)]).toEqual([]);
  });
});

describe('question makers', () => {
  const lowest = (min: number) => min;
  const highest = (_min: number, max: number) => max;

  it('computes the answer and the working from the numbers it picked', () => {
    const made = makeQuestion(makerKey('MATH', 'Equations and inequalities'), lowest);
    expect(made?.question).toBe('Solve 2x + 1 = -9');
    expect(made?.answer).toBe(-5);
    const energy = makeQuestion(makerKey('PHSC', 'energy'), highest);
    expect(energy?.answer).toBe(1960);
    expect(makeQuestion('HIST:the cold war', lowest)).toBeUndefined();
    expect(makeQuestion(makerKey('ACCN', 'VAT'), lowest)?.answer).toBe(15);
    expect(makeQuestion(makerKey('ACCN', 'budgeting'), lowest)?.answer).toBe(0);
    expect(makeQuestion(makerKey('LIFE', 'biosphere to ecosystems'), highest)?.answer).toBe(900);
  });

  it('accepts commas and small rounding differences, and rejects the rest', () => {
    expect(isRightAnswer('8,5', 8.5)).toBe(true);
    expect(isRightAnswer('0.38', 0.375)).toBe(true);
    expect(isRightAnswer('R1300', 1300)).toBe(true);
    expect(isRightAnswer('9', 8.5)).toBe(false);
    expect(isRightAnswer('', 0)).toBe(false);
  });
});

describe('two-week study plan', () => {
  it('gives ten school days of lessons, at-risk subjects first', () => {
    const profile = buildLearnerProfile(data, 'L-014', 40)!;
    const plan = buildStudyPlan(profile);
    expect(plan).toHaveLength(10);
    expect(plan[0]?.label).toBe('Week 1 · Mon');
    expect(plan[9]?.label).toBe('Week 2 · Fri');
    const resources = new Set(data.resources.map((r) => r.id));
    expect(plan.every((day) => resources.has(day.resource.id))).toBe(true);
  });
});

describe('accounts and notes', () => {
  let db: PgliteDatabase;

  beforeAll(async () => {
    db = await PgliteDatabase.create();
    await migrate(db);
    await seedSchool(db, { grade10: data, demoPasswordHash: 'scrypt$x$y' });
  }, 60_000);

  it('opens learner and teacher accounts with ids in their blocks', async () => {
    const accounts = new AccountRepository(db);
    expect(await accounts.isEmailTaken('NEW.learner@example.org')).toBe(false);
    const learnerId = await accounts.addLearner({
      firstName: 'New',
      lastName: 'Learner',
      email: 'new.learner@example.org',
      passwordHash: 'scrypt$x$y',
      grade: 11,
      formats: ['audio'],
      guardianName: 'Guardian',
      guardianEmail: 'guardian@example.org',
      subjects: ['ZUHL', 'ENGL', 'MATH', 'LIFO', 'PHSC', 'LIFE', 'GEOG'],
    });
    expect(learnerId).toMatch(/^L-1\d{2}$/);
    expect(await accounts.isEmailTaken('NEW.learner@example.org')).toBe(true);
    const grade11 = await new SchoolDataRepository(db).loadClass(11);
    expect(grade11.learners.some((l) => l.id === learnerId)).toBe(true);
    const teacherId = await accounts.addTeacher({
      firstName: 'New',
      lastName: 'Teacher',
      email: 'new.teacher@example.org',
      passwordHash: 'scrypt$x$y',
      teaching: [{ grade: 11, subjectId: 'MATH' }],
    });
    expect(teacherId).toMatch(/^S-1\d{2}$/);
  });

  it('keeps check-in notes and one set of lesson notes per lesson', async () => {
    const notes = new NoteRepository(db);
    await notes.add({
      id: 'n-1',
      learnerId: 'L-014',
      question: 'How do you feel?',
      answer: 'Okay',
    });
    expect(await notes.answeredToday('L-014')).toBe(true);
    expect((await notes.recent('L-014', 4))[0]?.answer).toBe('Okay');
    await notes.saveLessonNote({ learnerId: 'L-014', resourceId: 'R-007', text: 'first' });
    await notes.saveLessonNote({ learnerId: 'L-014', resourceId: 'R-007', text: 'second' });
    expect(await notes.lessonNote('L-014', 'R-007')).toBe('second');
  });
});
