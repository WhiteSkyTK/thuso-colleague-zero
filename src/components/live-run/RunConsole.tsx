'use client';

import { useEffect, useRef } from 'react';
import type { AgentEvent } from '@/core/domain/agentEvent';
import type { EventLevel } from '@/core/domain/codes';
import { formatElapsed } from '@/core/events/formatEvent';

/** Level colours on the ink console; every line also carries its level as text. */
const LEVEL_CLASS: Record<EventLevel, string> = {
  INFO: 'text-paper',
  PLAN: 'text-jacaranda-300',
  ACT: 'text-teal',
  FLAG: 'text-ember-500',
  FIX: 'text-sun',
  PASS: 'text-leaf',
  WARN: 'text-sun',
  ERROR: 'text-ember-500',
  ESCALATE: 'text-sun',
  DONE: 'text-leaf',
};

interface RunConsoleProps {
  events: readonly AgentEvent[];
}

/** The live agent log, in the organisers' format: `00:06:51 [RV·FLAG] message`. */
export function RunConsole({ events }: Readonly<RunConsoleProps>) {
  const endRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [events.length]);

  return (
    <ol
      role="log"
      aria-label="Agent log"
      aria-live="off"
      className="h-96 overflow-y-auto rounded-card bg-ink p-4 font-mono text-sm leading-6 text-paper shadow-card"
    >
      {events.length === 0 && <li className="opacity-70">Waiting for a goal…</li>}
      {events.map((event) => (
        <li key={event.seq} className="whitespace-pre-wrap break-words">
          <span className="opacity-70">{formatElapsed(event.ts)} </span>
          <span className={`font-semibold ${LEVEL_CLASS[event.level]}`}>
            [{event.agent}·{event.level}]
          </span>{' '}
          {event.message}
        </li>
      ))}
      <li ref={endRef} aria-hidden="true" />
    </ol>
  );
}
