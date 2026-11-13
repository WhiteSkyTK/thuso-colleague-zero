import { z } from 'zod';
import type { CatchUpPlan } from '../../domain/catchUpPlan';
import { DiagnosisSchema, type Diagnosis, type RiskCause } from '../../domain/diagnosis';
import type { PlanDraft } from '../../domain/plan';
import type { ReviewVerdict } from '../../domain/review';
import { StepFailedError } from '../../errors/AppError';
import type { MockResponder } from '../MockProvider';

/** What the offline "model" answers for the walking skeleton. Replaced by seed data in S1. */
const PLAN: PlanDraft = {
  rationale:
    'Find who is at risk and why, draft a plan per learner, review every plan before it goes out, then deliver and report.',
  steps: [
    {
      id: 's1',
      agent: 'AN',
      action: 'find-at-risk',
      input: { grade: 10, subject: 'Mathematics' },
      successCriteria: ['Every learner is scored', 'Each at-risk learner has a cause with evidence'],
      dependsOn: [],
    },
    {
      id: 's2',
      agent: 'CO',
      action: 'draft-plan',
      input: {},
      successCriteria: ['One 2-week plan per at-risk learner'],
      dependsOn: ['s1'],
    },
    {
      id: 's3',
      agent: 'RV',
      action: 'review-plan',
      input: {},
      successCriteria: ['Each plan leads with the diagnosed cause'],
      dependsOn: ['s2'],
    },
    {
      id: 's4',
      agent: 'MS',
      action: 'deliver-plan',
      input: {},
      successCriteria: ['Learner and guardian receive the approved plan'],
      dependsOn: ['s3'],
    },
    {
      id: 's5',
      agent: 'MS',
      action: 'send-summary',
      input: {},
      successCriteria: ['The teacher receives the run summary'],
      dependsOn: ['s4'],
    },
  ],
};

const DIAGNOSES: Diagnosis[] = [
  {
    learnerId: 'L-009',
    riskScore: 40,
    primaryCause: 'topic-gap',
    evidence: 'functions average 38% across two assessments',
    weakTopics: ['functions'],
  },
  {
    learnerId: 'L-014',
    riskScore: 71,
    primaryCause: 'attendance',
    evidence: '9 absences in 6 weeks',
    weakTopics: ['algebraic expressions'],
  },
  {
    learnerId: 'L-021',
    riskScore: 58,
    primaryCause: 'topic-gap',
    evidence: 'statistics average 31%',
    weakTopics: ['statistics'],
  },
];

const CoachInputSchema = z.object({
  diagnosis: DiagnosisSchema,
  fix: z.object({ instructions: z.string() }).optional(),
});

const SESSION_DAYS = [1, 3, 8, 10];
const SESSION_MINUTES = 45;

function draftPlan(input: unknown): CatchUpPlan {
  const { diagnosis, fix } = CoachInputSchema.parse(input);
  const topic = diagnosis.weakTopics[0] ?? 'revision';
  // The mock model's habit: a first draft drills the weakest topic and ignores other causes.
  const leadingCause: RiskCause = fix ? diagnosis.primaryCause : 'topic-gap';
  const summary =
    leadingCause === 'topic-gap'
      ? `two weeks of ${topic} practice`
      : `${leadingCause} support first, then ${topic} practice`;
  return {
    learnerId: diagnosis.learnerId,
    addresses: [leadingCause],
    summary,
    sessions: SESSION_DAYS.map((day) => ({
      day,
      topic,
      minutes: SESSION_MINUTES,
      resourceIds: [],
    })),
    learnerMessage: `Here is your 2-week catch-up plan: ${summary}.`,
    guardianMessage: `Your child has a 2-week Mathematics catch-up plan: ${summary}.`,
  };
}

const PASS: ReviewVerdict = { status: 'pass', issues: [] };

const SCRIPT: Readonly<Record<string, (input: unknown) => unknown>> = {
  'planner.plan': () => PLAN,
  'analyst.find-at-risk': () => ({ diagnoses: DIAGNOSES }),
  'coach.draft-plan': draftPlan,
  'reviewer.review-plan': () => PASS,
};

export const skeletonResponder: MockResponder = (request) => {
  if (!Object.hasOwn(SCRIPT, request.task)) {
    throw new StepFailedError(`the mock provider has no script for "${request.task}"`);
  }
  return SCRIPT[request.task]?.(request.input);
};
