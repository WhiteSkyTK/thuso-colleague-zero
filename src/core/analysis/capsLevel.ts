/** The seven-point CAPS achievement scale used on South African report cards. */
const CAPS_BANDS = [
  { level: 7, from: 80, label: 'Outstanding' },
  { level: 6, from: 70, label: 'Meritorious' },
  { level: 5, from: 60, label: 'Substantial' },
  { level: 4, from: 50, label: 'Adequate' },
  { level: 3, from: 40, label: 'Moderate' },
  { level: 2, from: 30, label: 'Elementary' },
  { level: 1, from: 0, label: 'Not achieved' },
] as const;

export interface CapsLevel {
  level: number;
  label: string;
}

/** Where a percentage sits on the CAPS scale — the same scale teachers and guardians already know. */
export function capsLevel(scorePct: number): CapsLevel {
  const band = CAPS_BANDS.find((candidate) => scorePct >= candidate.from) ?? CAPS_BANDS[CAPS_BANDS.length - 1];
  return { level: band.level, label: band.label };
}
