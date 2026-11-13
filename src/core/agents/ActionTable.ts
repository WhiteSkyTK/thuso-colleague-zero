import type { StepRequest, StepResult } from '../domain/step';
import { StepFailedError } from '../errors/AppError';
import type { RunContext } from '../orchestrator/RunContext';
import type { ActionSpec } from './StepAgent';

export type ActionHandler = (request: StepRequest, ctx: RunContext) => Promise<StepResult>;

export interface ActionDef extends ActionSpec {
  handle: ActionHandler;
}

/** Maps a plan step's action name to the agent method that does it — no switch to grow. */
export class ActionTable {
  readonly specs: Readonly<Record<string, ActionSpec>>;
  private readonly handlers: ReadonlyMap<string, ActionHandler>;

  constructor(defs: Readonly<Record<string, ActionDef>>) {
    const entries = Object.entries(defs);
    this.handlers = new Map(entries.map(([name, def]) => [name, def.handle]));
    this.specs = Object.fromEntries(
      entries.map(([name, def]) => [name, { description: def.description, scope: def.scope }]),
    );
  }

  dispatch(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    const handle = this.handlers.get(request.step.action);
    if (!handle) {
      return Promise.reject(
        new StepFailedError(`${request.step.agent} has no action "${request.step.action}"`),
      );
    }
    return handle(request, ctx);
  }
}
