import { describe, expect, it } from 'vitest';
import { assessRisk } from '@/core/analysis/assessRisk';
import { capsLevel } from '@/core/analysis/capsLevel';
import { causeAddressedCheck } from '@/core/checks/causeAddressedCheck';
import { formatFitCheck } from '@/core/checks/formatFitCheck';
import { looksLikeInstruction } from '@/core/checks/looksLikeInstruction';
import { privacyCheck } from '@/core/checks/privacyCheck';
import { resourceExistsCheck } from '@/core/checks/resourceExistsCheck';
import type { ReviewSubject } from '@/core/checks/ReviewCheck';
import { scaffoldCheck } from '@/core/checks/scaffoldCheck';
import { supportSessionCheck } from '@/core/checks/supportSessionCheck';
import { suspectTextCheck } from '@/core/checks/suspectTextCheck';
import { workloadCheck } from '@/core/checks/workloadCheck';
import type { CatchUpPlan, PlanSession } from '@/core/domain/catchUpPlan';
import type { Diagnosis } from '@/core/domain/diagnosis';
import { InMemoryClassRepository } from '@/core/repositories/InMemoryClassRepository';
import { seedClassData } from './helpers/testKit';

const repo = new InMemoryClassRepository(seedClassData());
const THRESHOLD = 40;
const assess = (subjectId: string) => repo.recordsFor(subjectId).map(assessRisk);
const find = (subjectId: string, learnerId: string) => {
  const found = assess(subjectId).find((assessed) => assessed.learnerId === learnerId);
  if (!found) {
    throw new Error(`${learnerId} not found`);
  }
  return found;
};

describe('capsLevel', () => {
  it('maps percentages to the seven CAPS levels', () => {
    expect(capsLevel(85)).toEqual({ level: 7, label: 'Outstanding' });
    expect(capsLevel(50)).toEqual({ level: 4, label: 'Adequate' });
    expect(capsLevel(39)).toEqual({ level: 2, label: 'Elementary' });
    expect(capsLevel(0)).toEqual({ level: 1, label: 'Not achieved' });
  });
});

describe('assessRisk on the seed class', () => {
  it('finds exactly the seven at-risk Mathematics learners and each root cause', () => {
    const atRisk = assess('MATH').filter((assessed) => assessed.riskScore >= THRESHOLD);
    expect(Object.fromEntries(atRisk.map((assessed) => [assessed.learnerId, assessed.primaryCause]))).toEqual({
      'L-003': 'homework',
      'L-009': 'homework',
      'L-014': 'attendance',
      'L-018': 'assessment-trend',
      'L-021': 'topic-gap',
      'L-027': 'homework',
      'L-030': 'assessment-trend',
    });
  });

  it('gives the evidence behind each cause', () => {
    expect(find('MATH', 'L-014').evidence).toBe('9 absences in the last 6 weeks');
    expect(find('MATH', 'L-003').evidence).toBe('6 of 25 homework tasks handed in');
    expect(find('MATH', 'L-021').evidence).toBe('statistics at 20% against a 46% average');
    expect(find('MATH', 'L-018').evidence).toMatch(/^average fell from 64% to \d+% over the term$/);
  });

  it('puts L-009 exactly on the threshold', () => {
    expect(find('MATH', 'L-009').riskScore).toBe(THRESHOLD);
  });

  it('scores a learner with no attendance register and records the gap', () => {
    const assessed = find('MATH', 'L-030');
    expect(assessed.signals.attendance).toBeNull();
    expect(assessed.dataGaps).toEqual(['attendance']);
  });

  it('is not moved by an instruction in the learner text', () => {
    const assessed = find('MATH', 'L-027');
    expect(assessed.hasSuspectText).toBe(true);
    expect(assessed.riskScore).toBeGreaterThanOrEqual(THRESHOLD);
    expect(looksLikeInstruction('I find fractions hard.')).toBe(false);
  });

  it('lists weak topics, weakest first, with CAPS levels', () => {
    expect(find('MATH', 'L-021').weakTopics[0]).toEqual({ topic: 'statistics', scorePct: 20, capsLevel: 1 });
    expect(find('MATH', 'L-001').weakTopics).toHaveLength(1);
  });

  it('finds a different set of learners in Physical Sciences', () => {
    const atRisk = assess('PHSC').filter((assessed) => assessed.riskScore >= THRESHOLD);
    expect(atRisk.map((assessed) => assessed.learnerId)).toEqual(['L-005', 'L-014', 'L-022']);
    expect(find('PHSC', 'L-005').primaryCause).toBe('topic-gap');
  });
});

