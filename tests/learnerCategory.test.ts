import { describe, expect, it } from 'vitest';
import {
  categorise,
  categoriseClass,
  classSignals,
  learnedFacts,
} from '@/core/insights/learnerCategory';
import { seedClassData } from './helpers/testKit';

const THRESHOLD = 40;
const data = seedClassData();
const signals = classSignals(data);
const categoryOf = (id: string) => categorise(signals.get(id) ?? [], THRESHOLD).key;

describe('learner categories', () => {
  it('names the group from the root cause where a learner is at risk', () => {
    expect(categoryOf('L-014')).toBe('missing-lessons');
    expect(categoryOf('L-003')).toBe('practice-gap');
    expect(categoryOf('L-018')).toBe('slipping');
    expect(categoryOf('L-021')).toBe('topic-gap');
  });

  it('puts every learner in exactly one group, with most of the class doing fine', () => {
    const all = categoriseClass(data, THRESHOLD);
    expect(all).toHaveLength(32);
    const fine = all.filter((l) => ['steady', 'thriving'].includes(l.category.key));
    expect(fine.length).toBeGreaterThan(all.length / 2);
  });

  it('describes what Thuso has learned about a learner', () => {
    const facts = learnedFacts(signals.get('L-014') ?? [], ['visual-story', 'worked-examples']);
    expect(facts[0]).toMatch(/^Strongest subject: /);
    expect(facts).toContain('Has missed many lessons recently.');
    expect(facts.at(-1)).toBe('Learns best with: visual story, worked examples.');
  });
});
