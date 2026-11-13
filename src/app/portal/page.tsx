import { redirect } from 'next/navigation';
import { homeFor, requireUser } from '@/lib/auth';

/** /portal sends everyone to their own home. */
export default async function PortalHome() {
  const user = await requireUser();
  redirect(homeFor(user.role));
}
