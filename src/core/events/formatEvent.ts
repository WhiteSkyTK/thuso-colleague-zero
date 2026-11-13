import type { AgentEvent } from '../domain/agentEvent';

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const CLOCK_DIGITS = 2;

const pad = (value: number): string => String(value).padStart(CLOCK_DIGITS, '0');

/** Elapsed run time as HH:MM:SS. */
export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / MS_PER_SECOND);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  const totalMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** The console line, e.g. `00:06:51 [RV·FLAG] L-014: plan targets algebra, but 9 absences.` */
export function formatEvent(event: AgentEvent): string {
  return `${formatElapsed(event.ts)} [${event.agent}·${event.level}] ${event.message}`;
}
