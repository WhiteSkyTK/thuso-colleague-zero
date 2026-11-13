'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { alertsForMarkChange } from '@/core/alerts/alertRules';
import { markPaper, QuestionSchema, topicPercentages } from '@/core/marking/markAnswers';
import { notifyAlerts } from '@/lib/alerts';
import { requireUser } from '@/lib/auth';
import { classFor, forgetClass, school } from '@/lib/school';
import type { ActionResult } from '../teacher/actions';

/** A link to an uploaded school file, or any https page (e.g. the DBE paper). */
const PaperLink = z.union([
  z.url({ protocol: /^https$/ }).max(500),
  z.string().regex(/^\/api\/files\/[0-9a-f-]{36}$/),
]);
const PERCENT = 100;
const PRACTICE_WEEK = 10;

const NewSetSchema = z.object({
  grade: z.number().int().min(10).max(12),
  subjectId: z.string().regex(/^[A-Z]{3,6}$/),
  title: z.string().trim().min(3).max(120),
  paperUrl: PaperLink.optional().or(z.literal('').transform(() => undefined)),
  questions: z
    .array(QuestionSchema.omit({ id: true }))
    .min(1)
    .max(30),
});

/** Teachers change only what they teach; the principal and admin any grade. */
async function staffFor(grade: number, subjectId: string): Promise<string | undefined> {
  const user = await requireUser(['teacher', 'principal', 'admin']);
  if (user.role !== 'teacher') {
    return user.id;
  }
  const { users } = await school();
  const teaching = await users.teachingOf(user.id);
  return teaching.some((t) => t.grade === grade && t.subjectId === subjectId) ? user.id : undefined;
}

export async function createSetAction(input: unknown): Promise<ActionResult> {
  const parsed = NewSetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        'Give the paper a title and every question a prompt, a memo answer, marks and a topic.',
    };
  }
  const set = parsed.data;
  const staffId = await staffFor(set.grade, set.subjectId);
  if (!staffId) {
    return { error: 'You can only build practice papers for the subjects you teach.' };
  }
  const { data, practice } = await school();
  // Each practice paper is also a past-paper task, so verified marks land in the learner's record.
  const task = await data.addTask(
    {
      grade: set.grade,
      subjectId: set.subjectId,
      title: `Practice: ${set.title}`,
      kind: 'past-paper',
      week: PRACTICE_WEEK,
      topics: [...new Set(set.questions.map((q) => q.topic))],
    },
    staffId,
  );
  await practice.addSet(
    {
      id: randomUUID(),
      grade: set.grade,
      subjectId: set.subjectId,
      title: set.title,
      taskId: task.id,
      paperUrl: set.paperUrl ?? null,
      questions: set.questions.map((q, at) => ({ ...q, id: `q${at + 1}` })),
    },
    staffId,
  );
  forgetClass(set.grade);
  revalidatePath('/portal', 'layout');
  return { message: `${set.title} is ready. Learners in Grade ${set.grade} can start it now.` };
}

const SubmitSchema = z.object({
  setId: z.uuid(),
  answers: z
    .array(z.object({ questionId: z.string().regex(/^q\d{1,2}$/), answer: z.string().max(1000) }))
    .max(30),
  workUrl: PaperLink.optional().or(z.literal('').transform(() => undefined)),
});

export type SubmitResult = ActionResult & { awarded?: number; max?: number; toCheck?: number };

