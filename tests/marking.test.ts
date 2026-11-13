import { describe, expect, it } from 'vitest';
import { markAnswer, markPaper, topicPercentages, type Question } from '@/core/marking/markAnswers';

const q = (id: string, answer: string, extra: Partial<Question> = {}): Question => ({
  id,
  prompt: 'Question text',
  answer,
  marks: 2,
  topic: 'functions',
  ...extra,
});

describe('markAnswer', () => {
  it('gives full marks for the memo answer and for the same number written differently', () => {
    expect(markAnswer(q('q1', 'x = 3'), 'x=3')).toMatchObject({ awarded: 2, isConfident: true });
    expect(markAnswer(q('q2', '12.5'), '12,5 cm')).toMatchObject({ awarded: 2, isConfident: true });
  });

  it('gives no marks, confidently, for a wrong number', () => {
    expect(markAnswer(q('q1', '7'), '9')).toMatchObject({ awarded: 0, isConfident: true });
  });

  it('gives partial credit for key points and asks the teacher to check', () => {
    const mark = markAnswer(
      q('q3', 'photosynthesis; chlorophyll; sunlight', { marks: 3, topic: 'cells' }),
      'Plants use sunlight in photosynthesis',
    );
    expect(mark).toMatchObject({ awarded: 2, max: 3, isConfident: false });
    expect(mark.reason).toContain('2 of 3 key points');
  });

  it('flags a blank answer for the teacher', () => {
    expect(markAnswer(q('q1', '3'), '  ')).toMatchObject({
      awarded: 0,
      isConfident: false,
      reason: 'No answer given.',
    });
  });
});

describe('markPaper and topic marks', () => {
  const questions = [
    q('q1', '3', { marks: 2, topic: 'functions' }),
    q('q2', '10', { marks: 2, topic: 'functions' }),
    q('q3', 'a; b', { marks: 4, topic: 'trigonometry' }),
  ];

  it('totals the paper and counts the marks a teacher should check', () => {
    const paper = markPaper(questions, [
      { questionId: 'q1', answer: '3' },
      { questionId: 'q2', answer: '11' },
      { questionId: 'q3', answer: 'a only' },
    ]);
    expect(paper).toMatchObject({ awarded: 4, max: 8, toCheck: 1 });
  });

  it('turns verified question marks into a percentage per topic', () => {
    const final = new Map([
      ['q1', 2],
      ['q2', 0],
      ['q3', 4],
    ]);
    expect(Object.fromEntries(topicPercentages(questions, final))).toEqual({
      functions: 50,
      trigonometry: 100,
    });
  });
});
