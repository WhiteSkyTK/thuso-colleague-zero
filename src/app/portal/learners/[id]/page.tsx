import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LearnerDashboard } from '@/components/learner/LearnerDashboard';
import { requireUser } from '@/lib/auth';
import { learnerView } from '@/lib/learnerView';

export const metadata: Metadata = { title: 'Learner — Thuso' };

/** Staff see any learner's full picture; a learner may only open their own. */
export default async function LearnerProfilePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const [{ id }, user] = await Promise.all([params, requireUser()]);
  if (user.role === 'learner' && user.id !== id) {
    notFound();
  }
  const view = await learnerView(id);
  if (!view) {
    notFound();
  }
  return <LearnerDashboard {...view} isOwnPage={user.id === id} />;
}
