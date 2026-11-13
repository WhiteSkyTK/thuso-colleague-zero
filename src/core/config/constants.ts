import type { AgentCode } from '../domain/codes';

export interface AgentMeta {
  readonly code: AgentCode;
  readonly name: string;
  /** CSS variable from docs/DESIGN.md §3. */
  readonly colorToken: string;
  /** Text on the sign the agent's character carries (DESIGN.md §4). */
  readonly sign: string;
}

/** Single source of truth for how each agent is named and shown. */
export const AGENT_META = {
  PL: { code: 'PL', name: 'Planner', colorToken: '--c-jacaranda-500', sign: 'PLAN' },
  AN: { code: 'AN', name: 'Analyst', colorToken: '--c-teal-500', sign: 'FIND' },
  CO: { code: 'CO', name: 'Coach', colorToken: '--c-sun-400', sign: 'TEACH' },
  RV: { code: 'RV', name: 'Reviewer', colorToken: '--c-ember-500', sign: 'CHECK' },
  MS: { code: 'MS', name: 'Messenger', colorToken: '--c-leaf-500', sign: 'SEND' },
  SYS: { code: 'SYS', name: 'Orchestrator', colorToken: '--c-ink-900', sign: 'RUN' },
} as const satisfies Record<AgentCode, AgentMeta>;

export const DEMO_GOAL_TEXT =
  'Find every Grade 10 learner at risk of failing Mathematics this term, work out why, ' +
  'and send each one a personalised 2-week catch-up plan with a booked support session.';

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
