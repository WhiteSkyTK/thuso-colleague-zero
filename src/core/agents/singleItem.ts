import type { StepRequest } from '../domain/step';
import type { WorkItem } from '../domain/workItem';
import { StepFailedError } from '../errors/AppError';

/** For "each" actions: the one work item the step was given. */
export function singleItem(request: StepRequest): WorkItem {
  const [item] = request.items;
  if (!item || request.items.length !== 1) {
    throw new StepFailedError(
      `${request.step.action} needs exactly one work item, got ${request.items.length}`,
    );
  }
  return item;
}
