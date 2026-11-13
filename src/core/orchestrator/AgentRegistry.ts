import type { CatalogueEntry } from '../agents/PlannerAgent';
import type { ActionSpec, StepAgent } from '../agents/StepAgent';
import type { AgentCode } from '../domain/codes';
import type { PlanStep } from '../domain/plan';
import { PlanInvalidError } from '../errors/AppError';

/** The team: adding an agent means registering one more class here — no switch anywhere. */
export class AgentRegistry {
  private readonly agents = new Map<AgentCode, StepAgent>();

  register(agent: StepAgent): this {
    this.agents.set(agent.code, agent);
    return this;
  }

  get(code: AgentCode): StepAgent {
    const agent = this.agents.get(code);
    if (!agent) {
      throw new PlanInvalidError(`no agent registered for ${code}`);
    }
    return agent;
  }

  /** The action a step asks for, or undefined when no agent offers it. */
  specFor(step: PlanStep): ActionSpec | undefined {
    const actions = this.agents.get(step.agent)?.actions ?? {};
    return Object.hasOwn(actions, step.action) ? actions[step.action] : undefined;
  }

  /** Everything the team can do — given to the Planner so it plans with real capabilities. */
  catalogue(): CatalogueEntry[] {
    return [...this.agents.values()].flatMap((agent) =>
      Object.entries(agent.actions).map(([action, spec]) => ({
        agent: agent.code,
        action,
        ...spec,
      })),
    );
  }
}
