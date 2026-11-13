/** South Africa has one time zone, two hours ahead of UTC all year (no daylight saving). */
const SAST_OFFSET_HOURS = 2;
const MS_PER_MINUTE = 60_000;
const MAX_LINE_OCTETS = 75;
const REMINDER_MINUTES = 30;
const CRLF = '\r\n';
const PRODUCT_ID = '-//Thuso//Learner support colleague//EN';

export interface Person {
  name: string;
  email: string;
}

export interface InviteDetails {
  /** Stable per learner and run, so a re-sent invite updates the same calendar entry. */
  uid: string;
  /** School-day date and time in South Africa, e.g. 2026-11-16 and 14:30. */
  date: string;
  time: string;
  durationMinutes: number;
  summary: string;
  description: string;
  location: string;
  organizer: Person;
  attendees: readonly Person[];
  /** When the invite was created (DTSTAMP). */
  stamp: Date;
}

/** `2026-11-16` + `14:30` in SAST → the UTC instant. */
export function sastToUtc(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(
    Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1, (hour ?? 0) - SAST_OFFSET_HOURS, minute ?? 0),
  );
}

/** RFC 5545 UTC form: 20261116T123000Z. */
const icsTime = (instant: Date): string =>
  instant
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

/** RFC 5545 §3.3.11: escape backslash, semicolon, comma and line breaks in TEXT values. */
export const escapeText = (value: string): string =>
  value
    .replaceAll('\\', String.raw`\\`)
    .replaceAll(';', String.raw`\;`)
    .replaceAll(',', String.raw`\,`)
    .replace(/\r?\n/g, String.raw`\n`);

/** RFC 5545 §3.1: lines longer than 75 octets continue on the next line after a space. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  for (const character of line) {
    const limit = parts.length === 0 ? MAX_LINE_OCTETS : MAX_LINE_OCTETS - 1;
    if (encoder.encode(current + character).length > limit) {
      parts.push(current);
      current = character;
    } else {
      current += character;
    }
  }
  parts.push(current);
  return parts.join(`${CRLF} `);
}

const mailto = (person: Person) => `CN=${escapeText(person.name)}:mailto:${person.email}`;

/**
 * A calendar invite (METHOD:REQUEST) that Outlook, Gmail and phone calendars accept, with a
 * reminder 30 minutes before. Pure: the same details always give the same file.
 */
export function buildInvite(details: InviteDetails): string {
  const start = sastToUtc(details.date, details.time);
  const end = new Date(start.getTime() + details.durationMinutes * MS_PER_MINUTE);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODUCT_ID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${details.uid}`,
    `DTSTAMP:${icsTime(details.stamp)}`,
    `DTSTART:${icsTime(start)}`,
    `DTEND:${icsTime(end)}`,
    `SUMMARY:${escapeText(details.summary)}`,
    `DESCRIPTION:${escapeText(details.description)}`,
    `LOCATION:${escapeText(details.location)}`,
    `ORGANIZER;${mailto(details.organizer)}`,
    ...details.attendees.map(
      (person) => `ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE;${mailto(person)}`,
    ),
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(details.summary)}`,
    `TRIGGER:-PT${REMINDER_MINUTES}M`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(foldLine).join(CRLF)}${CRLF}`;
}
