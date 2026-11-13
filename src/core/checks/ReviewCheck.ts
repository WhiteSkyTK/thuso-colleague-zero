import type { CatchUpPlan } from '../domain/catchUpPlan';
import type { Resource, SchoolDay } from '../domain/classData';
import type { Diagnosis } from '../domain/diagnosis';
import type { GoalConstraints } from '../domain/goal';
import type { CheckResult } from '../domain/review';

/** Everything a deterministic check may look at. */
export interface ReviewSubject {
  plan: CatchUpPlan;
  diagnosis: Diagnosis;
  constraints: GoalConstraints;
  /** The subject's whole resource catalogue. */
  resources: readonly Resource[];
  calendar: readonly SchoolDay[];
}

/** A pure, fast rule the Reviewer runs before any model judgement. */
export type ReviewCheck = (subject: ReviewSubject) => CheckResult;

export const pass = (checkId: string): CheckResult => ({
  checkId,
  passed: true,
  severity: 'error',
  evidence: '',
  fixHint: '',
});

/** A failure always carries the evidence and a concrete fix (CLAUDE.md §7.4). */
export const fail = (checkId: string, evidence: string, fixHint: string): CheckResult => ({
  checkId,
  passed: false,
  severity: 'error',
  evidence,
  fixHint,
});
