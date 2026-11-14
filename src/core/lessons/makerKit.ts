/** A fresh question with new numbers; the answer and the working are computed, never guessed. */
export interface MadeQuestion {
  question: string;
  answer: number;
  unit: string;
  working: readonly string[];
}

/** Whole number in [min, max]. */
export type Pick = (min: number, max: number) => number;
export type Maker = (pick: Pick) => MadeQuestion;

export const round2 = (value: number) => Math.round(value * 100) / 100;

export function fromList<T>(pick: Pick, list: readonly T[]): T {
  const item = list[pick(0, list.length - 1)];
  if (item === undefined) {
    throw new RangeError('fromList needs a non-empty list');
  }
  return item;
}
