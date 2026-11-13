/** The parts of a stored invite the website needs: when, what and where. */
export interface InviteSummary {
  /** UTC instants in RFC 5545 form, e.g. 20261116T123000Z. */
  start: string;
  end: string;
  title: string;
  details: string;
  location: string;
}

const unescapeText = (value: string) =>
  value
    .replaceAll(String.raw`\n`, '\n')
    .replaceAll(String.raw`\,`, ',')
    .replaceAll(String.raw`\;`, ';')
    .replaceAll(String.raw`\\`, '\\');

/** Reads the first event of an .ics file (unfolding continuation lines first). */
export function readInvite(ics: string): InviteSummary | undefined {
  const lines = ics.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  const field = (name: string) => {
    const line = lines.find(
      (candidate) => candidate.startsWith(`${name}:`) || candidate.startsWith(`${name};`),
    );
    return line ? unescapeText(line.slice(line.indexOf(':') + 1)) : '';
  };
  const start = field('DTSTART');
  const end = field('DTEND');
  if (!/^\d{8}T\d{6}Z$/.test(start) || !/^\d{8}T\d{6}Z$/.test(end)) {
    return undefined;
  }
  return {
    start,
    end,
    title: field('SUMMARY'),
    details: field('DESCRIPTION'),
    location: field('LOCATION'),
  };
}

/** "Add to Google Calendar" link: works on any phone or computer, no file download needed. */
export function googleCalendarLink(invite: InviteSummary): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: invite.title,
    dates: `${invite.start}/${invite.end}`,
    details: invite.details,
    location: invite.location,
    ctz: 'Africa/Johannesburg',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** 20261116T123000Z → a Date. */
export function inviteTime(value: string): Date {
  const [, y, mo, d, h, mi, s] = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value) ?? [];
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)));
}
