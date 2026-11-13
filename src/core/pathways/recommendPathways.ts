import { capsLevel, minPercentForLevel } from '../analysis/capsLevel';
import { INTERESTS, PATHWAYS, type Interest, type Pathway } from './pathwayCatalogue';

/** APS counts the best six subjects, without Life Orientation. */
const APS_SUBJECTS = 6;
const EXCLUDED_FROM_APS = 'life orientation';
/** Within this many APS points, or one CAPS level short in a subject, a pathway is a "stretch". */
const STRETCH_APS = 5;
const STRETCH_LEVELS = 1;
export const MAX_CV_CHARS = 2000;

export interface SubjectMark {
  readonly subject: string;
  readonly percent: number;
}

export type MatchStatus = 'within-reach' | 'stretch' | 'not-yet';

export interface PathwayMatch {
  pathway: Pathway;
  status: MatchStatus;
  /** What to improve, e.g. "Mathematics: 58% → 70%". Empty when within reach. */
  gaps: string[];
  interestMatches: number;
}

const normalise = (subject: string) => subject.trim().toLowerCase();

/** Admission Point Score: the CAPS level (1–7) of each of the best six subjects, added up. */
export function apsScore(marks: readonly SubjectMark[]): number {
  return marks
    .filter((mark) => normalise(mark.subject) !== EXCLUDED_FROM_APS)
    .map((mark) => capsLevel(mark.percent).level)
    .sort((a, b) => b - a)
    .slice(0, APS_SUBJECTS)
    .reduce((total, level) => total + level, 0);
}

export interface ApsEstimate {
  aps: number;
  /** True when fewer than six subjects were given and the rest were assumed to match their average. */
  isProjected: boolean;
  subjectsCounted: number;
}

/**
 * APS when six or more subjects are known; otherwise a projection that assumes the missing
 * subjects match the average CAPS level of the known ones. The UI always labels a projection.
 */
export function estimateAps(marks: readonly SubjectMark[]): ApsEstimate {
  const counted = marks.filter((mark) => normalise(mark.subject) !== EXCLUDED_FROM_APS);
  const exact = apsScore(counted);
  if (counted.length >= APS_SUBJECTS || counted.length === 0) {
    return { aps: exact, isProjected: false, subjectsCounted: counted.length };
  }
  const averageLevel = Math.round(exact / counted.length);
  return {
    aps: exact + averageLevel * (APS_SUBJECTS - counted.length),
    isProjected: true,
    subjectsCounted: counted.length,
  };
}

const KEYWORDS: Record<Interest, readonly string[]> = {
  'building things': ['build', 'construct', 'lego', 'bridge', 'design', 'engineer'],
  computers: ['computer', 'code', 'coding', 'program', 'software', 'game', 'website', 'tech'],
  'helping people': ['help', 'care', 'nurse', 'volunteer', 'community', 'clinic'],
  'numbers and money': ['money', 'business', 'account', 'budget', 'sell', 'finance', 'maths'],
  science: ['science', 'experiment', 'chemistry', 'physics', 'biology', 'lab'],
  teaching: ['teach', 'tutor', 'coach', 'mentor', 'explain'],
  'creative work': ['draw', 'art', 'music', 'design', 'photo', 'video', 'write'],
  'working with my hands': ['fix', 'repair', 'car', 'electric', 'wood', 'hands', 'garden'],
};

/** Reads interests out of a CV or "about me" text with plain keyword matching. The text is data only. */
export function interestsFromText(text: string): Interest[] {
  const lower = text.slice(0, MAX_CV_CHARS).toLowerCase();
  return INTERESTS.filter((interest) => KEYWORDS[interest].some((word) => lower.includes(word)));
}

function gapsFor(
  pathway: Pathway,
  marks: readonly SubjectMark[],
  aps: number,
): { gaps: string[]; isStretch: boolean } {
  const gaps: string[] = [];
  let isStretch = aps + STRETCH_APS >= pathway.minAps;
  if (aps < pathway.minAps) {
    gaps.push(`APS ${aps} of ${pathway.minAps} needed`);
  }
  for (const need of pathway.requires) {
    const mark = marks.find(
      (candidate) => normalise(candidate.subject) === normalise(need.subject),
    );
    const level = mark ? capsLevel(mark.percent).level : 0;
    if (level >= need.minLevel) {
      continue;
    }
    const target = minPercentForLevel(need.minLevel);
    gaps.push(
      mark
        ? `${need.subject}: ${Math.round(mark.percent)}% → ${target}%`
        : `Add your ${need.subject} mark (${target}% needed)`,
    );
    isStretch &&= mark !== undefined && need.minLevel - level <= STRETCH_LEVELS;
  }
  return { gaps, isStretch };
}

const STATUS_ORDER: Record<MatchStatus, number> = { 'within-reach': 0, stretch: 1, 'not-yet': 2 };

function statusOf(gaps: readonly string[], isStretch: boolean): MatchStatus {
  if (gaps.length === 0) {
    return 'within-reach';
  }
  return isStretch ? 'stretch' : 'not-yet';
}

/**
 * Suggests study and career pathways from a learner's marks and interests. Each pathway says
 * whether it is within reach now, a stretch (and exactly what to improve), or not yet.
 */
export function recommendPathways(
  marks: readonly SubjectMark[],
  interests: readonly Interest[],
): PathwayMatch[] {
  const { aps } = estimateAps(marks);
  return PATHWAYS.map((pathway) => {
    const { gaps, isStretch } = gapsFor(pathway, marks, aps);
    const status = statusOf(gaps, isStretch);
    const interestMatches = pathway.interests.filter((interest) =>
      interests.includes(interest),
    ).length;
    return { pathway, status, gaps, interestMatches };
  }).sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      b.interestMatches - a.interestMatches ||
      ambitionOrder(a, b),
  );
}

/** Within reach: the most ambitious first. Not there yet: the closest first. */
function ambitionOrder(a: PathwayMatch, b: PathwayMatch): number {
  const difference = a.pathway.minAps - b.pathway.minAps;
  return a.status === 'within-reach' ? -difference : difference;
}
