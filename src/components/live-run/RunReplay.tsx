'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { ThusoMascot } from '@/components/mascot/ThusoMascot';
import { ParallaxScene } from '@/components/parallax/ParallaxScene';
import type { AgentEvent } from '@/core/domain/agentEvent';
import { INITIAL_RUN_VIEW, runViewReducer } from '@/lib/runView';
import { narrationFor, worldSpeedFor } from '@/lib/worldSpeed';
import { AgentChips } from './AgentChips';
import { RunConsole } from './RunConsole';
import { RunResults } from './RunResults';

const SPEEDS = [1, 2, 4] as const;
/** Gaps between events are kept watchable: never under 60 ms or over 2 s. */
const MIN_GAP_MS = 60;
const MAX_GAP_MS = 2_000;

/** Plays a saved run back at real speed (or faster), clearly labelled REPLAY. Needs no network. */
export function RunReplay({ events }: Readonly<{ events: readonly AgentEvent[] }>) {
  const [view, dispatch] = useReducer(runViewReducer, INITIAL_RUN_VIEW);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const play = () => {
    clearTimeout(timer.current);
    dispatch({ type: 'started' });
    setIsPlaying(true);
    const step = (index: number) => {
      const event = events[index];
      if (!event) {
        setIsPlaying(false);
        return;
      }
      dispatch({ type: 'event', event });
      const next = events[index + 1];
      const gap = next
        ? Math.min(MAX_GAP_MS, Math.max(MIN_GAP_MS, (next.ts - event.ts) / speed))
        : 0;
      timer.current = setTimeout(() => step(index + 1), gap);
    };
    step(0);
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="relative">
        <ParallaxScene
          className="h-[clamp(200px,26vw,300px)] w-full rounded-card shadow-card"
          worldSpeed={worldSpeedFor(view.events)}
          activeAgent={view.activeAgent}
        />
        <span className="absolute left-3 top-3 rounded-full bg-ember-700 px-3 py-1 font-mono text-sm font-semibold text-white">
          ● REPLAY
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={play}
          disabled={events.length === 0}
          className="rounded-full bg-ember-700 px-6 py-2 font-bold text-white disabled:opacity-60"
        >
          {isPlaying ? '↺ Restart replay' : '▶ Replay this run'}
        </button>
        <fieldset className="flex items-center gap-1">
          <legend className="sr-only">Replay speed</legend>
          {SPEEDS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={speed === option}
              onClick={() => setSpeed(option)}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${speed === option ? 'bg-ink text-paper' : 'bg-white shadow-card'}`}
            >
              {option}×
            </button>
          ))}
        </fieldset>
        <span className="text-sm">{events.length} events recorded</span>
      </div>
      <AgentChips activeAgent={view.activeAgent} seenAgents={view.seenAgents} />
      <RunConsole events={view.events} />
      <RunResults view={view} />
      <ThusoMascot
        tips={['This is a recording of a real run. Press Replay to watch my agents again.']}
        live={narrationFor(view.events)}
      />
    </section>
  );
}
