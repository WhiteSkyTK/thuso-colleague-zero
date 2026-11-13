import { describe, expect, it } from 'vitest';
import { buildInvite, escapeText, foldLine, sastToUtc } from '@/core/delivery/IcsBuilder';

const DETAILS = {
  uid: 'run-1-L-014@thuso.example.org',
  date: '2026-11-16',
  time: '14:30',
  durationMinutes: 45,
  summary: 'Catch-up session: finance, growth and decay',
  description: 'Bring your workbook.\nWe start with the topic you missed; then practice.',
  location: 'Jacaranda High, staff room',
  organizer: { name: 'Nomvula Khoza', email: 'maths.teacher@school.example.org' },
  attendees: [
    { name: 'Refilwe Mahlangu', email: 'l014@learners.example.org' },
    { name: 'Guardian of L-014', email: 'guardian.l014@families.example.org' },
  ],
  stamp: new Date(Date.UTC(2026, 10, 13, 18, 0, 0)),
};

describe('IcsBuilder', () => {
  it('turns a South African school time into UTC (SAST is UTC+2 all year)', () => {
    expect(sastToUtc('2026-11-16', '14:30').toISOString()).toBe('2026-11-16T12:30:00.000Z');
    expect(sastToUtc('2026-11-17', '01:00').toISOString()).toBe('2026-11-16T23:00:00.000Z');
  });

  it('escapes commas, semicolons, backslashes and line breaks', () => {
    expect(escapeText('a, b; c\\d\ne')).toBe('a\\, b\\; c\\\\d\\ne');
  });

  it('folds long lines at 75 octets with a leading space', () => {
    const folded = foldLine(`DESCRIPTION:${'x'.repeat(200)}`);
    for (const line of folded.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    expect(
      folded
        .split('\r\n')
        .slice(1)
        .every((line) => line.startsWith(' ')),
    ).toBe(true);
    expect(folded.replace(/\r\n /g, '')).toBe(`DESCRIPTION:${'x'.repeat(200)}`);
  });

  it('builds a calendar invite with the session time, both attendees and a reminder', () => {
    const ics = buildInvite(DETAILS);
    // Calendar apps unfold continuation lines before reading values.
    const unfolded = ics.replace(/\r\n /g, '');
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('METHOD:REQUEST');
    expect(ics).toContain('DTSTART:20261116T123000Z');
    expect(ics).toContain('DTEND:20261116T131500Z');
    expect(ics).toContain('DTSTAMP:20261113T180000Z');
    expect(ics).toContain('SUMMARY:Catch-up session: finance\\, growth and decay');
    expect(unfolded).toContain('CN=Refilwe Mahlangu:mailto:l014@learners.example.org');
    expect(unfolded).toContain('mailto:guardian.l014@families.example.org');
    expect(ics).toContain('TRIGGER:-PT30M');
    expect(buildInvite(DETAILS)).toBe(ics);
  });
});
