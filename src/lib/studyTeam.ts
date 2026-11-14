import { randomUUID } from 'node:crypto';
import { CHECK_INS } from '@/core/assistant/checkIns';
import type { SchoolUser } from '@/core/domain/schoolUser';
import { LEARNING_FORMATS, type LearningFormat } from '@/core/domain/vocab';
import type { LearnerNote } from '@/core/school/NoteRepository';
import type { LearnerAsks } from '@/core/tutor/planChecks';
import { runStudyTeam, type StudyTeamResult, type TeamDay } from '@/core/tutor/studyTeam';
import { FORMAT_LABEL } from './labels';
import { learnerView } from './learnerView';
import { school } from './school';

const NOTES_READ = 40;
const DEFAULT_MINUTES = 30;

/** The value behind the learner's latest answer to one check-in, if they answered it. */
function latestAnswer(notes: readonly LearnerNote[], checkInId: string): string | undefined {
  const checkIn = CHECK_INS.find((c) => c.id === checkInId);
  const note = notes.find((n) => n.question === checkIn?.question);
  return checkIn?.options.find((o) => o.label === note?.answer)?.value;
}

/** Formats whose latest “did this help?” answer was 👎 (notes are newest first). */
function formatsThatDidNotHelp(notes: readonly LearnerNote[]): LearningFormat[] {
  const seen = new Map<LearningFormat, boolean>();
  for (const note of notes) {
    const format = LEARNING_FORMATS.find((f) =>
      note.question.endsWith(` as ${FORMAT_LABEL[f].toLowerCase()}`),
    );
    if (format && !seen.has(format)) {
      seen.set(format, note.answer.startsWith('👎'));
    }
  }
  return [...seen].filter(([, isAvoided]) => isAvoided).map(([format]) => format);
}

function asksFrom(
  user: SchoolUser,
  notes: readonly LearnerNote[],
  preferred: readonly LearningFormat[],
): LearnerAsks {
  const feeling = latestAnswer(notes, 'feeling');
  return {
    firstName: user.firstName,
    minutesPerDay: Number(latestAnswer(notes, 'minutes') ?? DEFAULT_MINUTES),
    feeling:
      feeling === 'lost' || feeling === 'okay' || feeling === 'confident' ? feeling : undefined,
    avoidFormats: formatsThatDidNotHelp(notes),
    preferredFormats: preferred,
  };
}

/** Runs the learner's study team, saves the plan and tells the focus subject's teacher. */
export async function runStudyTeamFor(user: SchoolUser): Promise<StudyTeamResult> {
  const view = await learnerView(user.id);
  if (!view || user.grade === null) {
    return { events: [], days: [] };
  }
  const { notes, notifications, users } = await school();
  const recent = await notes.recent(user.id, NOTES_READ);
  const asks = asksFrom(user, recent, view.profile.learner.preferredFormats);
  const result = runStudyTeam(view.profile, asks);
  if (result.days.length === 0 || !result.focusSubjectId) {
    return result;
  }
  await notes.savePlan(user.id, result.days);
  const teachers = await users.teachersFor(user.grade, result.focusSubjectId);
  const worry =
    asks.feeling === 'lost' ? ' They said they feel lost this week — a quick word would help.' : '';
  await notifications.add(
    teachers.map((teacherId) => ({
      id: randomUUID(),
      userId: teacherId,
      kind: 'study-plan' as const,
      title: `${user.firstName} ${user.lastName}’s study team made a 5-day plan`,
      body: `Focus: ${[...new Set(result.days.map((d) => d.subjectName))].join(', ')}.${worry}`,
      learnerId: user.id,
      grade: user.grade ?? undefined,
      link: `/portal/learners/${user.id}`,
    })),
  );
  return result;
}

/** The last plan the team saved, if it is still well-formed. */
export async function savedPlanFor(learnerId: string): Promise<TeamDay[]> {
  const { notes } = await school();
  const plan = await notes.latestPlan(learnerId);
  return Array.isArray(plan) ? (plan as TeamDay[]) : [];
}
