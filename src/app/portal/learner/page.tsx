import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LearnerDashboard } from '@/components/learner/LearnerDashboard';
import { ThusoMascot } from '@/components/mascot/ThusoMascot';
import { requireUser } from '@/lib/auth';
import { learnerView } from '@/lib/learnerView';
import { learnerTips } from '@/lib/mascotTips';

export const metadata: Metadata = { title: 'My page — Thuso' };

export default async function MyPage() {
  const user = await requireUser(['learner']);
  const view = await learnerView(user.id);
  if (!view) {
    notFound();
  }
  return (
    <>
      <LearnerDashboard {...view} isOwnPage />
      <ThusoMascot tips={learnerTips(view.profile)} />
    </>
  );
}
