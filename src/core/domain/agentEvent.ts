import { z } from 'zod';
import { AgentCodeSchema, EventLevelSchema } from './codes';

/** One line of the live agent log. Never put learner names or contact details in it. */
export const AgentEventSchema = z.object({
  runId: z.string().min(1),
  seq: z.number().int().nonnegative(),
  /** Milliseconds since the run started; the console prints it as HH:MM:SS. */
  ts: z.number().nonnegative(),
  agent: AgentCodeSchema,
  level: EventLevelSchema,
  message: z.string(),
  itemId: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  tokens: z.number().int().nonnegative().optional(),
  /** How long the action took. */
  ms: z.number().nonnegative().optional(),
});
export type AgentEvent = z.infer<typeof AgentEventSchema>;

/** What an agent supplies; the run context adds runId, seq and ts. */
export type EventDraft = Omit<AgentEvent, 'runId' | 'seq' | 'ts'>;
