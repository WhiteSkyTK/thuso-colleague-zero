import { describe, expect, it } from 'vitest';
import { checkSubjectChoice, isValidChoice } from '@/core/subjects/nscSubjects';

const GOOD = ['ZUHL', 'ENGL', 'MATH', 'LIFO', 'PHSC', 'LIFE', 'GEOG'];
const failed = (codes: string[]) =>
  checkSubjectChoice(codes)
    .filter((rule) => !rule.isMet)
    .map((rule) => rule.label);

describe('NSC subject choice', () => {
  it('accepts a full, valid choice', () => {
    expect(isValidChoice(GOOD)).toBe(true);
    expect(isValidChoice(['ENHL', 'AFAL', 'MLIT', 'LIFO', 'ACCN', 'BSTD', 'ECON'])).toBe(true);
  });

  it('needs exactly seven subjects and three electives', () => {
    expect(failed(GOOD.slice(0, 6))).toEqual(['Exactly 7 subjects (6 chosen)', '3 electives']);
  });

  it('needs English, and two different languages', () => {
    expect(failed(['ZUHL', 'AFAL', 'MATH', 'LIFO', 'PHSC', 'LIFE', 'GEOG'])).toEqual([
      'English as Home or First Additional Language',
    ]);
    expect(failed(['ENHL', 'ENGL', 'MATH', 'LIFO', 'PHSC', 'LIFE', 'GEOG'])).toEqual([
      'Two different languages',
    ]);
  });

  it('allows Mathematics or Mathematical Literacy, not both', () => {
    expect(failed(['ZUHL', 'ENGL', 'MATH', 'MLIT', 'LIFO', 'PHSC', 'LIFE'])).toEqual([
      'Mathematics or Mathematical Literacy (one of them)',
      '3 electives',
    ]);
  });

  it('requires Life Orientation and rejects unknown codes', () => {
    expect(failed(['ZUHL', 'ENGL', 'MATH', 'PHSC', 'LIFE', 'GEOG', 'HIST'])).toEqual([
      'Life Orientation',
      '3 electives',
    ]);
    expect(failed([...GOOD.slice(0, 6), 'XXXX'])).toContain('Only subjects from the list');
  });
});
