import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/ui/SiteNav';
import { buildLearnerProfile } from '@/core/insights/learnerProfile';
import { classStore } from '@/lib/classStore';
import { FORMAT_ICON, FORMAT_LABEL } from '@/lib/labels';

export const metadata: Metadata = { title: 'Learners — Thuso' };

export default function LearnerListPage() {
  const { data, riskThreshold } = classStore();
  const profiles = data.learners.flatMap((learner) => {
    const profile = buildLearnerProfile(data, learner.id, riskThreshold);
    return profile ? [profile] : [];
  });

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 sm:px-6">
        <div>
          <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
            Learners · Grade 10
          </p>
          <h1 className="font-display text-6xl font-extrabold uppercase leading-none">
            Who are you?
          </h1>
          <p className="mt-2 max-w-2xl">
            Pick your name to see where you stand in every subject, what is holding you back, what
            to study next in the way you learn best, and where your marks can take you.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {profiles.map(({ learner, subjects }) => {
            const needsSupport = subjects.some((subject) => subject.isAtRisk);
            return (
              <li key={learner.id}>
                <Link
                  href={`/learner/${learner.id}`}
                  className="flex h-full flex-col gap-1 rounded-card bg-white p-4 shadow-card hover:bg-jacaranda-50"
                >
                  <span className="font-display text-2xl font-extrabold uppercase">
                    {learner.firstName} {learner.lastName.charAt(0)}.
                  </span>
                  <span className="font-mono text-xs">{learner.id}</span>
                  <span className="text-sm">
                    {learner.preferredFormats
                      .map((format) => `${FORMAT_ICON[format]} ${FORMAT_LABEL[format]}`)
                      .join(' · ')}
                  </span>
                  {needsSupport && (
                    <span className="mt-1 self-start rounded-full bg-sun px-2 py-0.5 text-xs font-semibold">
                      ! Has a catch-up plan
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
