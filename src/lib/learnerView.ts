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
import { subjectName } from '@/core/subjects/nscSubjects';
import { classFor, school } from './school';

export interface LearnerView {
  profile: LearnerProfile;
  tasks: Task[];
  subjectNames: Map<string, string>;
  /** The group Thuso puts the learner in, and what it has learned about them. */
  category: LearnerCategory;
  facts: string[];
  /** The seven NSC subjects the learner chose (names). */
  chosenSubjects: string[];
}

/** One learner's full picture, from their grade's (cached) class. */
export async function learnerView(learnerId: string): Promise<LearnerView | undefined> {
  const { users, choices, riskThreshold } = await school();
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
  const chosen = (await choices.get(learnerId)) ?? [];
  return {
    profile,
    tasks: tasksForLearner(data.tasks, profile),
    subjectNames: new Map(data.subjects.map((subject) => [subject.id, subject.name])),
    category: categorise(signals, riskThreshold),
    facts: learnedFacts(signals, profile.learner.preferredFormats),
    chosenSubjects: chosen.map(subjectName),
  };
}
