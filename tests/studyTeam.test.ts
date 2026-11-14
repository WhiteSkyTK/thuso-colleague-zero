import { describe, expect, it } from 'vitest';
import { buildLearnerProfile } from '@/core/insights/learnerProfile';
import { CATCH_UP_TASK, type LearnerAsks } from '@/core/tutor/planChecks';
import { runStudyTeam } from '@/core/tutor/studyTeam';
import { seedClassData } from './helpers/testKit';

const data = seedClassData();
const profileOf = (id: string) => buildLearnerProfile(data, id, 40)!;
const asks = (overrides: Partial<LearnerAsks> = {}): LearnerAsks => ({
  firstName: 'Refilwe',
  minutesPerDay: 60,
  avoidFormats: [],
  preferredFormats: ['visual-story', 'worked-examples'],
  ...overrides,
});
const levels = (events: { agent: string; level: string }[]) =>
  events.map((e) => `${e.agent}·${e.level}`);

describe('the learner’s study team', () => {
  it('plans, analyses, drafts, reviews and delivers five days', () => {
    const result = runStudyTeam(profileOf('L-014'), asks());
    expect(result.days).toHaveLength(5);
    const steps = levels(result.events);
    expect(steps[0]).toBe('PL·PLAN');
    expect(steps).toContain('AN·ACT');
    expect(steps).toContain('CO·ACT');
    expect(steps).toContain('RV·PASS');
    expect(steps.at(-1)).toBe('MS·DONE');
  });

  it('catches a plan that ignores missed lessons, and the Coach fixes it', () => {
    const result = runStudyTeam(profileOf('L-014'), asks());
    const flagged = result.events.find((e) => e.level === 'FLAG');
    expect(flagged?.message).toContain('missed lessons');
    expect(result.events.some((e) => e.agent === 'CO' && e.level === 'FIX')).toBe(true);
    expect(result.days[0]?.task).toBe(CATCH_UP_TASK);
  });

  it('holds the plan to what the learner said: time per day and formats that did not help', () => {
    const result = runStudyTeam(
      profileOf('L-014'),
      asks({ minutesPerDay: 20, avoidFormats: ['visual-story'] }),
    );
    expect(result.days.every((d) => d.minutes <= 20)).toBe(true);
    expect(result.days.some((d) => d.format === 'visual-story')).toBe(false);
  });

  it('starts gently for a learner who feels lost', () => {
    const result = runStudyTeam(profileOf('L-014'), asks({ feeling: 'lost' }));
    expect(result.events.some((e) => e.message.includes('lost'))).toBe(true);
    const first = data.resources.find((r) => r.id === result.days[0]?.resourceId);
    expect(first?.rung).toBe('foundation');
  });
});
