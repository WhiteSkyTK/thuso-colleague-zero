import { markAlertsReadAction } from '@/app/portal/teacher/actions';
import type { SchoolUser } from '@/core/domain/schoolUser';
import { school } from '@/lib/school';
import { ThusoMascot } from './ThusoMascot';

const ALERTS_SHOWN = 6;

interface PortalMascotProps {
  readonly user: SchoolUser;
  readonly tips: readonly string[];
  /** Staff pages pass the grade on screen so Thuso can run the agents for it. */
  readonly runGrade?: number;
}

/** Thuso on a portal page: this person's unread alerts first, then tips, and the live run for staff. */
export async function PortalMascot({ user, tips, runGrade }: PortalMascotProps) {
  const { notifications } = await school();
  const alerts = await notifications.unreadFor(user.id, ALERTS_SHOWN);
  return (
    <ThusoMascot
      tips={tips}
      alerts={alerts}
      onReadAlerts={markAlertsReadAction}
      runGrade={user.role === 'learner' ? undefined : runGrade}
    />
  );
}
