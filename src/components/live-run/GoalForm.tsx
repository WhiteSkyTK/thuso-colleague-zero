'use client';

import { useState, type FormEvent } from 'react';
import { DEMO_GOAL_TEXT, GOAL_MAX_CHARS } from '@/core/config/constants';

interface GoalFormProps {
  isRunning: boolean;
  onRun: (goal: string) => void;
}

/** The teacher states an outcome, not steps. Pre-filled with the demo goal. */
export function GoalForm({ isRunning, onRun }: Readonly<GoalFormProps>) {
  const [goal, setGoal] = useState(DEMO_GOAL_TEXT);

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (goal.trim().length > 0) {
      onRun(goal);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label htmlFor="goal" className="font-display text-2xl font-extrabold uppercase">
        Goal
      </label>
      <textarea
        id="goal"
        value={goal}
        maxLength={GOAL_MAX_CHARS}
        rows={3}
        onChange={(event) => {
          setGoal(event.target.value);
        }}
        className="rounded-card border-2 border-ink bg-white p-3 text-ink"
      />
      <button
        type="submit"
        disabled={isRunning}
        className="self-start rounded-full bg-jacaranda-500 px-8 py-3 text-lg font-bold text-white shadow-card transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRunning ? 'Thuso is working…' : 'Run'}
      </button>
    </form>
  );
}
