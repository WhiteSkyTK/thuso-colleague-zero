'use client';

import { useState, useTransition } from 'react';
import type { ActionResult } from '@/app/portal/teacher/actions';
import { careerFit } from '@/core/subjects/careerFit';
import { checkSubjectChoice, NSC_SUBJECTS, type SubjectGroup } from '@/core/subjects/nscSubjects';

const GROUPS: readonly { group: SubjectGroup; label: string }[] = [
  { group: 'home-language', label: 'Home Language (choose 1)' },
  { group: 'additional-language', label: 'First Additional Language (choose 1)' },
  { group: 'maths', label: 'Mathematics or Mathematical Literacy (choose 1)' },
  { group: 'life-orientation', label: 'Life Orientation (everyone)' },
  { group: 'elective', label: 'Electives (choose 3)' },
];

interface SubjectPickerProps {
  readonly initial: readonly string[];
  readonly onSave: (codes: readonly string[]) => Promise<ActionResult>;
}

/** Pick seven subjects: every rule ticks off live, and the careers each choice keeps open show. */
export function SubjectPicker({ initial, onSave }: SubjectPickerProps) {
  const [chosen, setChosen] = useState<string[]>([...initial]);
  const [result, setResult] = useState<ActionResult>({});
  const [isPending, startTransition] = useTransition();
  const rules = checkSubjectChoice(chosen);
  const isValid = rules.every((rule) => rule.isMet);
  const fit = careerFit(chosen);

  const toggle = (code: string) =>
    setChosen((current) =>
      current.includes(code) ? current.filter((c) => c !== code) : [...current, code],
    );

  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-4">
        {GROUPS.map(({ group, label }) => (
          <fieldset key={group} className="rounded-card bg-white p-4 shadow-card">
            <legend className="px-1 font-display text-xl font-extrabold uppercase">{label}</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {NSC_SUBJECTS.filter((subject) => subject.group === group).map((subject) => {
                const isOn = chosen.includes(subject.code);
                return (
                  <label
                    key={subject.code}
                    className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${isOn ? 'bg-jacaranda-500 text-white' : 'bg-jacaranda-50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => toggle(subject.code)}
                      className="sr-only"
                    />
                    <span aria-hidden="true">{isOn ? '✓' : '+'}</span>
                    <span>{subject.name}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
        <section className="rounded-card bg-white p-4 shadow-card" aria-labelledby="rules-heading">
          <h2 id="rules-heading" className="font-display text-2xl font-extrabold uppercase">
            NSC rules
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {rules.map((rule) => (
              <li
                key={rule.label}
                className={rule.isMet ? 'text-ink' : 'font-semibold text-ember-700'}
              >
                <span aria-hidden="true">{rule.isMet ? '✓ ' : '✗ '}</span>
                {rule.label}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!isValid || isPending}
            onClick={() => startTransition(async () => setResult(await onSave(chosen)))}
            className="mt-3 w-full rounded-full bg-ember-700 px-6 py-2 font-bold text-white disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save my subjects'}
          </button>
          <output className="mt-2 block text-sm">{result.error ?? result.message}</output>
        </section>
        <section
          className="rounded-card bg-ink p-4 text-paper shadow-card"
          aria-labelledby="careers-heading"
        >
          <h2 id="careers-heading" className="font-display text-2xl font-extrabold uppercase">
            Doors this choice keeps open
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {fit.open.map(({ pathway }) => (
              <li key={pathway.id}>✓ {pathway.title}</li>
            ))}
          </ul>
          {fit.closed.length > 0 && (
            <>
              <h3 className="mt-3 font-semibold">Closed by this choice</h3>
              <ul className="mt-1 flex flex-col gap-1 text-sm opacity-90">
                {fit.closed.map(({ pathway, missing }) => (
                  <li key={pathway.id}>
                    ✗ {pathway.title} — needs {missing.join(' and ')}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </aside>
    </div>
  );
}
