import type { AgentCode } from '../domain/codes';
import type { StepRequest, StepResult } from '../domain/step';
import type { RunContext } from '../orchestrator/RunContext';

/** `once`: one call with all upstream items. `each`: one call per upstream item, in parallel. */
export type ActionScope = 'once' | 'each';

/** What an agent tells the Planner it can do. */
export interface ActionSpec {
  description: string;
  scope: ActionScope;
}

/** Any agent the orchestrator can give a plan step to. */
export interface StepAgent {
  readonly code: AgentCode;
  readonly actions: Readonly<Record<string, ActionSpec>>;
  execute(request: StepRequest, ctx: RunContext): Promise<StepResult>;
}
