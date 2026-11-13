import type { CatchUpPlan } from '../domain/catchUpPlan';
import type { Diagnosis } from '../domain/diagnosis';
import type { GoalConstraints } from '../domain/goal';
import type { CheckResult } from '../domain/review';

/** Everything a deterministic check may look at. */
export interface ReviewSubject {
  plan: CatchUpPlan;
  diagnosis: Diagnosis;
  constraints: GoalConstraints;
}

/** A pure, fast rule the Reviewer runs before any model judgement. */
export type ReviewCheck = (subject: ReviewSubject) => CheckResult;
