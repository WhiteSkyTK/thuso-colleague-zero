import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LearnerDashboard } from '@/components/learner/LearnerDashboard';
import { StudyTeam } from '@/components/learner/StudyTeam';
import { PortalMascot } from '@/components/mascot/PortalMascot';
import { MessageList } from '@/components/messages/MessageList';
import { requireUser } from '@/lib/auth';
import { learnerView } from '@/lib/learnerView';
import { learnerTips } from '@/lib/mascotTips';
import { school } from '@/lib/school';
import { savedPlanFor } from '@/lib/studyTeam';
import { runStudyTeamAction } from './actions';

export const metadata: Metadata = { title: 'My page — Thuso' };

const INBOX_SIZE = 5;

export default async function MyPage() {
  const user = await requireUser(['learner']);
  const [view, { messages }] = await Promise.all([learnerView(user.id), school()]);
  if (!view) {
    notFound();
  }
  const [inbox, savedDays] = await Promise.all([
    messages.forLearner(user.id, INBOX_SIZE),
    savedPlanFor(user.id),
  ]);
  const tips = learnerTips(view.profile);
  return (
    <>
      <section aria-labelledby="inbox-heading" className="flex flex-col gap-3">
        <h2 id="inbox-heading" className="font-display text-4xl font-extrabold uppercase">
          My messages
        </h2>
        <MessageList
          messages={inbox}
          showRecipient={false}
          emptyText="No messages yet. When your teacher runs Thuso, your catch-up plan and booked session arrive here."
        />
      </section>
      <StudyTeam savedDays={savedDays} onRun={runStudyTeamAction} />
      <LearnerDashboard {...view} isOwnPage />
      <PortalMascot
        user={user}
        tips={
          inbox[0]?.hasInvite
            ? [
                'Your catch-up plan is here, with a support session booked. Add it to your calendar!',
                ...tips,
              ]
            : tips
        }
      />
    </>
  );
}
