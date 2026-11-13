'use client';

import { useState, type FormEvent } from 'react';
import { GOAL_MAX_CHARS } from '@/core/config/constants';

interface GoalFormProps {
  isRunning: boolean;
  initialGoal: string;
  onRun: (goal: string) => void;
}

/** One-tap examples: the same team plans a different job for each goal. */
const examples = (initialGoal: string) => [
  { label: 'Write catch-up plans', goal: initialGoal },
  { label: 'Show failing learners', goal: 'Show me the learners failing Mathematics this term.' },
  {
    label: 'Show passing learners',
    goal: 'Show me the learners passing Physical Sciences this term.',
  },
  { label: 'Who is at risk?', goal: 'Which learners are at risk in Mathematics?' },
];

/** The teacher states an outcome or asks a question, not steps. Pre-filled with the demo goal. */
export function GoalForm({ isRunning, initialGoal, onRun }: Readonly<GoalFormProps>) {
  const [goal, setGoal] = useState(initialGoal);

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
      <ul className="flex flex-wrap gap-2" aria-label="Example goals">
        {examples(initialGoal).map((example) => (
          <li key={example.label}>
            <button
              type="button"
              onClick={() => setGoal(example.goal)}
              aria-pressed={goal === example.goal}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${goal === example.goal ? 'bg-ink text-paper' : 'bg-white shadow-card'}`}
            >
              {example.label}
            </button>
          </li>
        ))}
      </ul>
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
        className="self-start rounded-full bg-jacaranda-500 px-8 py-3 text-lg font-bold text-white shadow-card disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRunning ? 'Thuso is working…' : 'Run'}
      </button>
    </form>
  );
}
