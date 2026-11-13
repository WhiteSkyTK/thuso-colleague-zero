import { z } from 'zod';
import type { AgentEvent } from '@/core/domain/agentEvent';
import { CatchUpPlanSchema, type CatchUpPlan } from '@/core/domain/catchUpPlan';
import type { AgentCode } from '@/core/domain/codes';
import { DiagnosisSchema, type Diagnosis } from '@/core/domain/diagnosis';
import { isFinalEvent } from '@/core/events/TraceRecorder';

export type RunStatus = 'idle' | 'running' | 'completed' | 'stopped' | 'failed';

/** What the screen knows about one learner, pieced together from the events. */
export interface LearnerCard {
  learnerId: string;
  diagnosis?: Diagnosis;
  /** The approved plan (set when the Reviewer passes it). */
  plan?: CatchUpPlan;
  flags: string[];
  fixes: number;
  isDelivered: boolean;
  isEscalated: boolean;
}

/** Everything the live run screen shows, derived only from the event stream. */
export interface RunView {
  status: RunStatus;
  events: AgentEvent[];
  /** The agent that spoke last — shown as "working". */
  activeAgent: AgentCode | null;
  seenAgents: AgentCode[];
  stepIndex: number;
  stepsTotal: number;
  flags: number;
  fixes: number;
  humanInterventions: number;
  learners: LearnerCard[];
  teacherNotes: string[];
  /** Latest line worth announcing to screen readers (FLAG, FIX, ESCALATE, DONE). */
  announcement: string;
  error: string | null;
}

export type RunViewAction =
  { type: 'started' } | { type: 'event'; event: AgentEvent } | { type: 'failed'; message: string };

export const INITIAL_RUN_VIEW: RunView = {
  status: 'idle',
  events: [],
  activeAgent: null,
  seenAgents: [],
  stepIndex: 0,
  stepsTotal: 0,
  flags: 0,
  fixes: 0,
  humanInterventions: 0,
  learners: [],
  teacherNotes: [],
  announcement: '',
  error: null,
};

const ANNOUNCED_LEVELS = new Set(['FLAG', 'FIX', 'ESCALATE', 'DONE']);
const SummarySchema = z.object({ summary: z.object({ teacherNotes: z.array(z.string()) }) });

const numberAt = (data: AgentEvent['data'], key: string, fallback: number): number => {
  const value = data?.[key];
  return typeof value === 'number' ? value : fallback;
};

function nextActiveAgent(view: RunView, event: AgentEvent): AgentCode | null {
  if (isFinalEvent(event)) {
    return null;
  }
  return event.agent === 'SYS' ? view.activeAgent : event.agent;
}

/** Event payloads are validated before use, like any other untrusted input. */
function updateCards(cards: LearnerCard[], event: AgentEvent): LearnerCard[] {
  const learnerId = event.itemId;
  if (!learnerId) {
    return cards;
  }
  const existing = cards.find((card) => card.learnerId === learnerId) ?? {
    learnerId,
    flags: [],
    fixes: 0,
    isDelivered: false,
    isEscalated: false,
  };
  const diagnosis = DiagnosisSchema.safeParse(event.data?.diagnosis);
  const plan = CatchUpPlanSchema.safeParse(event.data?.plan);
  const updated: LearnerCard = {
    ...existing,
    diagnosis: diagnosis.success ? diagnosis.data : existing.diagnosis,
    plan: plan.success ? plan.data : existing.plan,
    flags: event.level === 'FLAG' ? [...existing.flags, event.message] : existing.flags,
    fixes: existing.fixes + (event.level === 'FIX' ? 1 : 0),
    isDelivered: existing.isDelivered || (event.agent === 'MS' && event.level === 'ACT'),
    isEscalated: existing.isEscalated || event.level === 'ESCALATE',
  };
  return [...cards.filter((card) => card.learnerId !== learnerId), updated].sort((a, b) =>
    a.learnerId.localeCompare(b.learnerId),
  );
}

function applyEvent(view: RunView, event: AgentEvent): RunView {
  const isWorker = event.agent !== 'SYS';
  const finalStatus = event.level === 'DONE' ? 'completed' : 'stopped';
  const summary = SummarySchema.safeParse(event.data);
  return {
    ...view,
    events: [...view.events, event],
    status: isFinalEvent(event) ? finalStatus : view.status,
    activeAgent: nextActiveAgent(view, event),
    seenAgents:
      isWorker && !view.seenAgents.includes(event.agent)
        ? [...view.seenAgents, event.agent]
        : view.seenAgents,
    stepIndex: numberAt(event.data, 'stepIndex', view.stepIndex),
    stepsTotal: numberAt(event.data, 'stepsTotal', view.stepsTotal),
    flags: view.flags + (event.level === 'FLAG' ? 1 : 0),
    fixes: view.fixes + (event.level === 'FIX' ? 1 : 0),
    humanInterventions: view.humanInterventions + (event.level === 'ESCALATE' ? 1 : 0),
    learners: updateCards(view.learners, event),
    teacherNotes: summary.success ? summary.data.summary.teacherNotes : view.teacherNotes,
    announcement: ANNOUNCED_LEVELS.has(event.level) ? event.message : view.announcement,
  };
}

/** Pure reducer behind the live run screen. */
export function runViewReducer(view: RunView, action: RunViewAction): RunView {
  if (action.type === 'started') {
    return { ...INITIAL_RUN_VIEW, status: 'running' };
  }
  if (action.type === 'failed') {
    // A dropped connection after the run has finished is not a failure.
    return view.status === 'running' ? { ...view, status: 'failed', error: action.message } : view;
  }
  return view.status === 'running' ? applyEvent(view, action.event) : view;
}
