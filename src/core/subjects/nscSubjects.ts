/**
 * The National Senior Certificate subject rules a Grade 10 learner chooses within (simplified
 * for the school portal): seven subjects — two official languages (one Home Language, one First
 * Additional Language, English among them), Mathematics or Mathematical Literacy, Life
 * Orientation, and three electives.
 */
export type SubjectGroup =
  'home-language' | 'additional-language' | 'maths' | 'life-orientation' | 'elective';

export interface NscSubject {
  code: string;
  name: string;
  group: SubjectGroup;
  /** Languages only: which language, so the same one is not taken at two levels. */
  language?: string;
}

export const NSC_SUBJECTS: readonly NscSubject[] = [
  { code: 'ENHL', name: 'English Home Language', group: 'home-language', language: 'English' },
  { code: 'ZUHL', name: 'isiZulu Home Language', group: 'home-language', language: 'isiZulu' },
  { code: 'STHL', name: 'Sesotho Home Language', group: 'home-language', language: 'Sesotho' },
  { code: 'TNHL', name: 'Setswana Home Language', group: 'home-language', language: 'Setswana' },
  { code: 'AFHL', name: 'Afrikaans Home Language', group: 'home-language', language: 'Afrikaans' },
  {
    code: 'ENGL',
    name: 'English First Additional Language',
    group: 'additional-language',
    language: 'English',
  },
  {
    code: 'AFAL',
    name: 'Afrikaans First Additional Language',
    group: 'additional-language',
    language: 'Afrikaans',
  },
  {
    code: 'ZUAL',
    name: 'isiZulu First Additional Language',
    group: 'additional-language',
    language: 'isiZulu',
  },
  { code: 'MATH', name: 'Mathematics', group: 'maths' },
  { code: 'MLIT', name: 'Mathematical Literacy', group: 'maths' },
  { code: 'LIFO', name: 'Life Orientation', group: 'life-orientation' },
  { code: 'PHSC', name: 'Physical Sciences', group: 'elective' },
  { code: 'LIFE', name: 'Life Sciences', group: 'elective' },
  { code: 'ACCN', name: 'Accounting', group: 'elective' },
  { code: 'BSTD', name: 'Business Studies', group: 'elective' },
  { code: 'ECON', name: 'Economics', group: 'elective' },
  { code: 'GEOG', name: 'Geography', group: 'elective' },
  { code: 'HIST', name: 'History', group: 'elective' },
  { code: 'INFT', name: 'Information Technology', group: 'elective' },
  { code: 'CATN', name: 'Computer Applications Technology', group: 'elective' },
  { code: 'EGDR', name: 'Engineering Graphics and Design', group: 'elective' },
  { code: 'TOUR', name: 'Tourism', group: 'elective' },
];

export const SUBJECTS_REQUIRED = 7;
const ELECTIVES_REQUIRED = 3;

export interface ChoiceRule {
  label: string;
  isMet: boolean;
}

const byCode = new Map(NSC_SUBJECTS.map((subject) => [subject.code, subject]));

/** Every rule, met or not, so the page can tick them off as the learner chooses. */
export function checkSubjectChoice(codes: readonly string[]): ChoiceRule[] {
  const chosen = [...new Set(codes)].flatMap((code) => {
    const subject = byCode.get(code);
    return subject ? [subject] : [];
  });
  const count = (group: SubjectGroup) => chosen.filter((s) => s.group === group).length;
  const home = chosen.find((s) => s.group === 'home-language');
  const additional = chosen.find((s) => s.group === 'additional-language');
  return [
    {
      label: `Exactly ${SUBJECTS_REQUIRED} subjects (${chosen.length} chosen)`,
      isMet: chosen.length === SUBJECTS_REQUIRED,
    },
    { label: 'One Home Language', isMet: count('home-language') === 1 },
    { label: 'One First Additional Language', isMet: count('additional-language') === 1 },
    {
      label: 'Two different languages',
      isMet: Boolean(home && additional && home.language !== additional.language),
    },
    {
      label: 'English as Home or First Additional Language',
      isMet: chosen.some((s) => s.language === 'English'),
    },
    { label: 'Mathematics or Mathematical Literacy (one of them)', isMet: count('maths') === 1 },
    { label: 'Life Orientation', isMet: count('life-orientation') === 1 },
    { label: `${ELECTIVES_REQUIRED} electives`, isMet: count('elective') === ELECTIVES_REQUIRED },
    { label: 'Only subjects from the list', isMet: chosen.length === new Set(codes).size },
  ];
}

export const isValidChoice = (codes: readonly string[]): boolean =>
  checkSubjectChoice(codes).every((rule) => rule.isMet);

export const subjectName = (code: string): string => byCode.get(code)?.name ?? code;

/** The names the pathway finder uses for its required subjects. */
export const chosenNames = (codes: readonly string[]): string[] => codes.map(subjectName);
