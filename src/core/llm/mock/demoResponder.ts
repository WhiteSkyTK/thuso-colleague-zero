import { z } from 'zod';
import type { CatchUpPlan, PlanSession } from '../../domain/catchUpPlan';
import { ResourceSchema, SchoolDaySchema } from '../../domain/classData';
import { DiagnosisSchema } from '../../domain/diagnosis';
import type { PlanDraft } from '../../domain/plan';
import type { ReviewVerdict } from '../../domain/review';
import {
  RiskCauseSchema,
  SCAFFOLD_RUNGS,
  type LearningFormat,
  type RiskCause,
} from '../../domain/vocab';
import { StepFailedError } from '../../errors/AppError';
import type { ReportFilter } from '../../analysis/classReport';
import type { MockResponder } from '../MockProvider';

/**
 * The offline stand-in for the model. It works from the same input a real model
 * gets, and it has two realistic bad habits (marked below). Nothing here decides
 * what gets flagged — the Reviewer's checks do that.
 */

const PlannerInputSchema = z.object({
  goal: z.object({ text: z.string() }),
  overview: z.object({ subjects: z.array(z.object({ id: z.string(), name: z.string() })) }),
  issue: z.string().optional(),
});

/** A question ("show failing learners") gets a report, not catch-up plans. */
const QUESTION = /^(show|list|who|which|how many|give me|tell me)\b/;
const FILTER_WORDS: readonly [RegExp, ReportFilter][] = [
  [/at[ -]risk/, 'at-risk'],
  [/fail|struggl|below/, 'failing'],
  [/pass|top|best|doing well/, 'passing'],
];

function reportPlan(
  goalText: string,
  subject: { id: string; name: string },
): PlanDraft | undefined {
  const filter = FILTER_WORDS.find(([words]) => words.test(goalText))?.[1];
  if (!QUESTION.test(goalText.trim()) || !filter) {
    return undefined;
  }
  return {
    rationale: `This is a question, not a request for plans: list the ${filter} learners in ${subject.name} and report to the teacher. Nothing is sent to learners.`,
    steps: [
      {
        id: 's1',
        agent: 'AN',
        action: 'list-learners',
        input: { subjectId: subject.id, filter },
        successCriteria: [],
        dependsOn: [],
      },
      {
        id: 's2',
        agent: 'MS',
        action: 'send-summary',
        input: {},
        successCriteria: [],
        dependsOn: ['s1'],
      },
    ],
  };
}

function plan(input: unknown): PlanDraft {
  const { goal, overview, issue } = PlannerInputSchema.parse(input);
  const goalText = goal.text.toLowerCase();
  const subject =
    overview.subjects.find((candidate) => goalText.includes(candidate.name.toLowerCase())) ??
    overview.subjects[0];
  if (!subject) {
    throw new StepFailedError('the class has no subjects to plan for');
  }
  const report = reportPlan(goalText, subject);
  if (report) {
    return report;
  }
  const allowPartialData = issue?.includes('missing') ?? false;
  const step = (
    id: string,
    target: [PlanDraft['steps'][number]['agent'], string],
    dependsOn: string[],
  ) => ({
    id,
    agent: target[0],
    action: target[1],
    input: id === 's1' ? { subjectId: subject.id, allowPartialData } : {},
    successCriteria: [],
    dependsOn,
  });
  return {
    rationale: allowPartialData
      ? `Some records are missing. Stopping would leave learners without help, so analyse ${subject.name} with the data we have and tell the teacher what is missing.`
      : `Find who is at risk in ${subject.name} and why, plan for each learner, review every plan before it goes out, then deliver and report.`,
    steps: [
      step('s1', ['AN', 'find-at-risk'], []),
      step('s2', ['CO', 'draft-plan'], ['s1']),
      step('s3', ['RV', 'review-plan'], ['s2']),
      step('s4', ['MS', 'deliver-plan'], ['s3']),
      step('s5', ['MS', 'send-summary'], ['s4']),
    ],
  };
}

const ExplainInputSchema = z.object({
  learners: z.array(
    z.object({ learnerId: z.string(), primaryCause: RiskCauseSchema, evidence: z.string() }),
  ),
});

const ROOT_CAUSE: Record<RiskCause, string> = {
  attendance:
    'Marks fell after the absences began, so missed lessons — not ability — are the root cause',
  homework: 'Too little practice between lessons, so new work is not sticking',
  'assessment-trend':
    'Results slid as topics built on each other, which points to an early gap that was never closed',
  'topic-gap': 'Most topics are on track; one topic is pulling the average down',
};

function explain(input: unknown): unknown {
  const { learners } = ExplainInputSchema.parse(input);
  return {
    explanations: learners.map((learner) => ({
      learnerId: learner.learnerId,
      explanation: `${ROOT_CAUSE[learner.primaryCause]} (${learner.evidence}).`,
    })),
  };
}

