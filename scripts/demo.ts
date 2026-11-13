/**
 * Headless demo: runs the default goal on the offline mock provider and prints
 * the agent log. Exit code 0 only when the run completed with no human intervention.
 */
import { DEMO_GOAL_TEXT } from '../src/core/config/constants';
import { loadConfig } from '../src/core/config/env';
import { createColleague } from '../src/core/createColleague';
import { formatEvent } from '../src/core/events/formatEvent';

const print = (line: string): void => {
  process.stdout.write(`${line}\n`);
};

async function main(): Promise<number> {
  const config = loadConfig({ ...process.env, LLM_PROVIDER: 'mock' });
  const colleague = createColleague({ config });
  colleague.events.subscribe((event) => {
    print(formatEvent(event));
  });

  print(`Goal: ${DEMO_GOAL_TEXT}\n`);
  const summary = await colleague.run(DEMO_GOAL_TEXT);

  print('');
  print(`Step ${summary.stepsCompleted} of ${summary.stepsTotal} · ${summary.status}`);
  print(
    `Delivered: ${summary.itemsDelivered} · Fixes: ${summary.fixes} · Escalations: ${summary.escalations.length}`,
  );
  print(`Human interventions: ${summary.humanInterventions}`);
  return summary.status === 'completed' && summary.humanInterventions === 0 ? 0 : 1;
}

main().then(
  (exitCode) => {
    process.exitCode = exitCode;
  },
  (error: unknown) => {
    process.stderr.write(`Demo failed: ${error instanceof Error ? error.message : 'unknown'}\n`);
    process.exitCode = 1;
  },
);
