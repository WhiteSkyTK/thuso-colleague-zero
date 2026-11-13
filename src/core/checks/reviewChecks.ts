import { causeAddressedCheck } from './causeAddressedCheck';
import { formatFitCheck } from './formatFitCheck';
import { privacyCheck } from './privacyCheck';
import { resourceExistsCheck } from './resourceExistsCheck';
import type { ReviewCheck } from './ReviewCheck';
import { scaffoldCheck } from './scaffoldCheck';
import { supportSessionCheck } from './supportSessionCheck';
import { suspectTextCheck } from './suspectTextCheck';
import { workloadCheck } from './workloadCheck';

/** Every deterministic check the Reviewer runs, in order. Adding a check = adding it here. */
export const REVIEW_CHECKS: readonly ReviewCheck[] = [
  causeAddressedCheck,
  resourceExistsCheck,
  workloadCheck,
  scaffoldCheck,
  formatFitCheck,
  supportSessionCheck,
  privacyCheck,
  suspectTextCheck,
];
