import { assessRisk } from '../analysis/assessRisk';
import type { ClassData } from '../domain/classData';
import { LEARNING_FORMATS, type LearningFormat, type RiskCause } from '../domain/vocab';
import { InMemoryClassRepository } from '../repositories/InMemoryClassRepository';
import { mean, topicStandings, type TopicStanding } from './topicStandings';

const WEAKEST_TOPICS_SHOWN = 3;

export interface AtRiskLearner {
  learnerId: string;
  name: string;
  riskScore: number;
  cause: RiskCause;
  evidence: string;
  formats: LearningFormat[];
}

export interface SubjectInsight {
  subjectId: string;
  subjectName: string;
  averagePct: number;
  /** Class-wide weakest topics: worth reteaching to everyone. */
  weakestTopics: TopicStanding[];
  /** Highest risk first. */
  atRisk: AtRiskLearner[];
  /** How the at-risk learners like to learn — tells the lecturer how to reteach. */
  formatCounts: Record<LearningFormat, number>;
}

export interface ClassInsights {
  learnerCount: number;
  subjects: SubjectInsight[];
}

const emptyFormatCounts = () =>
  Object.fromEntries(LEARNING_FORMATS.map((format) => [format, 0])) as Record<
    LearningFormat,
    number
  >;

/** The lecturer's view of the whole class, per subject. Deterministic: no model involved. */
export function buildClassInsights(data: ClassData, riskThreshold: number): ClassInsights {
  const repo = new InMemoryClassRepository(data);
  const nameOf = new Map(
    data.learners.map((learner) => [learner.id, `${learner.firstName} ${learner.lastName}`]),
  );

  const subjects = data.subjects.map((subject) => {
    const records = repo.recordsFor(subject.id);
    const results = records.flatMap((record) => record.results);
    const atRisk = records
      .map(assessRisk)
      .filter((risk) => risk.riskScore >= riskThreshold)
      .sort((a, b) => b.riskScore - a.riskScore)
      .map((risk) => ({
        learnerId: risk.learnerId,
        name: nameOf.get(risk.learnerId) ?? risk.learnerId,
        riskScore: risk.riskScore,
        cause: risk.primaryCause,
        evidence: risk.evidence,
        formats: risk.preferredFormats,
      }));
    const formatCounts = emptyFormatCounts();
    for (const format of atRisk.flatMap((learner) => learner.formats)) {
      formatCounts[format] += 1;
    }
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      averagePct: Math.round(mean(results.map((result) => result.scorePct))),
      weakestTopics: topicStandings(results).slice(0, WEAKEST_TOPICS_SHOWN),
      atRisk,
      formatCounts,
    };
  });
  return { learnerCount: data.learners.length, subjects };
}
