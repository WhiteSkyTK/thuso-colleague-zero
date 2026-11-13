import { z } from 'zod';

export const AGENT_CODES = ['PL', 'AN', 'CO', 'RV', 'MS', 'SYS'] as const;
export const AgentCodeSchema = z.enum(AGENT_CODES);
export type AgentCode = z.infer<typeof AgentCodeSchema>;

export const EVENT_LEVELS = [
  'INFO',
  'PLAN',
  'ACT',
  'FLAG',
  'FIX',
  'PASS',
  'WARN',
  'ERROR',
  'ESCALATE',
  'DONE',
] as const;
export const EventLevelSchema = z.enum(EVENT_LEVELS);
export type EventLevel = z.infer<typeof EventLevelSchema>;
