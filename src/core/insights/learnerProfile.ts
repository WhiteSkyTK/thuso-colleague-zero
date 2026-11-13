import { assessRisk } from '../analysis/assessRisk';
import { capsLevel } from '../analysis/capsLevel';
import type { ClassData, Learner, Resource, Task } from '../domain/classData';
import type { RiskAssessment } from '../domain/diagnosis';
import { SCAFFOLD_RUNGS, type LearningFormat } from '../domain/vocab';
import { InMemoryClassRepository } from '../repositories/InMemoryClassRepository';
import { mean, topicStandings, type TopicStanding } from './topicStandings';

const MAX_SUGGESTIONS = 4;

export interface SubjectStanding {
  subjectId: string;
  subjectName: string;
  averagePct: number;
  capsLevel: number;
  capsLabel: string;
  /** Weakest first. */
  topics: TopicStanding[];
  risk: RiskAssessment;
  isAtRisk: boolean;
  /** Resources for the weak topics, the learner's own formats first, easiest rung first. */
  suggestions: Resource[];
}

export interface LearnerProfile {
  learner: Learner;
  subjects: SubjectStanding[];
}

function suggestionsFor(resources: readonly Resource[], risk: RiskAssessment): Resource[] {
  const weak = new Set(risk.weakTopics.map((topic) => topic.topic));
  const formatRank = (format: LearningFormat) => {
    const index = risk.preferredFormats.indexOf(format);
    return index === -1 ? risk.preferredFormats.length : index;
  };
  return resources
    .filter((resource) => weak.has(resource.topic))
    .sort(
      (a, b) =>
        formatRank(a.format) - formatRank(b.format) ||
        SCAFFOLD_RUNGS.indexOf(a.rung) - SCAFFOLD_RUNGS.indexOf(b.rung),
    )
    .slice(0, MAX_SUGGESTIONS);
}

/**
 * One learner's picture across every subject: where they stand, what they are missing and why,
 * and what to study next in the way they learn best. Pure code, no model.
 */
export function buildLearnerProfile(
  data: ClassData,
  learnerId: string,
  riskThreshold: number,
): LearnerProfile | undefined {
  const learner = data.learners.find((candidate) => candidate.id === learnerId);
  if (!learner) {
    return undefined;
  }
  const repo = new InMemoryClassRepository(data);
  const subjects = data.subjects.flatMap((subject) => {
    const record = repo
      .recordsFor(subject.id)
      .find((candidate) => candidate.learnerId === learnerId);
    if (!record || record.results.length === 0) {
      return [];
    }
    const averagePct = Math.round(mean(record.results.map((result) => result.scorePct)));
    const caps = capsLevel(averagePct);
    const risk = assessRisk(record);
    return [
      {
        subjectId: subject.id,
        subjectName: subject.name,
        averagePct,
        capsLevel: caps.level,
        capsLabel: caps.label,
        topics: topicStandings(record.results),
        risk,
        isAtRisk: risk.riskScore >= riskThreshold,
        suggestions: suggestionsFor(repo.forSubject(subject.id), risk),
      },
    ];
  });
  return { learner, subjects };
}

/** The lecturer's tasks for the subjects this learner takes, newest first. */
export function tasksForLearner(tasks: readonly Task[], profile: LearnerProfile): Task[] {
  const taken = new Set(profile.subjects.map((subject) => subject.subjectId));
  return tasks.filter((task) => taken.has(task.subjectId)).sort((a, b) => b.week - a.week);
}