const CoachInputSchema = z.object({
  diagnosis: DiagnosisSchema,
  resources: z.array(ResourceSchema),
  freeSlots: z.array(SchoolDaySchema),
  fix: z.object({ instructions: z.string() }).optional(),
});
type CoachInput = z.infer<typeof CoachInputSchema>;

const SESSION_DAYS = [1, 3, 8, 10];
const SESSION_MINUTES = 45;
const INVENTED_RESOURCE_ID = 'R-099';
const NEEDS_FOUNDATION_AT_OR_BELOW = 2;

const ACTIVITY: Record<LearningFormat, string> = {
  'worked-examples': 'study three worked examples step by step, then try two alone',
  patterns: 'spot the pattern in five solved questions and write it down as a rule',
  'visual-story': 'follow the idea as a short comic strip, then draw one panel of your own',
  audio: 'listen to a short explanation, then record yourself teaching it back',
  practice: 'answer exam-style questions and mark them against the memo',
};

const LEAD: Record<RiskCause, string> = {
  attendance: 'A plan to be in class every day and catch up on the missed lessons',
  homework: 'A homework routine with a fixed 20-minute slot each day',
  'assessment-trend': 'Going back to where the marks began to drop and rebuilding from there',
  'topic-gap': 'Focused practice',
};

function sessionsFor({ diagnosis, resources, fix }: CoachInput): PlanSession[] {
  const format = diagnosis.preferredFormats[0] ?? 'worked-examples';
  const taken = new Map<string, number>();
  return SESSION_DAYS.map((day, index) => {
    const weak = diagnosis.weakTopics[index % diagnosis.weakTopics.length];
    if (!weak) {
      throw new StepFailedError(`${diagnosis.learnerId} has no weak topics to plan for`);
    }
    const stepsUp = taken.get(weak.topic) ?? 0;
    taken.set(weak.topic, stepsUp + 1);
    const start = weak.capsLevel <= NEEDS_FOUNDATION_AT_OR_BELOW ? 0 : 1;
    const forTopic = resources.filter((resource) => resource.topic === weak.topic);
    const match = forTopic.find((resource) => resource.format === format);
    // Bad habit 1: with nothing in the catalogue for a topic, a first draft invents an id.
    const invented = forTopic.length === 0 && !fix ? [INVENTED_RESOURCE_ID] : [];
    return {
      day,
      topic: weak.topic,
      minutes: SESSION_MINUTES,
      format,
      rung: SCAFFOLD_RUNGS[Math.min(start + stepsUp, SCAFFOLD_RUNGS.length - 1)] ?? 'foundation',
      activity: ACTIVITY[format],
      resourceIds: match ? [match.id] : invented,
    };
  });
}

function draftPlan(input: unknown): CatchUpPlan {
  const parsed = CoachInputSchema.parse(input);
  const { diagnosis, freeSlots, fix } = parsed;
  // Bad habit 2: a first draft reads falling marks as a topic problem and overlooks attendance.
  const lead: RiskCause =
    !fix && diagnosis.primaryCause === 'attendance' ? 'topic-gap' : diagnosis.primaryCause;
  const day = freeSlots.find((candidate) => candidate.freeSlots.length > 0);
  const time = day?.freeSlots[0];
  if (!day || !time) {
    throw new StepFailedError('the school calendar has no free support slot');
  }
  const sessions = sessionsFor(parsed);
  const topics = [...new Set(sessions.map((session) => session.topic))].join(', ');
  const summary = `${LEAD[lead]}, then ${topics} taught as ${sessions[0]?.format ?? 'worked-examples'}`;
  const booked = `Your support session with your teacher is on ${day.date} at ${time}.`;
  return {
    learnerId: diagnosis.learnerId,
    addresses: [lead],
    summary,
    sessions,
    supportSession: { date: day.date, time },
    learnerMessage: `Here is your 2-week catch-up plan. ${summary}. ${booked}`,
    guardianMessage: `Your child has a 2-week catch-up plan. ${summary}. ${booked.replace('Your', 'The')}`,
  };
}

const PASS: ReviewVerdict = { status: 'pass', issues: [] };

const SCRIPT: Readonly<Record<string, (input: unknown) => unknown>> = {
  'planner.plan': plan,
  'analyst.explain': explain,
  'coach.draft-plan': draftPlan,
  'reviewer.review-plan': () => PASS,
};

export const demoResponder: MockResponder = (request) => {
  if (!Object.hasOwn(SCRIPT, request.task)) {
    throw new StepFailedError(`the mock provider has no script for "${request.task}"`);
  }
  return SCRIPT[request.task]?.(request.input);
};
