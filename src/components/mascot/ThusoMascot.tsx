'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { Notification } from '@/core/school/NotificationRepository';
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
}

const KIND_ICON: Record<Notification['kind'], string> = {
  'at-risk': '⚑',
  'low-mark': '!',
  'plan-ready': '✓',
  'run-summary': '★',
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

/**
 * Thuso, the on-screen helper: tells each person what it noticed in the background, what to do
 * next, and (for staff) runs the agents right here. Polite to screen readers; tuck it away any time.
 */
export function ThusoMascot({ tips, live, alerts = [], onReadAlerts, runGrade }: ThusoMascotProps) {
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const message = live ?? tips[index % Math.max(tips.length, 1)] ?? '';
  const hasAlerts = alerts.length > 0 && !showTips && !live;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
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

  return (
    <aside
      aria-label="Thuso, your helper"
      className="fixed inset-x-3 bottom-3 z-40 flex items-end justify-end gap-2 sm:left-auto sm:max-w-sm"
    >
      <div
        key={hasAlerts ? 'alerts' : message}
        className="mascot-bubble relative min-w-0 flex-1 rounded-card bg-white p-3 pr-8 text-sm shadow-card"
      >
        {hasAlerts ? (
          <AlertList alerts={alerts} onRead={onReadAlerts} />
        ) : (
          <p role="status" aria-live="polite">
            {message}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
          {!live && !hasAlerts && tips.length > 1 && (
            <button
              type="button"
              onClick={() => setIndex((value) => value + 1)}
              className="underline"
            >
              Next tip
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
        {runGrade !== undefined && <MascotRun grade={runGrade} />}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
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
