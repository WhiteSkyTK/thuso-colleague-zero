import type { ClassData, Resource, Subject, Task } from '../domain/classData';
import type { LearningFormat } from '../domain/vocab';

type Grade = 10 | 11 | 12;

interface ExtraSubject {
  id: string;
  name: string;
  topics: Record<Grade, readonly string[]>;
  /** How this subject's marks sit against Mathematics, in percentage points. */
  bias: number;
}

const same = (topics: readonly string[]): Record<Grade, readonly string[]> => ({
  10: topics,
  11: topics,
  12: topics,
});

/** CAPS-aligned subjects added to every grade: eight topics each, in teaching order. */
export const EXTRA_SUBJECTS: readonly ExtraSubject[] = [
  {
    id: 'ENGL',
    name: 'English First Additional Language',
    bias: 8,
    topics: same([
      'reading comprehension',
      'summary writing',
      'language structures',
      'novel study',
      'poetry',
      'essay writing',
      'transactional writing',
      'oral presentation',
    ]),
  },
  {
    id: 'LIFE',
    name: 'Life Sciences',
    bias: 0,
    topics: {
      10: [
        'chemistry of life',
        'cells',
        'cell division',
        'plant and animal tissues',
        'support and transport in plants',
        'biosphere to ecosystems',
        'biodiversity and classification',
        'history of life on Earth',
      ],
      11: [
        'micro-organisms',
        'plant diversity',
        'animal diversity',
        'energy transformations',
        'animal nutrition',
        'gaseous exchange',
        'excretion',
        'population ecology',
      ],
      12: [
        'DNA and RNA',
        'meiosis',
        'reproduction in vertebrates',
        'genetics and inheritance',
        'human responses to the environment',
        'human endocrine system',
        'evolution',
        'human impact on the environment',
      ],
    },
  },
  {
    id: 'LIFO',
    name: 'Life Orientation',
    bias: 14,
    topics: same([
      'personal development',
      'careers and career choices',
      'study skills',
      'physical education',
      'citizenship',
      'social and environmental responsibility',
      'democracy and human rights',
      'health and wellbeing',
    ]),
  },
  {
    id: 'ACCN',
    name: 'Accounting',
    bias: -4,
    topics: {
      10: [
        'accounting concepts',
        'bookkeeping of a sole trader',
        'salaries and wages',
        'VAT',
        'final accounts',
        'analysis of financial statements',
        'budgeting',
        'internal control',
      ],
      11: [
        'partnerships',
        'fixed assets',
        'reconciliations',
        'clubs',
        'inventory valuation',
        'cost accounting',
        'budgets',
        'ethics',
      ],
      12: [
        'companies',
        'fixed assets',
        'reconciliations',
        'cash flow statements',
        'ratio analysis',
        'inventory systems',
        'cost accounting',
        'budgets',
      ],
    },
  },
];

/** Same rhythm as the core subjects: five tasks a term, eight topics. */
const TASK_OF_TOPIC = [0, 1, 2, 2, 3, 3, 4, 4] as const;
const TASK_WEEKS = [2, 4, 6, 8, 10] as const;
const TASK_PLAN: readonly [Task['kind'], string][] = [
  ['test', 'Baseline test'],
  ['homework', 'Assignment'],
  ['test', 'Mid-term test'],
  ['homework', 'Project'],
  ['past-paper', 'Past exam paper practice'],
];
const FIRST_TASK = 21;
const FIRST_RESOURCE = 200;
const RESOURCES_PER_SUBJECT = 30;
const SPREAD = 15;
const MIN_PCT = 5;
const MAX_PCT = 98;

const FORMAT_TITLE: Record<LearningFormat, string> = {
  'worked-examples': 'worked examples',
  patterns: 'spot the pattern',
  'visual-story': 'a picture story',
  audio: 'audio lesson',
  practice: 'past exam questions',
};

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const clamp = (value: number) => Math.min(MAX_PCT, Math.max(MIN_PCT, Math.round(value)));
const pad = (value: number) => String(value).padStart(2, '0');

