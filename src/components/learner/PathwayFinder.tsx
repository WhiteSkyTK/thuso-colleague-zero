'use client';

import { useMemo, useState } from 'react';
import { INTERESTS, type Interest } from '@/core/pathways/pathwayCatalogue';
import {
  estimateAps,
  interestsFromText,
  MAX_CV_CHARS,
  recommendPathways,
  type MatchStatus,
  type SubjectMark,
} from '@/core/pathways/recommendPathways';
import { MarksEditor } from './MarksEditor';

const STATUS = {
  'within-reach': { label: '✓ Within reach', className: 'bg-leaf' },
  stretch: { label: '↗ Stretch goal', className: 'bg-sun' },
  'not-yet': { label: '○ Not yet', className: 'bg-jacaranda-50' },
} as const satisfies Record<MatchStatus, { label: string; className: string }>;

const ROUTE_LABEL = {
  degree: 'University degree',
  diploma: 'Diploma',
  tvet: 'TVET college',
} as const;
const SHOWN = 5;
const FIELD = 'rounded-lg border-2 border-ink/20 bg-white px-2 py-1 text-ink';

/**
 * Idea 5: where can my marks take me? Marks become an APS score; interests come from chips or a
 * pasted CV. Every pathway says what is within reach and exactly which mark to raise for the rest.
 */
export function PathwayFinder({
  initialMarks,
}: Readonly<{ initialMarks: readonly SubjectMark[] }>) {
  const [marks, setMarks] = useState<SubjectMark[]>([...initialMarks]);
  const [picked, setPicked] = useState<Interest[]>([]);
  const [cvText, setCvText] = useState('');

  const interests = useMemo(
    () => [...new Set([...picked, ...interestsFromText(cvText)])],
    [picked, cvText],
  );
  const matches = useMemo(
    () => recommendPathways(marks, interests).slice(0, SHOWN),
    [marks, interests],
  );

  const estimate = estimateAps(marks);
  const toggle = (interest: Interest) =>
    setPicked((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );

  return (
    <section
      aria-labelledby="future-heading"
      className="flex flex-col gap-4 rounded-card bg-ink p-5 text-paper"
    >
      <h2 id="future-heading" className="font-display text-4xl font-extrabold uppercase">
        Where can my marks take me?
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            Your marks so far (change them to see what a better mark opens up):
          </p>
          <MarksEditor marks={marks} onChange={setMarks} />
          <p className="font-mono">
            APS: <strong className="text-2xl">{estimate.aps}</strong>
            {estimate.isProjected && (
              <span className="block text-xs">
                Projected from {estimate.subjectsCounted} subjects, assuming the rest match. Add
                your other subjects for your real score.
              </span>
            )}
          </p>
          <fieldset>
            <legend className="text-sm">What do you enjoy?</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  aria-pressed={interests.includes(interest)}
                  onClick={() => toggle(interest)}
                  className={`rounded-full px-3 py-1 text-sm ${interests.includes(interest) ? 'bg-sun text-ink' : 'bg-jacaranda-700'}`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-1 text-sm">
            Or paste your CV / tell us about yourself
            <textarea
              value={cvText}
              maxLength={MAX_CV_CHARS}
              onChange={(event) => setCvText(event.target.value)}
              rows={3}
              placeholder="e.g. I fix my uncle's car and I like coding games"
              className={FIELD}
            />
          </label>
        </div>
        <ol className="flex flex-col gap-2" aria-label="Suggested pathways">
          {matches.map(({ pathway, status, gaps }) => (
            <li key={pathway.id} className="rounded-lg bg-paper p-3 text-ink">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{pathway.title}</strong>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS[status].className}`}
                >
                  {STATUS[status].label}
                </span>
              </div>
              <p className="text-sm">
                {ROUTE_LABEL[pathway.route]} · careers: {pathway.careers.join(', ')}
              </p>
              {gaps.length > 0 && (
                <p className="text-sm font-medium">To get there: {gaps.join(' · ')}</p>
              )}
            </li>
          ))}
        </ol>
      </div>
      <p className="text-xs opacity-80">
        Requirements are indicative only. Always check the current prospectus of the university or
        college.
      </p>
    </section>
  );
}
