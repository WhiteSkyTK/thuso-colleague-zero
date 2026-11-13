import type { AgentCode } from '../domain/codes';

export interface AgentMeta {
  readonly code: AgentCode;
  readonly name: string;
  /** CSS variable from docs/DESIGN.md §3. */
  readonly colorToken: string;
  /** Text colour that passes contrast on colorToken. */
  readonly textToken: string;
  /** Text on the sign the agent's character carries (DESIGN.md §4). */
  readonly sign: string;
}

const ON_DARK = '--c-paper';
const ON_LIGHT = '--c-ink-900';

/** Single source of truth for how each agent is named and shown. */
export const AGENT_META = {
  PL: {
    code: 'PL',
    name: 'Planner',
    colorToken: '--c-jacaranda-500',
    textToken: ON_DARK,
    sign: 'PLAN',
  },
  AN: {
    code: 'AN',
    name: 'Analyst',
    colorToken: '--c-teal-500',
    textToken: ON_LIGHT,
    sign: 'FIND',
  },
  CO: { code: 'CO', name: 'Coach', colorToken: '--c-sun-400', textToken: ON_LIGHT, sign: 'TEACH' },
  RV: {
    code: 'RV',
    name: 'Reviewer',
    colorToken: '--c-ember-500',
    textToken: ON_LIGHT,
    sign: 'CHECK',
  },
  MS: {
    code: 'MS',
    name: 'Messenger',
    colorToken: '--c-leaf-500',
    textToken: ON_LIGHT,
    sign: 'SEND',
  },
  SYS: {
    code: 'SYS',
    name: 'Orchestrator',
    colorToken: '--c-ink-900',
    textToken: ON_DARK,
    sign: 'RUN',
  },
} as const satisfies Record<AgentCode, AgentMeta>;

/** The five agents that do the work, in hand-off order (the Orchestrator is not shown as a worker). */
export const WORKER_AGENTS: readonly AgentMeta[] = [
  AGENT_META.PL,
  AGENT_META.AN,
  AGENT_META.CO,
  AGENT_META.RV,
  AGENT_META.MS,
];

export const DEMO_GOAL_TEXT =
  'Find every Grade 10 learner at risk of failing Mathematics this term, work out why, ' +
  'and send each one a personalised 2-week catch-up plan with a booked support session.';

/** The demo goal, for any grade. */
export const demoGoalFor = (grade: number): string =>
  DEMO_GOAL_TEXT.replace('Grade 10', `Grade ${grade}`);

export const GOAL_MAX_CHARS = 500;

/** How many times the Planner may be asked for a new plan after a step fails. */
export const MAX_REPLANS = 2;

/** How many drafts the Planner gets before an invalid plan stops the run. */
export const PLAN_ATTEMPTS = 2;

/** Rough token estimate used by the offline mock provider. */
export const CHARS_PER_TOKEN = 4;

export const TOKENS_PER_MILLION = 1_000_000;

/** CLAUDE.md §7.7 — low for planning and review, warmer for writing messages. */
export const TEMPERATURE = { planning: 0.1, review: 0, writing: 0.6 } as const;

export const PLAN_LENGTH_DAYS = 14;
