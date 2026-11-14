import { topicNotes } from './buildLesson';
import { makeQuestion, makerKey, type Pick } from './questionMakers';

export interface DraftQuestion {
  prompt: string;
  answer: string;
  marks: number;
  topic: string;
}

const MAX_QUESTIONS = 12;
const MADE_PER_TOPIC = 2;
const MARKS = 2;

/**
 * A practice paper Thuso writes for a teacher: fresh-number questions (answers computed, so
 * marking is exact) where a question maker exists, and exam-style questions with memo answers
 * from the lesson notes otherwise. The teacher edits and approves before learners see it.
 */
export function draftPaper(
  subjectId: string,
  topics: readonly string[],
  pick: Pick,
): DraftQuestion[] {
  const questions = topics.flatMap((topic) => {
    const made = Array.from({ length: MADE_PER_TOPIC }, () =>
      makeQuestion(makerKey(subjectId, topic), pick),
    ).flatMap((q) => (q ? [q] : []));
    if (made.length > 0) {
      return made.map((q) => ({
        prompt: q.unit ? `${q.question} (answer in ${q.unit})` : q.question,
        answer: String(q.answer),
        marks: MARKS,
        topic,
      }));
    }
    return (topicNotes(subjectId, topic)?.checks ?? []).map((check) => ({
      prompt: check.question,
      answer: check.answer,
      marks: MARKS,
      topic,
    }));
  });
  return questions.slice(0, MAX_QUESTIONS);
}
