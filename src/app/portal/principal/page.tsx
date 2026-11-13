import type { Metadata } from 'next';
import Link from 'next/link';
import { SubjectInsightCard } from '@/components/lecturer/SubjectInsightCard';
import { PortalMascot } from '@/components/mascot/PortalMascot';
import { WatchButton } from '@/components/mascot/WatchButton';
import { runWatchAction } from '../teacher/actions';
import { GRADES } from '@/core/domain/schoolUser';
import type { RiskCause } from '@/core/domain/vocab';
import { buildClassInsights } from '@/core/insights/classInsights';
import { requireUser } from '@/lib/auth';
import { CAUSE_LABEL } from '@/lib/labels';
import { principalTips } from '@/lib/mascotTips';
import { classFor, school } from '@/lib/school';

export const metadata: Metadata = { title: 'School — Thuso' };

export default async function PrincipalPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ grade?: string }> }>) {
  const [user, query, { riskThreshold }] = await Promise.all([
    requireUser(['principal', 'admin']),
    searchParams,
    school(),
  ]);
  const byGrade = await Promise.all(
    GRADES.map(async (grade) => ({
      grade,
      insights: buildClassInsights(await classFor(grade), riskThreshold),
    })),
  );
  const open = byGrade.find((entry) => String(entry.grade) === query.grade);

  return (
    <>
      <section>
        <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
          Principal · whole school
        </p>
        <h1 className="font-display text-6xl font-extrabold uppercase leading-none">
          Jacaranda High
        </h1>
      </section>

      <WatchButton onWatch={runWatchAction} />
      <div className="grid gap-4 md:grid-cols-3">
        {byGrade.map(({ grade, insights }) => {
          const atRisk = insights.subjects.flatMap((s) => s.atRisk);
          const unique = new Set(atRisk.map((l) => l.learnerId)).size;
          const causes = Object.entries(Object.groupBy(atRisk, (l) => l.cause))
            .map(([cause, list]) => ({ cause: cause as RiskCause, count: list?.length ?? 0 }))
            .sort((a, b) => b.count - a.count);
          const top = causes[0];
          return (
            <Link
              key={grade}
              href={`/portal/principal?grade=${grade}`}
              aria-current={open?.grade === grade ? 'page' : undefined}
              className={`flex flex-col gap-2 rounded-card p-5 shadow-card ${open?.grade === grade ? 'bg-jacaranda-50' : 'bg-white'}`}
            >
              <span className="font-display text-4xl font-extrabold uppercase">Grade {grade}</span>
              <span>
                <strong className="font-display text-5xl">{unique}</strong> of{' '}
                {insights.learnerCount} need support
              </span>
              {insights.subjects.map((s) => (
                <span key={s.subjectId} className="text-sm">
                  {s.subjectName}: average {s.averagePct}% · {s.atRisk.length} at risk
                </span>
              ))}
              {top && (
                <span className="text-sm">
                  Top cause: <strong>{CAUSE_LABEL[top.cause]}</strong> ({top.count})
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {open && (
        <section aria-labelledby="grade-heading" className="flex flex-col gap-4">
          <h2 id="grade-heading" className="font-display text-4xl font-extrabold uppercase">
            Grade {open.grade} in detail
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {open.insights.subjects.map((insight) => (
              <SubjectInsightCard key={insight.subjectId} insight={insight} />
            ))}
          </div>
        </section>
      )}
      <PortalMascot user={user} tips={principalTips(byGrade)} runGrade={open?.grade ?? 10} />
    </>
  );
}
