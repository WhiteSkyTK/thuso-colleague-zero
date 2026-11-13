import { describe, expect, it } from 'vitest';
import type { AgentEvent } from '@/core/domain/agentEvent';
import { EventBus } from '@/core/events/EventBus';
import { isFinalEvent, TraceRecorder } from '@/core/events/TraceRecorder';
import { INITIAL_RUN_VIEW, runViewReducer, type RunView } from '@/lib/runView';
import { WORLD_SPEED, worldSpeedFor } from '@/lib/worldSpeed';

const event = (seq: number, overrides: Partial<AgentEvent> = {}): AgentEvent => ({
  runId: 'run-1',
  seq,
  ts: seq * 1000,
  agent: 'CO',
  level: 'ACT',
  message: `event ${seq}`,
  ...overrides,
});
const DONE = event(9, { agent: 'SYS', level: 'DONE', message: 'Workflow complete.' });

describe('TraceRecorder', () => {
  it('replays recorded events to a late follower, then follows live', () => {
    const bus = new EventBus();
    const recorder = new TraceRecorder(bus);
    bus.publish(event(0));
    const seen: number[] = [];
    recorder.follow('run-1', (received) => seen.push(received.seq));
    bus.publish(event(1));
    bus.publish(event(2, { runId: 'other-run' }));
    expect(seen).toEqual([0, 1]);
    expect(recorder.eventsOf('run-1')).toHaveLength(2);
    expect(recorder.eventsOf('missing')).toEqual([]);
  });

  it('stops delivering after unsubscribe and after the final event', () => {
    const bus = new EventBus();
    const recorder = new TraceRecorder(bus);
    const seen: number[] = [];
    const stop = recorder.follow('run-1', (received) => seen.push(received.seq));
    bus.publish(event(0));
    stop();
    bus.publish(event(1));
    expect(seen).toEqual([0]);
    expect(isFinalEvent(DONE)).toBe(true);
    expect(isFinalEvent(event(3, { agent: 'MS', level: 'DONE' }))).toBe(false);
  });

  it('keeps only the most recent runs', () => {
    const bus = new EventBus();
    const recorder = new TraceRecorder(bus);
    for (let run = 0; run < 25; run += 1) {
      bus.publish({ ...DONE, runId: `run-${run}` });
    }
    expect(recorder.eventsOf('run-0')).toEqual([]);
    expect(recorder.eventsOf('run-24')).toHaveLength(1);
  });
});

describe('runViewReducer', () => {
  const play = (events: AgentEvent[]): RunView =>
    events.reduce(
      (view, next) => runViewReducer(view, { type: 'event', event: next }),
      runViewReducer(INITIAL_RUN_VIEW, { type: 'started' }),
    );

  it('ignores events until a run has started', () => {
    expect(runViewReducer(INITIAL_RUN_VIEW, { type: 'event', event: event(0) })).toBe(
      INITIAL_RUN_VIEW,
    );
  });

  it('tracks the active agent, the step and the self-correction counters', () => {
    const view = play([
      event(0, { agent: 'SYS', level: 'INFO', data: { stepIndex: 3, stepsTotal: 5 } }),
      event(1, { agent: 'CO' }),
      event(2, { agent: 'RV', level: 'FLAG', message: 'L-014: 9 absences.' }),
      event(3, { agent: 'CO', level: 'FIX', message: 'L-014: plan fixed.' }),
      event(4, { agent: 'SYS', level: 'ESCALATE', message: 'L-021: needs a human.' }),
    ]);
    expect(view).toMatchObject({
      status: 'running',
      activeAgent: 'CO',
      seenAgents: ['CO', 'RV'],
      stepIndex: 3,
      stepsTotal: 5,
      flags: 1,
      fixes: 1,
      humanInterventions: 1,
      announcement: 'L-021: needs a human.',
    });
    expect(view.events).toHaveLength(5);
  });

  it('finishes as completed on DONE and as stopped on a system ERROR', () => {
    expect(play([event(0), DONE])).toMatchObject({ status: 'completed', activeAgent: null });
    const stopped = play([event(0), { ...DONE, level: 'ERROR' }]);
    expect(stopped.status).toBe('stopped');
  });

  it('reports a failure only while running', () => {
    const running = runViewReducer(INITIAL_RUN_VIEW, { type: 'started' });
    const failed = runViewReducer(running, { type: 'failed', message: 'Lost the connection.' });
    expect(failed).toMatchObject({ status: 'failed', error: 'Lost the connection.' });
    const finished = play([DONE]);
    expect(runViewReducer(finished, { type: 'failed', message: 'late' })).toBe(finished);
  });
});

describe('worldSpeedFor', () => {
  it('runs at normal speed before anything happens', () => {
    expect(worldSpeedFor([])).toBe(WORLD_SPEED.normal);
  });

  it('slows while a flag is up and recovers when the fix passes', () => {
    const flagged = [
      event(0),
      event(1, { agent: 'RV', level: 'FLAG' }),
      event(2, { level: 'FIX' }),
    ];
    expect(worldSpeedFor(flagged)).toBe(WORLD_SPEED.flagged);
    expect(worldSpeedFor([...flagged, event(3, { agent: 'RV', level: 'PASS' })])).toBe(
      WORLD_SPEED.normal,
    );
  });

  it('speeds up when the run is done', () => {
    expect(worldSpeedFor([event(0), DONE])).toBe(WORLD_SPEED.celebrating);
  });
});
