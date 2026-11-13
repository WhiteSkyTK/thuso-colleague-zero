import type { Resource, Subject, Task } from '../../src/core/domain/classData';

/** CAPS Grade 10 topics, in the order the term teaches them. */
export const SUBJECTS: Subject[] = [
  {
    id: 'MATH',
    name: 'Mathematics',
    grade: 10,
    topics: [
      'algebraic expressions',
      'equations and inequalities',
      'functions',
      'trigonometry',
      'euclidean geometry',
      'statistics',
      'probability',
      'finance and growth',
    ],
  },
  {
    id: 'PHSC',
    name: 'Physical Sciences',
    grade: 10,
    topics: [
      'matter and materials',
      'atomic structure',
      'chemical bonding',
      'waves and sound',
      'electricity',
      'mechanics',
      'energy',
      'chemical change',
    ],
  },
];

/** Which of a subject's five tasks tests each of its eight topics. */
export const TASK_OF_TOPIC = [0, 1, 2, 2, 3, 3, 4, 4];
export const TASK_WEEKS = [2, 4, 6, 8, 10];
const TASKS_PER_SUBJECT = TASK_WEEKS.length;
const TASK_PLAN: readonly [Task['kind'], string][] = [
  ['test', 'Baseline test'],
  ['homework', 'Assignment'],
  ['test', 'Mid-term test'],
  ['homework', 'Project'],
  ['past-paper', 'Past exam paper practice'],
];

const pad = (value: number, width: number): string => String(value).padStart(width, '0');

export const taskId = (subjectIndex: number, taskIndex: number): string =>
  `T-${pad(subjectIndex * TASKS_PER_SUBJECT + taskIndex + 1, 2)}`;

/** The tasks the lecturer set this term. */
export function buildTasks(): Task[] {
  return SUBJECTS.flatMap((subject, subjectIndex) =>
    TASK_PLAN.map(([kind, label], taskIndex) => ({
      id: taskId(subjectIndex, taskIndex),
      subjectId: subject.id,
      title: `${subject.name}: ${label}`,
      kind,
      week: TASK_WEEKS[taskIndex] as number,
      topics: subject.topics.filter((_topic, index) => TASK_OF_TOPIC[index] === taskIndex),
    })),
  );
}

type Row = [topic: string, title: string, minutes: number, format: Resource['format'], rung: Resource['rung']];

/** Deliberately nothing for statistics: the Coach must cope with a gap in the catalogue. */
const MATH_ROWS: Row[] = [
  ['algebraic expressions', 'Factorising trinomials: a comic-strip walkthrough', 20, 'visual-story', 'foundation'],
  ['algebraic expressions', 'Products and factors: worked examples', 40, 'worked-examples', 'guided'],
  ['algebraic expressions', 'Spot the pattern: difference of two squares', 25, 'patterns', 'guided'],
  ['equations and inequalities', 'Solving linear equations: audio lesson', 15, 'audio', 'foundation'],
  ['equations and inequalities', 'Quadratic equations: worked examples', 35, 'worked-examples', 'guided'],
  ['equations and inequalities', 'Past exam questions: equations and inequalities', 30, 'practice', 'exam'],
  ['functions', 'Straight-line graphs: the story of gradient', 20, 'visual-story', 'foundation'],
  ['functions', 'Sketching parabolas: worked examples', 40, 'worked-examples', 'guided'],
  ['functions', 'Past exam questions: functions', 30, 'practice', 'exam'],
  ['trigonometry', 'SOH-CAH-TOA: a memory pattern', 20, 'patterns', 'foundation'],
  ['trigonometry', 'Special angles: audio drill', 25, 'audio', 'guided'],
  ['trigonometry', 'Solving triangles: worked examples', 40, 'worked-examples', 'independent'],
  ['euclidean geometry', 'Quadrilaterals: a picture story', 20, 'visual-story', 'foundation'],
  ['euclidean geometry', 'Congruent triangles: worked examples', 40, 'worked-examples', 'guided'],
  ['euclidean geometry', 'Past exam questions: Euclidean geometry', 30, 'practice', 'exam'],
  ['probability', 'Venn diagrams: a picture story', 20, 'visual-story', 'foundation'],
  ['probability', 'Mutually exclusive events: worked examples', 35, 'worked-examples', 'guided'],
  ['finance and growth', 'Simple and compound interest: the pattern', 20, 'patterns', 'foundation'],
  ['finance and growth', 'Hire purchase and inflation: worked examples', 40, 'worked-examples', 'guided'],
  ['finance and growth', 'Past exam questions: finance and growth', 25, 'practice', 'exam'],
];

const SCIENCE_ROWS: Row[] = [
  ['matter and materials', 'States of matter: a picture story', 20, 'visual-story', 'foundation'],
  ['atomic structure', 'Building atoms: worked examples', 30, 'worked-examples', 'guided'],
  ['chemical bonding', 'Bonding: the pattern in the periodic table', 25, 'patterns', 'foundation'],
  ['waves and sound', 'Waves: audio lesson', 20, 'audio', 'foundation'],
  ['electricity', 'Circuits: a picture story', 20, 'visual-story', 'foundation'],
  ['electricity', "Ohm's law: worked examples", 35, 'worked-examples', 'guided'],
  ['electricity', 'Past exam questions: electric circuits', 30, 'practice', 'exam'],
  ['mechanics', 'Motion graphs: worked examples', 40, 'worked-examples', 'guided'],
  ['energy', 'Mechanical energy: the pattern', 25, 'patterns', 'guided'],
  ['chemical change', 'Balancing equations: worked examples', 30, 'worked-examples', 'foundation'],
];

const ID_WIDTH = 3;

export function buildResources(): Resource[] {
  const rows: [string, Row][] = [
    ...MATH_ROWS.map((row): [string, Row] => ['MATH', row]),
    ...SCIENCE_ROWS.map((row): [string, Row] => ['PHSC', row]),
  ];
  return rows.map(([subjectId, [topic, title, minutes, format, rung]], index) => ({
    id: `R-${pad(index + 1, ID_WIDTH)}`,
    subjectId,
    title,
    topic,
    minutes,
    format,
    rung,
    origin: rung === 'exam' ? 'past-paper' : 'school',
  }));
}
