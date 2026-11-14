import { describe, expect, it } from 'vitest';
import { CSV_TEMPLATE, parseAccountsCsv, readCsv } from '@/core/school/parseAccountsCsv';

describe('spreadsheet import', () => {
  it('reads quoted cells, commas inside quotes and Windows line ends', () => {
    expect(readCsv('a,"b, c","say ""hi"""\r\n1,2,3\r\n')).toEqual([
      ['a', 'b, c', 'say "hi"'],
      ['1', '2', '3'],
    ]);
  });

  it('turns the template into a learner and a teacher, with line numbers', () => {
    const { rows, error } = parseAccountsCsv(CSV_TEMPLATE);
    expect(error).toBeUndefined();
    expect(rows.map((r) => r.line)).toEqual([2, 3]);
    expect(rows[0]?.input).toMatchObject({
      role: 'learner',
      grade: 10,
      formats: ['visual-story', 'audio'],
    });
    expect(rows[1]?.input).toMatchObject({
      role: 'teacher',
      teaching: [
        { grade: 10, subjectId: 'MATH' },
        { grade: 11, subjectId: 'MATH' },
      ],
    });
  });

  it('asks for a header row with role and email', () => {
    expect(parseAccountsCsv('Thandi,Mokoena').error).toMatch(/role and email/);
  });
});
