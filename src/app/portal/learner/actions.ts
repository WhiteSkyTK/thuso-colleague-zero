'use server';

import { revalidatePath } from 'next/cache';
import type { StudyTeamResult } from '@/core/tutor/studyTeam';
import { requireUser } from '@/lib/auth';
import { runStudyTeamFor } from '@/lib/studyTeam';

/** Two runs per learner per minute is plenty (in memory, per server instance). */
const MAX_PER_MINUTE = 2;
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
