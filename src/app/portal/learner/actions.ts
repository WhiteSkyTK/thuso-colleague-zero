'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { LEARNING_FORMATS, LearningFormatSchema } from '@/core/domain/vocab';
import type { StudyTeamResult } from '@/core/tutor/studyTeam';
import { requireUser } from '@/lib/auth';
import { classFor, forgetClass, school } from '@/lib/school';
import { runStudyTeamFor } from '@/lib/studyTeam';

/** Per account per minute (in memory, per server). High because a whole room shares the demo accounts. */
const MAX_PER_MINUTE = 30;
const WINDOW_MS = 60_000;
const runs = new Map<string, { count: number; resetAt: number }>();

function isLimited(userId: string): boolean {
  const now = Date.now();
  const entry = runs.get(userId);
  if (!entry || entry.resetAt < now) {
    runs.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_MINUTE;
}

/** "Let my study team plan my week": the learner's own agent run. */
export async function runStudyTeamAction(): Promise<StudyTeamResult> {
  const user = await requireUser(['learner']);
  if (isLimited(user.id)) {
    return {
      events: [
        { agent: 'PL', level: 'PLAN', message: 'Your team just made a plan — give it a minute.' },
      ],
      days: [],
    };
  }
  const result = await runStudyTeamFor(user);
  revalidatePath('/portal/learner');
  return result;
}

const FormatsSchema = z.array(LearningFormatSchema).min(1).max(LEARNING_FORMATS.length);

/** The learner ticks the formats they like; Thuso keeps its learned order for the ones still ticked. */
export async function saveFormatsAction(formats: unknown): Promise<{ message: string }> {
  const user = await requireUser(['learner']);
  const parsed = FormatsSchema.safeParse(formats);
  if (!parsed.success || user.grade === null) {
    return { message: 'Tick at least one.' };
  }
  const learner = (await classFor(user.grade)).learners.find((l) => l.id === user.id);
  const kept = (learner?.preferredFormats ?? []).filter((f) => parsed.data.includes(f));
  const ordered = [...new Set([...kept, ...parsed.data])];
  const { users, data } = await school();
  await users.updateFormats(user.id, ordered);
  await data.touch(user.grade);
  forgetClass(user.grade);
  revalidatePath('/portal/learner');
  return { message: '✓ Saved — your next lessons use these.' };
}
