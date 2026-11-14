import { describe, expect, it } from 'vitest';
import { answerLearner } from '@/core/assistant/answerLearner';
import { answerStaff, type StaffContext } from '@/core/assistant/answerQuestion';
import { CHECK_INS, checkInFor, isFormat, updatedFormats } from '@/core/assistant/checkIns';
import { buildLearnerProfile } from '@/core/insights/learnerProfile';
import { seedClassData } from './helpers/testKit';

const THRESHOLD = 40;
const data = seedClassData();
const staff: StaffContext = { classes: [{ grade: 10, data }], riskThreshold: THRESHOLD };

describe('Ask Thuso — staff questions', () => {
  it('lists at-risk learners by name, with their averages, from code', () => {
    const reply = answerStaff('Who is at risk in maths?', staff);
    expect(reply.answer).toMatch(/^Grade 10 Mathematics: \d+ at risk — /);
    expect(reply.answer).toMatch(/\(\d+(\.\d+)?%\)/);
    expect(reply.links[0]?.href).toBe('/portal/teacher');
  });

  it('answers about one learner when their name is asked', () => {
    const learner = data.learners[0]!;
    const reply = answerStaff(`How is ${learner.firstName} doing?`, staff);
    expect(reply.answer).toContain(`${learner.firstName} ${learner.lastName} · Grade 10`);
    expect(reply.links[0]?.href).toBe(`/portal/learners/${learner.id}`);
  });

  it('groups learners by what holds them back', () => {
    const reply = answerStaff('who is missing lessons?', staff);
    expect(reply.answer).toContain('Missing lessons');
    expect(reply.answer).toContain('What helps:');
  });

  it('only answers for the grades in view', () => {
    expect(answerStaff('who is failing in grade 12?', staff).answer).not.toContain('Grade 10');
  });

  it('counts learners and suggests examples for anything else', () => {
    expect(answerStaff('how many learners?', staff).answer).toBe(
      `Grade 10: ${data.learners.length} learners`,
    );
    expect(answerStaff('hello', staff).answer).toMatch(/^Ask me things like/);
  });
});

describe('Ask Thuso — learner questions', () => {
  const profile = buildLearnerProfile(data, 'L-014', THRESHOLD)!;
  const context = {
    profile,
    chosenSubjects: ['Mathematics'],
    nextSession: 'Catch-up, Mon 16 Nov, 14:30',
  };

  it('points the learner at their weakest subject first', () => {
    const reply = answerLearner('What should I study?', context);
    expect(reply.answer).toMatch(/^Start with |^You are on track/);
    expect(reply.links.map((l) => l.href)).toContain('/portal/practice');
  });

  it('gives marks, the session and the subjects from their own data', () => {
    expect(answerLearner('how am I doing?', context).answer).toMatch(/%\s\(CAPS \d\)/);
    expect(answerLearner('when is my session?', context).answer).toContain('Mon 16 Nov, 14:30');
    expect(answerLearner('my subjects', context).answer).toBe('Your subjects: Mathematics.');
  });
});

describe('daily check-ins', () => {
  it('asks one question a day, in turn', () => {
    const day = 86_400_000;
    const ids = [0, 1, 2, 3].map((n) => checkInFor(new Date(n * day)).id);
    expect(new Set(ids).size).toBe(CHECK_INS.length);
  });

  it('moves a chosen format to the front and keeps two', () => {
    expect(updatedFormats(['visual-story', 'worked-examples'], 'audio')).toEqual([
      'audio',
      'visual-story',
    ]);
    expect(updatedFormats(['visual-story', 'audio'], 'audio')).toEqual(['audio', 'visual-story']);
    expect(isFormat('audio')).toBe(true);
    expect(isFormat('morning')).toBe(false);
  });
});
