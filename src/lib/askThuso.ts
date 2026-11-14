import { answerLearner } from '@/core/assistant/answerLearner';
import {
  answerStaff,
  type AssistantAnswer,
  type StaffContext,
} from '@/core/assistant/answerQuestion';
import { GRADES, type SchoolUser } from '@/core/domain/schoolUser';
import { askModels } from './chatModels';
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
const NEWLINE = String.fromCodePoint(10);

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

interface Answered {
  reply: AssistantAnswer;
  /** Pseudonymous facts a model may use if no built-in answer fitted (no names). */
  context: string;
}

async function learnerAnswer(user: SchoolUser, question: string): Promise<Answered> {
  const [view, { messages }] = await Promise.all([learnerView(user.id), school()]);
  if (!view) {
    return {
      reply: {
        answer: 'I could not find your marks yet. Ask your teacher to check your class.',
        links: [],
      },
      context: 'Role: learner. No marks recorded yet.',
    };
  }
  const sent = await messages.forLearner(user.id, RECENT_MESSAGES);
  const session = sent.find((m) => m.session)?.session;
  const nextSession = session ? `${session.title}, ${sessionWhen(session.start)}` : undefined;
  const { profile } = view;
  const reply = answerLearner(question, {
    profile,
    chosenSubjects: view.chosenSubjects,
    nextSession,
    grade: profile.learner.grade,
    resources: (await classFor(profile.learner.grade)).resources,
  });
  const marks = profile.subjects.map(
    (s) =>
      `${s.subjectName} ${s.averagePct}%${s.isAtRisk ? ' (needs support)' : ''}, weakest topic ${s.topics[0]?.topic ?? 'none'}`,
  );
  const context = [
    `Role: learner in Grade ${profile.learner.grade}.`,
    `Marks: ${marks.join('; ') || 'none yet'}.`,
    `Learns best with: ${profile.learner.preferredFormats.join(', ')}.`,
    `Chosen subjects: ${view.chosenSubjects.join(', ') || 'not chosen yet'}.`,
    `Next support session: ${nextSession ?? 'none booked'}.`,
    'Pages: My page (study plan, lessons), Plan my week (study team), Practice papers, Subjects, Calendar.',
  ].join(NEWLINE);
  return { reply, context };
}

async function staffAnswer(user: SchoolUser, question: string): Promise<Answered> {
  const context = await staffContext(user);
  const classes = context.classes.map(
    ({ grade, data }) =>
      `Grade ${grade}: ${data.learners.length} learners; subjects ${data.subjects.map((s) => s.name).join(', ')}`,
  );
  return {
    reply: answerStaff(question, context),
    context: [
      `Role: ${user.role}.`,
      ...classes,
      'Pages: My classes, Run Thuso (the agent team), History, Calendar, Past papers, Practice, Admin (accounts).',
      'For names and marks, Thuso answers from the class data itself; do not guess them.',
    ].join(NEWLINE),
  };
}

/** Ask Thuso: built-in answers from live data first; anything else goes to the model chain. */
export async function askThuso(user: SchoolUser, question: string): Promise<AssistantAnswer> {
  const { reply, context } =
    user.role === 'learner'
      ? await learnerAnswer(user, question)
      : await staffAnswer(user, question);
  if (!reply.isFallback) {
    return reply;
  }
  const modelAnswer = await askModels(question, context);
  return modelAnswer ? { answer: modelAnswer, links: reply.links } : reply;
}
