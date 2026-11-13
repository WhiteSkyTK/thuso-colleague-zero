import type { Task } from '@/core/domain/classData';
import {
  buildLearnerProfile,
  tasksForLearner,
  type LearnerProfile,
} from '@/core/insights/learnerProfile';
import {
  categorise,
  classSignals,
  learnedFacts,
  type LearnerCategory,
} from '@/core/insights/learnerCategory';
import type { LearnerNote } from '@/core/school/NoteRepository';
import { subjectName } from '@/core/subjects/nscSubjects';
import { classFor, school } from './school';

const RECENT_NOTES = 4;

export interface LearnerView {
  profile: LearnerProfile;
  tasks: Task[];
  subjectNames: Map<string, string>;
  /** The group Thuso puts the learner in, and what it has learned about them. */
  category: LearnerCategory;
  facts: string[];
  /** The seven NSC subjects the learner chose (names). */
  chosenSubjects: string[];
  /** What the learner told Thuso in daily check-ins, newest first. */
  notes: LearnerNote[];
}

/** One learner's full picture, from their grade's (cached) class. */
export async function learnerView(learnerId: string): Promise<LearnerView | undefined> {
  const { users, choices, notes, riskThreshold } = await school();
  const learner = await users.findById(learnerId);
  if (learner?.role !== 'learner' || learner.grade === null) {
    return undefined;
  }
  const data = await classFor(learner.grade);
  const profile = buildLearnerProfile(data, learnerId, riskThreshold);
  if (!profile) {
    return undefined;
  }
  const signals = classSignals(data).get(learnerId) ?? [];
  const [chosen, recentNotes] = await Promise.all([
    choices.get(learnerId).then((found) => found ?? []),
    notes.recent(learnerId, RECENT_NOTES),
  ]);
  return {
    profile,
    tasks: tasksForLearner(data.tasks, profile),
    subjectNames: new Map(data.subjects.map((subject) => [subject.id, subject.name])),
    category: categorise(signals, riskThreshold),
    facts: learnedFacts(signals, profile.learner.preferredFormats),
    chosenSubjects: chosen.map(subjectName),
    notes: recentNotes,
  };
}
