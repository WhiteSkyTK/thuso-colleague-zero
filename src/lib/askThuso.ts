import { answerLearner } from '@/core/assistant/answerLearner';
import {
  answerStaff,
  type AssistantAnswer,
  type StaffContext,
} from '@/core/assistant/answerQuestion';
import { GRADES, type SchoolUser } from '@/core/domain/schoolUser';
import { learnerView } from './learnerView';
import { classFor, school } from './school';

const SESSION_FORMAT = new Intl.DateTimeFormat('en-ZA', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Johannesburg',
});
const RFC5545 = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/;
const RECENT_MESSAGES = 5;

/** 20261116T123000Z → "Mon 16 Nov, 14:30" (school time). */
export function sessionWhen(start: string): string {
  const parts = RFC5545.exec(start)?.slice(1).map(Number);
  if (!parts || parts.length < 5) {
    return start;
  }
  const [year = 0, month = 1, day = 1, hour = 0, minute = 0] = parts;
  return SESSION_FORMAT.format(new Date(Date.UTC(year, month - 1, day, hour, minute)));
}

/** Teachers see only the subjects they teach; the principal and admin see every grade. */
async function staffContext(user: SchoolUser): Promise<StaffContext> {
  const { users, riskThreshold } = await school();
  if (user.role !== 'teacher') {
    const classes = await Promise.all(
      GRADES.map(async (grade) => ({ grade, data: await classFor(grade) })),
    );
    return { classes, riskThreshold };
  }
  const teaching = await users.teachingOf(user.id);
  const grades = [...new Set(teaching.map((t) => t.grade))];
  const classes = await Promise.all(
    grades.map(async (grade) => {
      const data = await classFor(grade);
      const taught = new Set(teaching.filter((t) => t.grade === grade).map((t) => t.subjectId));
      return { grade, data: { ...data, subjects: data.subjects.filter((s) => taught.has(s.id)) } };
    }),
  );
  return { classes, riskThreshold };
}

async function learnerAnswer(user: SchoolUser, question: string): Promise<AssistantAnswer> {
  const [view, { messages }] = await Promise.all([learnerView(user.id), school()]);
  if (!view) {
    return {
      answer: 'I could not find your marks yet. Ask your teacher to check your class.',
      links: [],
    };
  }
  const sent = await messages.forLearner(user.id, RECENT_MESSAGES);
  const session = sent.find((m) => m.session)?.session;
  return answerLearner(question, {
    profile: view.profile,
    chosenSubjects: view.chosenSubjects,
    nextSession: session ? `${session.title}, ${sessionWhen(session.start)}` : undefined,
    grade: view.profile.learner.grade,
    resources: (await classFor(view.profile.learner.grade)).resources,
  });
}

/** Ask Thuso: answers from the live school data this person is allowed to see. */
export async function askThuso(user: SchoolUser, question: string): Promise<AssistantAnswer> {
  if (user.role === 'learner') {
    return learnerAnswer(user, question);
  }
  return answerStaff(question, await staffContext(user));
}
