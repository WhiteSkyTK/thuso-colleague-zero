'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { TaskSchema } from '@/core/domain/classData';
import { requireUser } from '@/lib/auth';
import { classFor, forgetClass, school } from '@/lib/school';

export interface ActionResult {
  error?: string;
  message?: string;
}

const Grade = z.number().int().min(10).max(12);

const NewTaskSchema = TaskSchema.omit({ id: true }).extend({
  grade: Grade,
  title: z.string().trim().min(1).max(120),
  topics: z.array(z.string().min(1)).min(1).max(8),
});

const MarkSheetSchema = z.object({
  grade: Grade,
  taskId: z.string().regex(/^T-\d{2}$/),
  topic: z.string().min(1).max(100),
  marks: z
    .array(
      z.object({ learnerId: z.string().regex(/^L-\d{3}$/), scorePct: z.number().min(0).max(100) }),
    )
    .min(1)
    .max(60),
});

/** Teachers may only write to the subjects and grades they teach. */
async function teacherOf(grade: number, subjectId: string): Promise<string | undefined> {
  const user = await requireUser(['teacher']);
  const { users } = await school();
  const teaching = await users.teachingOf(user.id);
  return teaching.some((t) => t.grade === grade && t.subjectId === subjectId) ? user.id : undefined;
}

export async function addTaskAction(input: unknown): Promise<ActionResult> {
  const parsed = NewTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Give the task a title, a kind, a week and at least one topic.' };
  }
  const task = parsed.data;
  const teacherId = await teacherOf(task.grade, task.subjectId);
  if (!teacherId) {
    return { error: 'You can only set tasks for the subjects you teach.' };
  }
  const subject = (await classFor(task.grade)).subjects.find((s) => s.id === task.subjectId);
  if (!subject || task.topics.some((topic) => !subject.topics.includes(topic))) {
    return { error: 'Choose topics from the subject.' };
  }
  const { data } = await school();
  const created = await data.addTask(task, teacherId);
  forgetClass(task.grade);
  revalidatePath('/portal', 'layout');
  return { message: `${created.title} added (${created.id}). Learners see it now.` };
}

export async function saveMarksAction(input: unknown): Promise<ActionResult> {
  const parsed = MarkSheetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Every mark must be a number from 0 to 100.' };
  }
  const sheet = parsed.data;
  const classData = await classFor(sheet.grade);
  const task = classData.tasks.find((t) => t.id === sheet.taskId);
  if (!task?.topics.includes(sheet.topic) || !(await teacherOf(sheet.grade, task.subjectId))) {
    return { error: 'You can only capture marks for your own tasks.' };
  }
  const inClass = new Set(classData.learners.map((learner) => learner.id));
  if (sheet.marks.some((mark) => !inClass.has(mark.learnerId))) {
    return { error: 'Some learners are not in this grade.' };
  }
  const { data } = await school();
  await data.recordMarks({ ...sheet, subjectId: task.subjectId, week: task.week });
  forgetClass(sheet.grade);
  revalidatePath('/portal', 'layout');
  return { message: `Saved ${sheet.marks.length} marks. Thuso has re-checked every learner.` };
}
