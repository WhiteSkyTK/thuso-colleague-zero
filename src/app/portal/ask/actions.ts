'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { AssistantAnswer } from '@/core/assistant/answerQuestion';
import { CHECK_INS, isFormat } from '@/core/assistant/checkIns';
import { askThuso } from '@/lib/askThuso';
import { requireUser } from '@/lib/auth';
import { rememberFormat } from '@/lib/rememberFormat';
import { school } from '@/lib/school';

const QUESTION_MAX = 300;
const QuestionSchema = z.string().trim().min(2).max(QUESTION_MAX);

/** Twenty questions per person per minute (in memory, per server instance). */
const MAX_PER_MINUTE = 20;
const WINDOW_MS = 60_000;
const asked = new Map<string, { count: number; resetAt: number }>();

function isLimited(userId: string): boolean {
  const now = Date.now();
  const entry = asked.get(userId);
  if (!entry || entry.resetAt < now) {
    asked.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_MINUTE;
}

/** The text box in Thuso's bubble: signed-in only, short questions, answered from live data. */
export async function askThusoAction(question: unknown): Promise<AssistantAnswer> {
  const user = await requireUser();
  const parsed = QuestionSchema.safeParse(question);
  if (!parsed.success) {
    return { answer: `Type a question of 2 to ${QUESTION_MAX} characters.`, links: [] };
  }
  if (isLimited(user.id)) {
    return { answer: 'That is a lot of questions — give me a minute.', links: [] };
  }
  return askThuso(user, parsed.data);
}

const CheckInSchema = z.object({ id: z.string().max(20), value: z.string().max(40) });

/** A learner answers today's check-in: Thuso keeps a note, and a format answer changes how it teaches. */
export async function answerCheckInAction(input: unknown): Promise<{ message: string }> {
  const user = await requireUser(['learner']);
  const parsed = CheckInSchema.safeParse(input);
  const checkIn = CHECK_INS.find((c) => c.id === parsed.data?.id);
  const option = checkIn?.options.find((o) => o.value === parsed.data?.value);
  if (!checkIn || !option) {
    return { message: 'Pick one of the answers.' };
  }
  const { notes } = await school();
  await notes.add({
    id: randomUUID(),
    learnerId: user.id,
    question: checkIn.question,
    answer: option.label,
  });
  if (isFormat(option.value) && user.grade !== null) {
    await rememberFormat(user.id, user.grade, option.value);
  }
  revalidatePath('/portal/learner');
  return { message: 'Thanks — noted. I’ll use that.' };
}
