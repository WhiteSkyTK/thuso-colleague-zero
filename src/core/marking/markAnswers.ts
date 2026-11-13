import { z } from 'zod';

/** One question of a practice paper. The memo answer is never shown to learners before marking. */
export const QuestionSchema = z.object({
  id: z.string().regex(/^q\d{1,2}$/),
  prompt: z.string().trim().min(3).max(600),
  /** The memo: a value ("12", "x = 3"), a phrase, or key terms separated by ";". */
  answer: z.string().trim().min(1).max(400),
  marks: z.number().int().min(1).max(20),
  topic: z.string().trim().min(1).max(80),
});
export type Question = z.infer<typeof QuestionSchema>;

export interface Answer {
  questionId: string;
  answer: string;
}

/** Thuso's proposed mark for one answer, with the reason a teacher can check. */
export interface ProposedMark {
  questionId: string;
  awarded: number;
  max: number;
  reason: string;
  /** False when a person should look: partial credit, a blank or an answer Thuso is unsure of. */
  isConfident: boolean;
}

/** Numbers within this fraction of the memo value count as right (rounding in working). */
const NUMERIC_TOLERANCE = 0.01;

const normalise = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9.,;=-]+/g, ' ')
    .trim();
const numbersIn = (text: string) =>
  (text.replaceAll(',', '.').match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

function sameNumbers(given: string, memo: string): boolean {
  const want = numbersIn(memo);
  const got = numbersIn(given);
  return (
    want.length > 0 &&
    want.length === got.length &&
    want.every(
      (value, at) =>
        Math.abs((got[at] ?? Number.NaN) - value) <= Math.abs(value) * NUMERIC_TOLERANCE + 1e-9,
    )
  );
}

/** Marks one answer against the memo in code: exact, numeric, then key terms for partial credit. */
export function markAnswer(question: Question, given: string): ProposedMark {
  const base = { questionId: question.id, max: question.marks };
  const answer = normalise(given);
  if (answer === '') {
    return { ...base, awarded: 0, reason: 'No answer given.', isConfident: false };
  }
  const memo = normalise(question.answer);
  if (
    answer === memo ||
    (sameNumbers(given, question.answer) &&
      numbersIn(question.answer).length > 0 &&
      !question.answer.includes(';'))
  ) {
    return { ...base, awarded: question.marks, reason: 'Matches the memo.', isConfident: true };
  }
  const terms = question.answer
    .split(';')
    .map(normalise)
    .filter((term) => term.length > 0);
  if (terms.length > 1) {
    const found = terms.filter((term) => answer.includes(term));
    const awarded = Math.round((found.length / terms.length) * question.marks);
    const listed = found.length > 0 ? ' (' + found.join(', ') + ')' : '';
    return {
      ...base,
      awarded,
      reason: `Found ${found.length} of ${terms.length} key points${listed}.`,
      isConfident: found.length === terms.length || found.length === 0,
    };
  }
  if (answer.includes(memo) || memo.includes(answer)) {
    return {
      ...base,
      awarded: Math.ceil(question.marks / 2),
      reason: 'Close to the memo, worded differently — please check.',
      isConfident: false,
    };
  }
  return {
    ...base,
    awarded: 0,
    reason: `Does not match the memo (${question.answer}).`,
    isConfident: true,
  };
}

export interface MarkedPaper {
  marks: ProposedMark[];
  awarded: number;
  max: number;
  /** How many marks a teacher should look at before they are final. */
  toCheck: number;
}

export function markPaper(questions: readonly Question[], answers: readonly Answer[]): MarkedPaper {
  const given = new Map(answers.map((a) => [a.questionId, a.answer]));
  const marks = questions.map((question) => markAnswer(question, given.get(question.id) ?? ''));
  return {
    marks,
    awarded: marks.reduce((total, m) => total + m.awarded, 0),
    max: marks.reduce((total, m) => total + m.max, 0),
    toCheck: marks.filter((m) => !m.isConfident).length,
  };
}

/** Final marks per topic as percentages — what flows into the learner's record once verified. */
export function topicPercentages(
  questions: readonly Question[],
  final: ReadonlyMap<string, number>,
): Map<string, number> {
  const byTopic = Map.groupBy(questions, (q) => q.topic);
  return new Map(
    [...byTopic].map(([topic, list]) => {
      const max = list.reduce((total, q) => total + q.marks, 0);
      const awarded = list.reduce((total, q) => total + Math.min(q.marks, final.get(q.id) ?? 0), 0);
      return [topic, Math.round((awarded / Math.max(max, 1)) * 100)];
    }),
  );
}