export async function submitAnswersAction(input: unknown): Promise<SubmitResult> {
  const user = await requireUser(['learner']);
  const parsed = SubmitSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Some answers are too long. Keep each one under 1 000 characters.' };
  }
  const { practice, users, notifications } = await school();
  const set = await practice.set(parsed.data.setId);
  if (set?.grade !== user.grade) {
    return { error: 'This practice paper is not for your grade.' };
  }
  const paper = markPaper(set.questions, parsed.data.answers);
  await practice.submit({
    id: randomUUID(),
    setId: set.id,
    learnerId: user.id,
    answers: parsed.data.answers,
    workUrl: parsed.data.workUrl ?? null,
    proposed: paper.marks,
    scorePct: Math.round((paper.awarded / paper.max) * PERCENT),
  });
  const teachers = await users.teachersFor(set.grade, set.subjectId);
  const flagged =
    paper.toCheck > 0 ? ' and flagged ' + paper.toCheck + ' answers for you to check' : '';
  await notifications.add(
    teachers.map((teacherId) => ({
      id: randomUUID(),
      userId: teacherId,
      kind: 'to-mark' as const,
      title: `${user.firstName} ${user.lastName} handed in ${set.title}`,
      body: `Thuso proposed ${paper.awarded}/${paper.max}${flagged}.`,
      learnerId: user.id,
      grade: set.grade,
      link: `/portal/practice/${set.id}`,
    })),
  );
  revalidatePath('/portal', 'layout');
  return {
    message: 'Handed in. Thuso marked it; your teacher will confirm.',
    awarded: paper.awarded,
    max: paper.max,
    toCheck: paper.toCheck,
  };
}

const VerifySchema = z.object({
  setId: z.uuid(),
  learnerId: z.string().regex(/^L-\d{3}$/),
  final: z.record(z.string().regex(/^q\d{1,2}$/), z.number().min(0).max(20)),
});

/** The teacher accepts or overrides Thuso's marks; the result becomes the learner's topic marks. */
export async function verifyMarksAction(input: unknown): Promise<ActionResult> {
  const parsed = VerifySchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Every mark must be a number from 0 to the question’s total.' };
  }
  const { practice, data, notifications, riskThreshold } = await school();
  const set = await practice.set(parsed.data.setId);
  const staffId = set ? await staffFor(set.grade, set.subjectId) : undefined;
  const submission = set ? await practice.submissionOf(set.id, parsed.data.learnerId) : undefined;
  if (!set || !staffId || !submission) {
    return { error: 'You can only verify marks for the subjects you teach.' };
  }
  const final = Object.fromEntries(
    set.questions.map((q) => [q.id, Math.min(q.marks, parsed.data.final[q.id] ?? 0)]),
  );
  const awarded = Object.values(final).reduce((total, mark) => total + mark, 0);
  const max = set.questions.reduce((total, q) => total + q.marks, 0);
  const scorePct = Math.round((awarded / max) * PERCENT);
  await practice.verify(submission.id, { final, scorePct, teacherId: staffId });

  const before = await classFor(set.grade);
  const perTopic = topicPercentages(set.questions, new Map(Object.entries(final)));
  await Promise.all(
    [...perTopic].map(([topic, pct]) =>
      data.recordMarks({
        grade: set.grade,
        taskId: set.taskId ?? 'T-99',
        subjectId: set.subjectId,
        week: PRACTICE_WEEK,
        topic,
        marks: [{ learnerId: submission.learnerId, scorePct: pct }],
      }),
    ),
  );
  forgetClass(set.grade);
  const alerts = alertsForMarkChange({
    before,
    after: await classFor(set.grade),
    subjectId: set.subjectId,
    topic: [...perTopic.keys()].join(', '),
    marks: [{ learnerId: submission.learnerId, scorePct }],
    threshold: riskThreshold,
  });
  await Promise.all([
    notifyAlerts(set.grade, alerts),
    notifications.add([
      {
        id: randomUUID(),
        userId: submission.learnerId,
        kind: 'marked',
        title: `${set.title}: ${scorePct}% — confirmed by your teacher`,
        body: 'Open the paper to see the marks and feedback for every question.',
        grade: set.grade,
        link: `/portal/practice/${set.id}`,
      },
    ]),
  ]);
  revalidatePath('/portal', 'layout');
  return {
    message: `Verified: ${awarded}/${max} (${scorePct}%). The marks are in the learner's record now.`,
  };
}