describe('InMemoryClassRepository', () => {
  it('describes the class and guards its directory', () => {
    expect(repo.overview()).toMatchObject({ learnerCount: 32, weeksOfData: 10 });
    expect(repo.overview().subjects.map((subject) => subject.id)).toEqual(['MATH', 'PHSC']);
    expect(repo.recordsFor('NONE')).toEqual([]);
    expect(repo.contactsOf('L-999')).toBeUndefined();
    expect(repo.contactsOf('L-001')?.learnerEmail).toBe('l001@learners.example.org');
    expect(repo.forSubject('MATH').some((resource) => resource.topic === 'statistics')).toBe(false);
  });
});

describe('review checks', () => {
  const diagnosis: Diagnosis = { ...find('MATH', 'L-014'), explanation: 'Missed lessons.' };
  const session = (overrides: Partial<PlanSession> = {}): PlanSession => ({
    day: 1,
    topic: 'finance and growth',
    minutes: 45,
    format: 'visual-story',
    rung: 'foundation',
    activity: 'draw the idea as a comic strip',
    resourceIds: [],
    ...overrides,
  });
  const subject = (plan: Partial<CatchUpPlan> = {}): ReviewSubject => ({
    plan: {
      learnerId: 'L-014',
      addresses: ['attendance'],
      summary: 'attendance first',
      sessions: [session(), session({ day: 3, rung: 'guided' })],
      supportSession: { date: '2026-11-16', time: '14:30' },
      learnerMessage: 'Here is your plan.',
      guardianMessage: 'Here is the plan.',
      ...plan,
    },
    diagnosis,
    constraints: { riskThreshold: THRESHOLD, maxHoursPerWeek: 4 },
    resources: repo.forSubject('MATH'),
    calendar: repo.days(),
  });
  const CHECKS = [
    causeAddressedCheck,
    resourceExistsCheck,
    workloadCheck,
    scaffoldCheck,
    formatFitCheck,
    supportSessionCheck,
    privacyCheck,
  ];

  it('passes a sound plan on every check', () => {
    expect(CHECKS.map((check) => check(subject()).passed)).toEqual(CHECKS.map(() => true));
  });

  it('fails a plan that misses the root cause, with evidence and a fix', () => {
    const result = causeAddressedCheck(subject({ addresses: ['topic-gap'] }));
    expect(result.evidence).toBe('plan targets topic-gap, but 9 absences in the last 6 weeks');
    expect(result.fixHint).toContain('attendance');
  });

  it('fails an invented resource id', () => {
    const result = resourceExistsCheck(subject({ sessions: [session({ resourceIds: ['R-001', 'R-099'] })] }));
    expect(result).toMatchObject({ passed: false, evidence: 'R-099 is not in the resource catalogue' });
  });

  it('fails a week with too many minutes', () => {
    const result = workloadCheck(subject({ sessions: [session({ minutes: 200 }), session({ day: 2, minutes: 60 })] }));
    expect(result.evidence).toBe('week 1 asks for 260 minutes; the limit is 240');
  });

  it('fails a topic that skips the foundation or steps back down', () => {
    const lowTopic = diagnosis.weakTopics.find((weak) => weak.capsLevel <= 2)?.topic ?? '';
    const skipped = scaffoldCheck(subject({ sessions: [session({ topic: lowTopic, rung: 'exam' })] }));
    expect(skipped.evidence).toContain('starts at "exam"');
    const backwards = scaffoldCheck(
      subject({
        sessions: [
          session({ topic: 'trigonometry', rung: 'guided' }),
          session({ topic: 'trigonometry', day: 5, rung: 'foundation' }),
        ],
      }),
    );
    expect(backwards.evidence).toContain('steps back from "guided" to "foundation"');
  });

  it('fails a plan that ignores how the learner likes to learn', () => {
    const result = formatFitCheck(
      subject({ sessions: [session({ format: 'audio' }), session({ day: 3, format: 'practice' })] }),
    );
    expect(result.evidence).toContain('0 of 2 sessions');
  });

  it('fails a support session outside the calendar', () => {
    const result = supportSessionCheck(subject({ supportSession: { date: '2026-11-15', time: '14:30' } }));
    expect(result.passed).toBe(false);
  });

  it('fails a message that mentions another learner', () => {
    const result = privacyCheck(subject({ guardianMessage: 'Like L-021, your child needs help.' }));
    expect(result.evidence).toBe('a message mentions another learner (L-021)');
  });

  it('warns, but does not fail, on instruction-like learner text', () => {
    const flagged = suspectTextCheck({ ...subject(), diagnosis: { ...diagnosis, hasSuspectText: true } });
    expect(flagged).toMatchObject({ passed: false, severity: 'warn' });
    expect(suspectTextCheck(subject()).passed).toBe(true);
  });
});
