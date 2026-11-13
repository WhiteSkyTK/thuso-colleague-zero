import type { Task } from '@/core/domain/classData';
import {
  buildLearnerProfile,
  tasksForLearner,
  type LearnerProfile,
} from '@/core/insights/learnerProfile';
import { classFor, school } from './school';

export interface LearnerView {
  profile: LearnerProfile;
  tasks: Task[];
  subjectNames: Map<string, string>;
}

/** One learner's full picture, from their grade's (cached) class. */
export async function learnerView(learnerId: string): Promise<LearnerView | undefined> {
  const { users, riskThreshold } = await school();
  const learner = await users.findById(learnerId);
  if (learner?.role !== 'learner' || learner.grade === null) {
    return undefined;
  }
  const data = await classFor(learner.grade);
  const profile = buildLearnerProfile(data, learnerId, riskThreshold);
  if (!profile) {
    return undefined;
  }
  return {
    profile,
    tasks: tasksForLearner(data.tasks, profile),
    subjectNames: new Map(data.subjects.map((subject) => [subject.id, subject.name])),
  };
}
