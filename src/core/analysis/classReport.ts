import { z } from 'zod';
import type { LearnerRecord } from '../domain/learnerRecord';
import { assessRisk } from './assessRisk';
import { capsLevel } from './capsLevel';

export const REPORT_FILTERS = ['failing', 'passing', 'at-risk', 'all'] as const;
export const ReportFilterSchema = z.enum(REPORT_FILTERS);
export type ReportFilter = z.infer<typeof ReportFilterSchema>;

/** A term average below this is reported as failing (CAPS levels 1 and 2). */
export const PASS_MARK_PCT = 40;

export interface ReportRow {
  learnerId: string;
  averagePct: number;
  capsLevel: number;
  riskScore: number;
}

export const FILTER_LABEL: Record<ReportFilter, string> = {
  failing: `failing (term average below ${PASS_MARK_PCT}%)`,
  passing: `passing (term average ${PASS_MARK_PCT}% or more)`,
  'at-risk': 'at risk of failing',
  all: 'in the class',
};

const averageOf = (record: LearnerRecord) =>
  record.results.length === 0
    ? 0
    : Math.round(
        record.results.reduce((total, r) => total + r.scorePct, 0) / record.results.length,
      );

/**
 * Answers "who is failing / passing / at risk?" in code, so the numbers can be trusted.
 * Failing and at-risk lists start with the learner who needs help most; passing with the best.
 */
export function classReport(
  records: readonly LearnerRecord[],
  filter: ReportFilter,
  riskThreshold: number,
): ReportRow[] {
  const rows = records.map((record) => {
    const averagePct = averageOf(record);
    return {
      learnerId: record.learnerId,
      averagePct,
      capsLevel: capsLevel(averagePct).level,
      riskScore: assessRisk(record).riskScore,
    };
  });
  const keep: Record<ReportFilter, (row: ReportRow) => boolean> = {
    failing: (row) => row.averagePct < PASS_MARK_PCT,
    passing: (row) => row.averagePct >= PASS_MARK_PCT,
    'at-risk': (row) => row.riskScore >= riskThreshold,
    all: () => true,
  };
  const order = filter === 'passing' || filter === 'all' ? -1 : 1;
  return rows
    .filter(keep[filter])
    .sort(
      (a, b) => order * (a.averagePct - b.averagePct) || a.learnerId.localeCompare(b.learnerId),
    );
}