function resourcesFor(
  subject: ExtraSubject,
  subjectIndex: number,
  topics: readonly string[],
): Resource[] {
  let next = FIRST_RESOURCE + subjectIndex * RESOURCES_PER_SUBJECT;
  const make = (
    topic: string,
    format: LearningFormat,
    level: Pick<Resource, 'rung' | 'origin'>,
  ): Resource => ({
    id: `R-${String(next++).padStart(3, '0')}`,
    subjectId: subject.id,
    title: `${capitalise(topic)}: ${FORMAT_TITLE[format]}`,
    topic,
    minutes: level.rung === 'foundation' ? 20 : 35,
    format,
    ...level,
  });
  return topics.flatMap((topic, t) => [
    make(topic, t % 2 === 0 ? 'visual-story' : 'patterns', {
      rung: 'foundation',
      origin: 'school',
    }),
    make(topic, t % 3 === 0 ? 'audio' : 'worked-examples', { rung: 'guided', origin: 'school' }),
    ...(t >= TASK_OF_TOPIC.length - 2
      ? [make(topic, 'practice', { rung: 'exam', origin: 'past-paper' })]
      : []),
  ]);
}

/**
 * Adds English FAL, Life Sciences, Life Orientation and Accounting to a grade's class. Marks follow
 * each learner's Mathematics profile with a subject bias and a small deterministic spread, so the
 * same learners slip in a believable way. Synthetic only.
 */
export function withExtraSubjects(base: ClassData, grade: Grade): ClassData {
  const mathsByLearner = Map.groupBy(
    base.results.filter((result) => result.subjectId === 'MATH'),
    (result) => result.learnerId,
  );
  const mathsHomework = new Map(
    base.homework.filter((h) => h.subjectId === 'MATH').map((h) => [h.learnerId, h]),
  );
  const subjects: Subject[] = [];
  const tasks: Task[] = [];
  const results: ClassData['results'] = [];
  const homework: ClassData['homework'] = [];
  const resources: Resource[] = [];

  EXTRA_SUBJECTS.forEach((subject, s) => {
    const topics = subject.topics[grade];
    subjects.push({ id: subject.id, name: subject.name, grade, topics: [...topics] });
    const taskIdOf = (taskIndex: number) =>
      `T-${pad(FIRST_TASK + s * TASK_PLAN.length + taskIndex)}`;
    TASK_PLAN.forEach(([kind, label], taskIndex) => {
      tasks.push({
        id: taskIdOf(taskIndex),
        subjectId: subject.id,
        title: `${subject.name}: ${label}`,
        kind,
        week: TASK_WEEKS[taskIndex] ?? 2,
        topics: topics.filter((_topic, t) => TASK_OF_TOPIC[t] === taskIndex),
      });
    });
    base.learners.forEach((learner, l) => {
      const maths = mathsByLearner.get(learner.id) ?? [];
      topics.forEach((topic, t) => {
        const anchor = maths[t]?.scorePct ?? 60;
        const offset = ((l * 7 + s * 11 + t * 3) % SPREAD) - (SPREAD - 1) / 2;
        const taskIndex = TASK_OF_TOPIC[t] ?? 0;
        results.push({
          learnerId: learner.id,
          taskId: taskIdOf(taskIndex),
          subjectId: subject.id,
          week: TASK_WEEKS[taskIndex] ?? 2,
          topic,
          scorePct: clamp(anchor + subject.bias + offset),
        });
      });
      const handedIn = mathsHomework.get(learner.id);
      const assigned = handedIn?.assigned ?? 25;
      homework.push({
        learnerId: learner.id,
        subjectId: subject.id,
        assigned,
        submitted: Math.min(assigned, Math.max(0, (handedIn?.submitted ?? 20) + ((l + s) % 5) - 2)),
      });
    });
    resources.push(...resourcesFor(subject, s, topics));
  });

  return {
    ...base,
    subjects: [...base.subjects, ...subjects],
    tasks: [...base.tasks, ...tasks],
    results: [...base.results, ...results],
    homework: [...base.homework, ...homework],
    resources: [...base.resources, ...resources],
  };
}

const HOME_LANGUAGES = ['ZUHL', 'STHL', 'TNHL', 'ENHL'] as const;
const THIRD_ELECTIVE = ['GEOG', 'INFT', 'HIST', 'BSTD'] as const;

/** A valid NSC choice of seven subjects for each learner, varied across the class. */
export function defaultSubjectChoice(learnerIndex: number): string[] {
  const home = HOME_LANGUAGES[learnerIndex % HOME_LANGUAGES.length] ?? 'ZUHL';
  return [
    home,
    home === 'ENHL' ? 'AFAL' : 'ENGL',
    'MATH',
    'LIFO',
    'PHSC',
    learnerIndex % 2 === 0 ? 'LIFE' : 'ACCN',
    THIRD_ELECTIVE[learnerIndex % THIRD_ELECTIVE.length] ?? 'GEOG',
  ];
}
