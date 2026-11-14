/** The columns a school spreadsheet needs (any order; header names are not case-sensitive). */
export const CSV_TEMPLATE = [
  'role,first_name,last_name,email,grade,guardian_name,guardian_email,formats,teaching',
  'learner,Thandi,Mokoena,thandi.mokoena@example.org,10,Mrs Mokoena,mokoena.family@example.org,visual-story;audio,',
  'teacher,Sipho,Dlamini,sipho.dlamini@example.org,,,,,10:MATH;11:MATH',
].join('\n');

export interface CsvAccountRow {
  line: number;
  name: string;
  /** Shaped like the account form's input; the server action validates it. */
  input: Record<string, unknown>;
}

/** Inside quotes: "" is a quote mark, a lone " closes the quotes, anything else is text. */
function quotedChar(text: string, at: number): { add: string; step: number; closes: boolean } {
  if (text[at] !== '"') {
    return { add: text[at] ?? '', step: 1, closes: false };
  }
  return text[at + 1] === '"'
    ? { add: '"', step: 2, closes: false }
    : { add: '', step: 1, closes: true };
}

/** Splits CSV text into rows of cells: quotes, commas inside quotes and CRLF line ends. */
export function readCsv(raw: string): string[][] {
  const text = raw.replace(/\r\n?/g, '\n');
  const rows: string[][] = [[]];
  let cell = '';
  let isQuoted = false;
  const endCell = () => {
    rows.at(-1)?.push(cell);
    cell = '';
  };
  let at = 0;
  while (at < text.length) {
    if (isQuoted) {
      const next = quotedChar(text, at);
      cell += next.add;
      isQuoted = !next.closes;
      at += next.step;
      continue;
    }
    const char = text[at];
    if (char === '"') {
      isQuoted = true;
    } else if (char === ',') {
      endCell();
    } else if (char === '\n') {
      endCell();
      rows.push([]);
    } else {
      cell += char;
    }
    at += 1;
  }
  endCell();
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const list = (value: string | undefined) =>
  (value ?? '')
    .split(/[;|]/)
    .map((part) => part.trim())
    .filter(Boolean);

function toInput(cell: (name: string) => string | undefined): Record<string, unknown> {
  const role = (cell('role') ?? '').toLowerCase();
  const person = {
    role,
    firstName: cell('first_name') ?? cell('firstname'),
    lastName: cell('last_name') ?? cell('lastname'),
    email: cell('email'),
  };
  if (role === 'teacher') {
    const teaching = list(cell('teaching')).map((pair) => {
      const [grade, subjectId] = pair.split(':');
      return { grade: Number(grade), subjectId: (subjectId ?? '').trim().toUpperCase() };
    });
    return { ...person, teaching };
  }
  const formats = list(cell('formats')).map((f) => f.toLowerCase());
  return {
    ...person,
    grade: Number(cell('grade')),
    guardianName: cell('guardian_name'),
    guardianEmail: cell('guardian_email'),
    formats: formats.length > 0 ? formats : ['worked-examples'],
  };
}

/** Turns a spreadsheet into account inputs, one per row, with its line number for feedback. */
export function parseAccountsCsv(text: string): { rows: CsvAccountRow[]; error?: string } {
  const [header, ...body] = readCsv(text.replace(/^﻿/, ''));
  const columns = (header ?? []).map((name) => name.trim().toLowerCase().replace(/\s+/g, '_'));
  if (!columns.includes('role') || !columns.includes('email')) {
    return { rows: [], error: 'The first row must name the columns, including role and email.' };
  }
  return {
    rows: body.map((cells, at) => {
      const cell = (name: string) => {
        const index = columns.indexOf(name);
        const value = index >= 0 ? cells[index]?.trim() : undefined;
        return value === '' ? undefined : value;
      };
      const input = toInput(cell);
      return {
        line: at + 2,
        name: `${String(input.firstName ?? '')} ${String(input.lastName ?? '')}`.trim(),
        input,
      };
    }),
  };
}
