import { randomUUID } from 'node:crypto';
import type { AssistantLink } from '@/core/assistant/answerQuestion';
import type { SchoolUser } from '@/core/domain/schoolUser';
import { isFormat } from '@/core/assistant/checkIns';
import { FORMAT_LABEL } from './labels';
import { learnerView } from './learnerView';
import { rememberFormat } from './rememberFormat';
import { school } from './school';

export interface FollowUp {
  message: string;
  links: AssistantLink[];
}

const TEAM_LINK: AssistantLink = {
  label: '🤝 Let my study team plan my week',
  href: '/portal/learner#study-team',
};

/** The subject that needs the most work and its first lesson, in the learner's format. */
async function weakestLesson(learnerId: string) {
  const view = await learnerView(learnerId);
  const weakest = [...(view?.profile.subjects ?? [])]
    .filter((s) => s.suggestions.length > 0)
    .sort((a, b) => Number(b.isAtRisk) - Number(a.isAtRisk) || a.averagePct - b.averagePct)[0];
  const lesson =
    weakest?.suggestions.find((r) => r.rung === 'foundation') ?? weakest?.suggestions[0];
  return weakest && lesson ? { subject: weakest, lesson } : undefined;
}

async function tellTeachers(user: SchoolUser, subjectId: string, subjectName: string) {
  if (user.grade === null) {
    return;
  }
  const { users, notifications } = await school();
  const teachers = await users.teachersFor(user.grade, subjectId);
  await notifications.add(
    teachers.map((teacherId) => ({
      id: randomUUID(),
      userId: teacherId,
      kind: 'check-in' as const,
      title: `${user.firstName} ${user.lastName} feels lost in ${subjectName}`,
      body: 'From today’s check-in. Thuso sent a start-here lesson; a quick word from you would help.',
      learnerId: user.id,
      grade: user.grade ?? undefined,
      link: `/portal/learners/${user.id}`,
    })),
  );
}

async function feelingFollowUp(user: SchoolUser, value: string): Promise<FollowUp> {
  const found = await weakestLesson(user.id);
  if (!found) {
    return { message: 'Thanks for telling me. I’ll keep an eye out.', links: [] };
  }
  const { subject, lesson } = found;
  const lessonLink = { label: `▶ ${lesson.title}`, href: `/portal/lesson/${lesson.id}` };
  if (value === 'lost') {
    await tellTeachers(user, subject.subjectId, subject.subjectName);
    return {
      message: `Thank you for being honest 💜 You’re not alone. Start small: one ${lesson.minutes}-minute lesson in ${subject.subjectName}. I’ve also let your ${subject.subjectName} teacher know, so they can help.`,
      links: [lessonLink, TEAM_LINK],
    };
  }
  if (value === 'okay') {
    return {
      message: `Okay is a start. One short lesson in ${subject.subjectName} today will move it.`,
      links: [lessonLink, TEAM_LINK],
    };
  }
  return {
    message: 'Love that! Lock it in with a few exam questions.',
    links: [{ label: '✓ Exam practice', href: `/portal/lesson/${lesson.id}?format=practice` }],
  };
}

/** What Thuso does with a check-in answer — it acts, it doesn't just take notes. */
export async function followUpCheckIn(
  user: SchoolUser,
  checkInId: string,
  value: string,
): Promise<FollowUp> {
  if (checkInId === 'feeling') {
    return feelingFollowUp(user, value);
  }
  if (isFormat(value) && user.grade !== null) {
    await rememberFormat(user.id, user.grade, value);
    const found = await weakestLesson(user.id);
    return {
      message: `Done — your lessons now start with ${FORMAT_LABEL[value].toLowerCase()}.`,
      links: found
        ? [
            {
              label: `▶ Try it: ${found.lesson.title}`,
              href: `/portal/lesson/${found.lesson.id}?format=${value}`,
            },
          ]
        : [],
    };
  }
  if (checkInId === 'minutes') {
    return {
      message: `Got it — your study team will keep each day to ${value} minutes.`,
      links: [TEAM_LINK],
    };
  }
  return { message: 'Noted — I’ll plan around that.', links: [TEAM_LINK] };
}
