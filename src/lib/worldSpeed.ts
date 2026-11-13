import type { AgentEvent } from '@/core/domain/agentEvent';

/** How fast the street moves (DESIGN.md §5.3): slow while a flag is up, fast when plans go out. */
export const WORLD_SPEED = { normal: 1, flagged: 0.25, celebrating: 1.6 } as const;

const SCENE_LEVELS = new Set<AgentEvent['level']>(['FLAG', 'PASS', 'DONE']);

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
