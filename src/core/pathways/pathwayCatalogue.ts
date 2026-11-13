/**
 * Study and career pathways the finder can suggest. Requirements are INDICATIVE only — they show
 * the shape of South African admission rules (an APS total plus minimum levels in key subjects);
 * a learner must always check the institution's current prospectus.
 */
export const INTERESTS = [
  'building things',
  'computers',
  'helping people',
  'numbers and money',
  'science',
  'teaching',
  'creative work',
  'working with my hands',
] as const;
export type Interest = (typeof INTERESTS)[number];

export type Route = 'degree' | 'diploma' | 'tvet';

export interface SubjectRequirement {
  readonly subject: string;
  /** CAPS level 1–7. */
  readonly minLevel: number;
}

export interface Pathway {
  readonly id: string;
  readonly title: string;
  readonly route: Route;
  readonly minAps: number;
  readonly requires: readonly SubjectRequirement[];
  readonly careers: readonly string[];
  readonly interests: readonly Interest[];
}

const MATHS = 'Mathematics';
const SCIENCE = 'Physical Sciences';

export const PATHWAYS: readonly Pathway[] = [
  {
    id: 'engineering-degree',
    title: 'Engineering degree',
    route: 'degree',
    minAps: 35,
    requires: [
      { subject: MATHS, minLevel: 6 },
      { subject: SCIENCE, minLevel: 6 },
    ],
    careers: ['Civil engineer', 'Electrical engineer', 'Mechanical engineer'],
    interests: ['building things', 'science', 'computers'],
  },
  {
    id: 'computer-science-degree',
    title: 'Computer Science degree',
    route: 'degree',
    minAps: 32,
    requires: [{ subject: MATHS, minLevel: 5 }],
    careers: ['Software developer', 'Data analyst', 'Cybersecurity analyst'],
    interests: ['computers', 'numbers and money', 'creative work'],
  },
  {
    id: 'health-sciences-degree',
    title: 'Health Sciences degree (e.g. pharmacy, physiotherapy)',
    route: 'degree',
    minAps: 33,
    requires: [
      { subject: MATHS, minLevel: 5 },
      { subject: SCIENCE, minLevel: 5 },
    ],
    careers: ['Pharmacist', 'Physiotherapist', 'Radiographer'],
    interests: ['helping people', 'science'],
  },
  {
    id: 'accounting-degree',
    title: 'Accounting / Commerce degree',
    route: 'degree',
    minAps: 30,
    requires: [{ subject: MATHS, minLevel: 4 }],
    careers: ['Chartered accountant', 'Financial analyst', 'Auditor'],
    interests: ['numbers and money'],
  },
  {
    id: 'education-degree',
    title: 'Education degree (B.Ed)',
    route: 'degree',
    minAps: 26,
    requires: [],
    careers: ['Foundation phase teacher', 'Maths or Science teacher'],
    interests: ['teaching', 'helping people'],
  },
  {
    id: 'it-diploma',
    title: 'Diploma in IT (university of technology)',
    route: 'diploma',
    minAps: 24,
    requires: [{ subject: MATHS, minLevel: 4 }],
    careers: ['Network technician', 'Junior developer', 'IT support specialist'],
    interests: ['computers', 'working with my hands'],
  },
  {
    id: 'engineering-diploma',
    title: 'Engineering technician diploma',
    route: 'diploma',
    minAps: 26,
    requires: [
      { subject: MATHS, minLevel: 4 },
      { subject: SCIENCE, minLevel: 4 },
    ],
    careers: ['Engineering technician', 'Draughtsperson', 'Quality inspector'],
    interests: ['building things', 'working with my hands', 'science'],
  },
  {
    id: 'design-diploma',
    title: 'Graphic / digital design diploma',
    route: 'diploma',
    minAps: 22,
    requires: [],
    careers: ['Graphic designer', 'UX designer', 'Animator'],
    interests: ['creative work', 'computers'],
  },
  {
    id: 'tvet-trades',
    title: 'TVET college: electrical, plumbing or motor trades (NC(V) or N-courses)',
    route: 'tvet',
    minAps: 0,
    requires: [],
    careers: ['Electrician', 'Plumber', 'Motor mechanic'],
    interests: ['working with my hands', 'building things'],
  },
  {
    id: 'tvet-office',
    title: 'TVET college: office administration or early childhood development',
    route: 'tvet',
    minAps: 0,
    requires: [],
    careers: ['Office administrator', 'ECD practitioner', 'Bookkeeper'],
    interests: ['helping people', 'teaching', 'numbers and money'],
  },
];
