'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { AssistantAnswer } from '@/core/assistant/answerQuestion';
import type { CheckIn } from '@/core/assistant/checkIns';
import type { Notification } from '@/core/school/NotificationRepository';
import { useSeenTips } from '@/hooks/useSeenTips';
import { AskBox } from './AskBox';
import { CheckInCard, type CheckInReply } from './CheckInCard';
import { MascotRun } from './MascotRun';
import { ThusoFace } from './ThusoFace';

interface ThusoMascotProps {
  /** What Thuso says, in order; the newest live update can be passed as `live`. */
  readonly tips: readonly string[];
  readonly live?: string;
  /** Unread alerts Thuso raised in the background (marks dropping, plans ready, daily watch). */
  readonly alerts?: readonly Notification[];
  readonly onReadAlerts?: () => Promise<void>;
  /** Staff only: run the agents for this grade from inside the bubble. */
  readonly runGrade?: number;
  /** Ask Thuso: the text box, answered from the live data this person may see. */
  readonly ask?: {
    onAsk: (question: string) => Promise<AssistantAnswer>;
    examples: readonly string[];
  };
  /** Learners: today's one-tap question, until it is answered. */
  readonly checkIn?: {
    question: CheckIn;
    onAnswer: (input: { id: string; value: string }) => Promise<CheckInReply>;
  };
}

const KIND_ICON: Record<Notification['kind'], string> = {
  'at-risk': '⚑',
  'low-mark': '!',
  'plan-ready': '✓',
  'run-summary': '★',
  'to-mark': '✎',
  marked: '✓',
  'check-in': '💬',
  'study-plan': '🤝',
};

function AlertList({
  alerts,
  onRead,
}: Readonly<{ alerts: readonly Notification[]; onRead?: () => Promise<void> }>) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold">
        🔔 I noticed {alerts.length === 1 ? 'something' : `${alerts.length} things`}:
      </p>
      <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
        {alerts.map((alert) => (
          <li key={alert.id} className="rounded-lg bg-jacaranda-50 p-2">
            <p className="font-semibold">
              <span aria-hidden="true">{KIND_ICON[alert.kind]} </span>
              {alert.link ? (
                <Link href={alert.link} className="underline">
                  {alert.title}
                </Link>
              ) : (
                alert.title
              )}
            </p>
            <p className="text-xs">{alert.body}</p>
            <p className="text-[11px] opacity-70">{alert.createdAt}</p>
          </li>
        ))}
      </ul>
      {onRead && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => onRead())}
          className="self-start rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper"
        >
          {isPending ? 'Saving…' : 'Got it'}
        </button>
      )}
    </div>
  );
}

const TIME_FORMAT = new Intl.DateTimeFormat('en-ZA', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Johannesburg',
});
const NOON = 12;
const EVENING = 17;

function greeting(now: Date): string {
  const hour = Number(
    now.toLocaleString('en-ZA', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'Africa/Johannesburg',
    }),
  );
  if (hour < NOON) {
    return 'Good morning';
  }
  return hour < EVENING ? 'Good afternoon' : 'Good evening';
}

/**
 * Thuso, the on-screen helper: tells each person what it noticed in the background, what to do
 * next, and (for staff) runs the agents right here. It only pops up for something new — a tip not
 * seen yet, an alert or a live run — and tucks itself away once everything has been read.
 */
export function ThusoMascot(props: ThusoMascotProps) {
  const { tips, live, alerts = [], onReadAlerts, runGrade, ask } = props;
  // Kept after it is answered, so the reply stays on screen when the page refreshes.
  const [checkIn] = useState(props.checkIn);
  const { seen, markSeen } = useSeenTips();
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<'open' | 'closed' | null>(null);
  const [showTips, setShowTips] = useState(false);
  const unseen = tips.filter((tip) => !seen.has(tip));
  const hasNews = unseen.length > 0 || alerts.length > 0 || Boolean(live) || Boolean(checkIn);
  const isOpen = choice === 'open' || (choice === null && hasNews);
  // Opened on purpose: every tip again. Popped up on its own: only what is new.
  const pool = choice === 'open' || unseen.length === 0 ? tips : unseen;
  const isLastTip = index >= pool.length - 1;
  const message = live ?? pool[Math.min(index, pool.length - 1)] ?? '';
  const hasAlerts = alerts.length > 0 && !showTips && !live;

  const close = () => {
    markSeen(tips);
    setChoice('closed');
    setIndex(0);
  };
  const next = () => (isLastTip ? close() : setIndex((value) => value + 1));

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setChoice('open');
          setIndex(0);
        }}
        aria-label={
          alerts.length ? `Show Thuso, ${alerts.length} new alerts` : 'Show Thuso, your helper'
        }
        className="fixed bottom-3 right-3 z-40 rounded-full bg-white p-1 shadow-card"
      >
        <ThusoFace size={52} />
        {alerts.length > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-ember-700 px-1.5 text-xs font-bold text-white">
            {alerts.length}
          </span>
        )}
      </button>
    );
  }

  const now = new Date();
  return (
    <aside
      aria-label="Thuso, your helper"
      className="fixed inset-x-3 bottom-3 z-40 flex items-end justify-end gap-2 sm:left-auto sm:max-w-sm"
    >
      <div
        key={hasAlerts ? 'alerts' : message}
        className="mascot-bubble relative max-h-[80vh] min-w-0 flex-1 overflow-y-auto rounded-card bg-white p-3 pr-8 text-sm shadow-card"
      >
        <p
          className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-jacaranda-700"
          suppressHydrationWarning
        >
          {greeting(now)} · {TIME_FORMAT.format(now)}
        </p>
        {hasAlerts ? (
          <AlertList alerts={alerts} onRead={onReadAlerts} />
        ) : (
          <p role="status" aria-live="polite">
            {message}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
          {!live && !hasAlerts && pool.length > 0 && (
            <button type="button" onClick={next} className="underline">
              {isLastTip ? '✓ That’s all for now' : `Next tip (${index + 1}/${pool.length})`}
            </button>
          )}
          {!live && alerts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTips((value) => !value)}
              className="underline"
            >
              {showTips ? `🔔 Alerts (${alerts.length})` : 'Tips'}
            </button>
          )}
        </div>
        {checkIn && !live && <CheckInCard checkIn={checkIn.question} onAnswer={checkIn.onAnswer} />}
        {runGrade !== undefined && <MascotRun grade={runGrade} />}
        {ask && !live && <AskBox onAsk={ask.onAsk} examples={ask.examples} />}
        <button
          type="button"
          onClick={close}
          aria-label="Hide Thuso"
          className="absolute right-2 top-1 text-lg leading-none"
        >
          ×
        </button>
      </div>
      <div className="relative shrink-0">
        <ThusoFace size={64} isTalking={Boolean(live) || hasAlerts} />
        {alerts.length > 0 && (
          <span className="absolute -right-1 top-0 rounded-full bg-ember-700 px-1.5 text-xs font-bold text-white">
            {alerts.length}
          </span>
        )}
      </div>
    </aside>
  );
}
