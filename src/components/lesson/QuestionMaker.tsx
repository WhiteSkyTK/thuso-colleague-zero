'use client';

import { useState, type FormEvent } from 'react';
import { isRightAnswer, makeQuestion, type MadeQuestion } from '@/core/lessons/questionMakers';

/** Fresh numbers for practice questions (Web Crypto, so no seeded or predictable sequence). */
function pick(min: number, max: number): number {
  const [value = 0] = crypto.getRandomValues(new Uint32Array(1));
  return min + (value % (max - min + 1));
}

type Verdict = 'right' | 'wrong' | null;

/** "Make me a new question": fresh numbers every time; the answer is checked in code. */
export function QuestionMaker({ makerKey }: Readonly<{ makerKey: string }>) {
  const [made, setMade] = useState<MadeQuestion | undefined>(undefined);
  const [given, setGiven] = useState('');
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [streak, setStreak] = useState(0);

  const next = () => {
    setMade(makeQuestion(makerKey, pick));
    setGiven('');
    setVerdict(null);
  };
  const check = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!made) {
      return;
    }
    const isRight = isRightAnswer(given, made.answer);
    setVerdict(isRight ? 'right' : 'wrong');
    setStreak((value) => (isRight ? value + 1 : 0));
  };

  return (
    <section className="rounded-card bg-white p-5 shadow-card">
      <p className="font-mono text-xs uppercase tracking-widest text-jacaranda-700">
        Thuso makes you a question
      </p>
      {made ? (
        <form key={made.question} onSubmit={check} className="ask-reply mt-2 flex flex-col gap-2">
          <p className="text-lg font-semibold">{made.question}</p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="made-answer">
              Your answer
            </label>
            <input
              id="made-answer"
              value={given}
              onChange={(event) => setGiven(event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              className="w-36 rounded-lg border-2 border-ink/20 px-3 py-1.5"
            />
            {made.unit && <span>{made.unit}</span>}
            <button
              type="submit"
              className="rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-paper"
            >
              Check
            </button>
          </div>
          {verdict === 'right' && (
            <p className="ask-reply font-semibold text-jacaranda-700">
              ✓ Correct!{streak > 1 && ` ${streak} in a row 🔥`}
            </p>
          )}
          {verdict === 'wrong' && (
            <div className="ask-reply rounded-lg bg-jacaranda-50 p-3">
              <p className="font-semibold">Not quite — here is the working:</p>
              <ol className="list-decimal pl-5">
                {made.working.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
          )}
        </form>
      ) : (
        <p className="mt-1">New numbers every time — practise until it feels easy.</p>
      )}
      <button
        type="button"
        onClick={next}
        className="mt-3 rounded-full bg-jacaranda-500 px-4 py-1.5 text-sm font-bold text-white"
      >
        {made ? '↻ Another one' : '✦ Make me a question'}
      </button>
    </section>
  );
}
