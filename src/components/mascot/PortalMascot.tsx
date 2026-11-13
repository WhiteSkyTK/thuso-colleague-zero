import { answerCheckInAction, askThusoAction } from '@/app/portal/ask/actions';
import { markAlertsReadAction } from '@/app/portal/teacher/actions';
import { checkInFor } from '@/core/assistant/checkIns';
import type { Role, SchoolUser } from '@/core/domain/schoolUser';
import { school } from '@/lib/school';
import { ThusoMascot } from './ThusoMascot';

const ALERTS_SHOWN = 6;

/** Tap-to-ask starters per role. */
const ASK_EXAMPLES: Record<Role, readonly string[]> = {
  learner: ['What should I study?', 'How am I doing?', 'When is my session?'],
  teacher: ['Who is failing?', 'Who is missing lessons?', 'Weakest topic?'],
  principal: ['Who is at risk in grade 11?', 'Who is thriving?', 'How many learners?'],
  admin: ['How many learners?', 'Who is failing in grade 12?', 'Who is missing lessons?'],
};

interface PortalMascotProps {
  readonly user: SchoolUser;
  readonly tips: readonly string[];
  /** Staff pages pass the grade on screen so Thuso can run the agents for it. */
  readonly runGrade?: number;
}

/** Thuso on a portal page: alerts first, then tips, today's check-in, the Ask box and (staff) the live run. */
export async function PortalMascot({ user, tips, runGrade }: PortalMascotProps) {
  const { notifications, notes } = await school();
  const isLearner = user.role === 'learner';
  const [alerts, hasCheckedIn] = await Promise.all([
    notifications.unreadFor(user.id, ALERTS_SHOWN),
    isLearner ? notes.answeredToday(user.id) : Promise.resolve(true),
  ]);
  return (
    <ThusoMascot
      tips={tips}
      alerts={alerts}
      onReadAlerts={markAlertsReadAction}
      runGrade={isLearner ? undefined : runGrade}
      ask={{ onAsk: askThusoAction, examples: ASK_EXAMPLES[user.role] }}
      checkIn={
        hasCheckedIn
          ? undefined
          : { question: checkInFor(new Date()), onAnswer: answerCheckInAction }
      }
    />
  );
}
