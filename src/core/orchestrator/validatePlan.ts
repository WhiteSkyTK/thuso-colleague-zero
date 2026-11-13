import type { Plan } from '../domain/plan';
import type { AgentRegistry } from './AgentRegistry';

/**
 * The plan is model output, so it is checked in code before anything runs.
 * Steps may only depend on earlier steps, which also rules out cycles.
 * @returns the problems found; an empty list means the plan can run.
 */
export function validatePlan(plan: Plan, registry: AgentRegistry, maxSteps: number): string[] {
  const problems: string[] = [];
  if (plan.steps.length > maxSteps) {
    problems.push(`plan has ${plan.steps.length} steps; the limit is ${maxSteps}`);
  }

  const seen = new Set<string>();
  for (const step of plan.steps) {
    if (seen.has(step.id)) {
      problems.push(`step id "${step.id}" is used twice`);
    }
    if (!registry.specFor(step)) {
      problems.push(`step ${step.id}: ${step.agent} has no action "${step.action}"`);
    }
    for (const dependencyId of step.dependsOn) {
      if (!seen.has(dependencyId)) {
        problems.push(`step ${step.id} depends on "${dependencyId}", which is not an earlier step`);
      }
    }
    seen.add(step.id);
  }
  return problems;
}
