'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import type { StudyTeamResult, TeamAgent, TeamDay, TeamEvent } from '@/core/tutor/studyTeam';
import { FORMAT_ICON, FORMAT_LABEL } from '@/lib/labels';
import { NOT_SAVED, orFallback } from '@/lib/orFallback';

interface StudyTeamProps {
  readonly savedDays: readonly TeamDay[];
  readonly onRun: () => Promise<StudyTeamResult>;
}

const STEP_MS = 650;
const AGENT_STYLE: Record<TeamAgent, string> = {
  PL: 'bg-jacaranda-500 text-white',
  AN: 'bg-teal text-ink',
  CO: 'bg-sun text-ink',
  RV: 'bg-ember-500 text-ink',
  MS: 'bg-leaf text-ink',
};
const AGENT_NAME: Record<TeamAgent, string> = {
  PL: 'Planner',
  AN: 'Analyst',
  CO: 'Coach',
  RV: 'Reviewer',
  MS: 'Messenger',
};

function EventLine({ event }: Readonly<{ event: TeamEvent }>) {
  return (
    <li className="ask-reply flex items-start gap-2">
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-xs font-bold ${AGENT_STYLE[event.agent]}`}
      >
        {event.agent}·{event.level}
      </span>
      <span className="sr-only">{AGENT_NAME[event.agent]}:</span>
      <span>{event.message}</span>
    </li>
  );
}

function PlanDays({ days }: Readonly<{ days: readonly TeamDay[] }>) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {days.map((day) => (
        <li key={day.day}>
          <Link
            href={`/portal/lesson/${day.resourceId}?format=${day.format}`}
            className="flex h-full flex-col gap-1 rounded-card bg-white p-3 text-sm shadow-card"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-jacaranda-700">
              {day.day} · {day.minutes} min
            </span>
            <span className="font-semibold">
              <span aria-hidden="true">{FORMAT_ICON[day.format]} </span>
              {day.title}
            </span>
            <span>
              {day.subjectName} · {FORMAT_LABEL[day.format]}
            </span>
            <span className="mt-auto pt-1 text-xs font-semibold">→ {day.task}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** The learner's own agent team, working live: plan, analyse, draft, check, fix, deliver. */
export function StudyTeam({ savedDays, onRun }: StudyTeamProps) {
  const [result, setResult] = useState<StudyTeamResult | null>(null);
  const [shown, setShown] = useState(0);
  const [isPending, startTransition] = useTransition();
  const total = result?.events.length ?? 0;
  const isPlaying = result !== null && shown < total;

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [isPlaying, shown]);

  const run = () =>
    startTransition(async () => {
      setShown(0);
      setResult(
        await orFallback(onRun, {
          events: [
            { agent: 'PL', level: 'PLAN', message: `${NOT_SAVED} Your saved plan is still below.` },
          ],
          days: [...savedDays],
        }),
      );
    });
  const days = result && !isPlaying ? result.days : savedDays;

  return (
    <section
      id="study-team"
      aria-labelledby="team-heading"
      className="flex flex-col gap-3 rounded-card bg-ink p-5 text-paper shadow-card"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-jacaranda-300">
            Your study team
          </p>
          <h2 id="team-heading" className="font-display text-4xl font-extrabold uppercase">
            Plan my week
          </h2>
          <p className="text-sm opacity-90">
            Five agents read your marks and what you told Thuso, draft a plan, check it, fix it and
            save it — and tell your teacher.
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={isPending || isPlaying}
          className="rounded-full bg-jacaranda-500 px-5 py-2 font-bold text-white disabled:opacity-60"
        >
          {isPending || isPlaying ? 'The team is working…' : '🤝 Let my study team plan my week'}
        </button>
      </div>
      {result && (
        <ol aria-live="polite" className="flex flex-col gap-2 rounded-lg bg-black/30 p-3 text-sm">
          {result.events.slice(0, shown).map((event, at) => (
            <EventLine key={`${event.agent}-${at}`} event={event} />
          ))}
        </ol>
      )}
      {days.length > 0 && (
        <div className="text-ink">
          <PlanDays days={days} />
        </div>
      )}
    </section>
  );
}
