import type { AgentEvent } from '@/core/domain/agentEvent';

/** How fast the street moves (DESIGN.md §5.3): slow while a flag is up, fast when plans go out. */
export const WORLD_SPEED = { normal: 1, flagged: 0.25, celebrating: 1.6 } as const;

const SCENE_LEVELS = new Set<AgentEvent['level']>(['FLAG', 'PASS', 'DONE']);

const NARRATED = new Set<AgentEvent['level']>(['PLAN', 'FLAG', 'FIX', 'PASS', 'ESCALATE', 'DONE']);
const SPEAKER: Record<AgentEvent['agent'], string> = {
  PL: 'The Planner',
  AN: 'The Analyst',
  CO: 'The Coach',
  RV: 'The Reviewer',
  MS: 'The Messenger',
  SYS: 'Thuso',
};

/** What Thuso says about the run so far: the latest step worth explaining, in plain words. */
export function narrationFor(events: readonly AgentEvent[]): string | undefined {
  const last = events.findLast((event) => NARRATED.has(event.level));
  if (!last) {
    return undefined;
  }
  if (last.agent === 'SYS') {
    return last.message;
  }
  const who = SPEAKER[last.agent];
  const about = last.itemId ? ` (${last.itemId})` : '';
  return `${who}${about}: ${last.message}`;
}

/** Pure so it can be tested: the last scene-changing event decides the speed. */
export function worldSpeedFor(events: readonly AgentEvent[]): number {
  const last = events.findLast((event) => SCENE_LEVELS.has(event.level));
  if (last?.level === 'FLAG') {
    return WORLD_SPEED.flagged;
  }
  if (last?.level === 'DONE') {
    return WORLD_SPEED.celebrating;
  }
  return WORLD_SPEED.normal;
}
