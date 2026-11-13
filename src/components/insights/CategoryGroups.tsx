import Link from 'next/link';
import {
  CATEGORIES,
  type CategorisedLearner,
  type CategoryKey,
} from '@/core/insights/learnerCategory';

const ORDER: readonly CategoryKey[] = [
  'missing-lessons',
  'practice-gap',
  'slipping',
  'topic-gap',
  'watch',
  'steady',
  'thriving',
];

/** The class in groups Thuso learned from the data: open a group to see who is in it. */
export function CategoryGroups({
  learners,
  title,
}: Readonly<{ learners: readonly CategorisedLearner[]; title: string }>) {
  const groups = Map.groupBy(learners, (learner) => learner.category.key);
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="font-display text-3xl font-extrabold uppercase">{title}</h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {ORDER.map((key) => {
          const members = groups.get(key) ?? [];
          const category = CATEGORIES[key];
          return (
            <li key={key} className="rounded-card bg-white p-3 shadow-card">
              <details>
                <summary className="flex cursor-pointer flex-col">
                  <span className="text-2xl" aria-hidden="true">
                    {category.icon}
                  </span>
                  <span className="font-display text-3xl font-extrabold">{members.length}</span>
                  <span className="text-sm font-semibold">{category.label}</span>
                </summary>
                <p className="mt-2 text-xs">{category.support}</p>
                <ul className="mt-2 flex flex-col gap-1 text-sm">
                  {members.map((member) => (
                    <li key={member.learnerId}>
                      <Link href={`/portal/learners/${member.learnerId}`} className="underline">
                        {member.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
