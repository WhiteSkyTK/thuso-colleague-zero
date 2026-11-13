'use client';

import { ThusoMascot } from '@/components/mascot/ThusoMascot';
import { ParallaxScene } from '@/components/parallax/ParallaxScene';
import { demoGoalFor } from '@/core/config/constants';
import { useRunStream } from '@/hooks/useRunStream';
import { narrationFor, worldSpeedFor } from '@/lib/worldSpeed';
import { AgentChips } from './AgentChips';
import { GoalForm } from './GoalForm';
import { RunConsole } from './RunConsole';
import { RunResults } from './RunResults';

/** The run screen: state a goal, watch the agents work, see the result. */
export function LiveRun({ grade }: Readonly<{ grade: number }>) {
  const { view, start } = useRunStream(grade);

  return (
    <section className="flex flex-col gap-6">
      <ParallaxScene
        className="h-[clamp(220px,30vw,340px)] w-full rounded-card shadow-card"
        worldSpeed={worldSpeedFor(view.events)}
        activeAgent={view.activeAgent}
      />
      <GoalForm
        key={grade}
        initialGoal={demoGoalFor(grade)}
        isRunning={view.status === 'running'}
        onRun={(goal) => {
          void start(goal);
        }}
      />
      <AgentChips activeAgent={view.activeAgent} seenAgents={view.seenAgents} />
      <RunConsole events={view.events} />
      <RunResults view={view} />
      <ThusoMascot
        tips={[
          'Press Run and watch my five agents plan, check and fix their own work.',
          'Watch for the red flag: the Reviewer catches a mistake and the street slows down.',
        ]}
        live={narrationFor(view.events)}
      />
    </section>
  );
}
