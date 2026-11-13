import { capsLevel } from '../analysis/capsLevel';

export interface TopicStanding {
  topic: string;
  scorePct: number;
  capsLevel: number;
}

interface TopicMark {
  readonly topic: string;
  readonly scorePct: number;
}

export const mean = (values: readonly number[]): number =>
  values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;

/** Average mark per topic, weakest first, each placed on the CAPS scale. */
export function topicStandings(marks: readonly TopicMark[]): TopicStanding[] {
  return [...Map.groupBy(marks, (mark) => mark.topic)]
    .map(([topic, group]) => {
      const scorePct = Math.round(mean(group.map((mark) => mark.scorePct)));
      return { topic, scorePct, capsLevel: capsLevel(scorePct).level };
    })
    .sort((a, b) => a.scorePct - b.scorePct);
}
