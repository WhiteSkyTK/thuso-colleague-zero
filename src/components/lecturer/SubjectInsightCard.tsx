import Link from 'next/link';
import type { SubjectInsight } from '@/core/insights/classInsights';
import type { LearningFormat } from '@/core/domain/vocab';
import { CAUSE_LABEL, FORMAT_LABEL } from '@/lib/labels';

function topFormat(counts: Record<LearningFormat, number>): LearningFormat | undefined {
  const [best] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return best && best[1] > 0 ? (best[0] as LearningFormat) : undefined;
}

/** One subject: class average, the topics to reteach, and who needs help and why. */
export function SubjectInsightCard({ insight }: Readonly<{ insight: SubjectInsight }>) {
  const format = topFormat(insight.formatCounts);
  return (
    <article className="flex flex-col gap-4 rounded-card bg-white p-5 shadow-card">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-3xl font-extrabold uppercase">{insight.subjectName}</h3>
        <p className="font-mono text-sm">
          Class average <strong>{insight.averagePct}%</strong> · {insight.atRisk.length} at risk
        </p>
      </header>

      <section aria-label={`Weakest ${insight.subjectName} topics`}>
        <h4 className="font-semibold">Reteach to the whole class</h4>
        <ul className="mt-2 flex flex-col gap-2">
          {insight.weakestTopics.map((topic) => (
            <li key={topic.topic} className="text-sm">
              <div className="flex justify-between">
                <span>{topic.topic}</span>
                <span className="font-mono">
                  {topic.scorePct}% · CAPS {topic.capsLevel}
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-jacaranda-50">
                <div
                  className="bar-fill h-2 rounded-full bg-ember-500"
                  style={{ width: `${topic.scorePct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        {format && (
          <p className="mt-2 text-sm">
            Tip: most learners at risk learn best with <strong>{FORMAT_LABEL[format]}</strong>.
            Reteach that way.
          </p>
        )}
      </section>

      {insight.atRisk.length > 0 && (
        <section aria-label={`${insight.subjectName} learners at risk`} className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="py-1 pr-2">Learner</th>
                <th className="py-1 pr-2">Risk</th>
                <th className="py-1 pr-2">Root cause</th>
                <th className="py-1">Learns best with</th>
              </tr>
            </thead>
            <tbody>
              {insight.atRisk.map((learner) => (
                <tr key={learner.learnerId} className="border-b border-ink/5 align-top">
                  <td className="py-2 pr-2">
                    <Link
                      href={`/portal/learners/${learner.learnerId}`}
                      className="font-semibold underline"
                    >
                      {learner.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-2 font-mono">{learner.riskScore}</td>
                  <td className="py-2 pr-2">
                    {CAUSE_LABEL[learner.cause]}
                    <span className="block text-xs opacity-75">{learner.evidence}</span>
                  </td>
                  <td className="py-2">
                    {learner.formats.map((item) => FORMAT_LABEL[item]).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </article>
  );
}
