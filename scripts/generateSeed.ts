/**
 * Generates the synthetic seed class (Grade 10, 32 learners, two subjects) into
 * data/seed/. Deterministic: the same seed always writes the same files.
 * All people are invented and every address is on example.org.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ClassDataSchema, type ClassData } from '../src/core/domain/classData';
import { LEARNING_FORMATS } from '../src/core/domain/vocab';
import { buildResources, buildTasks, SUBJECTS, TASK_OF_TOPIC, TASK_WEEKS, taskId } from './seed/catalogue';
import { LEARNER_CASES, SUBJECT_CASES, type SubjectProfile } from './seed/profiles';

const OUT_DIR = join(process.cwd(), 'data', 'seed');
const CLASS_SIZE = 32;
const GRADE = 10;
const TERM_WEEKS = 10;
const HOMEWORK_ASSIGNED = 25;
const PRNG_SEED = 20261113;
const PRNG_MULTIPLIER = 48271;
const PRNG_MODULUS = 2147483647;
const ID_WIDTH = 3;

const FIRST_NAMES = [
  'Thabo', 'Lerato', 'Sipho', 'Naledi', 'Kagiso', 'Zanele', 'Bongani', 'Palesa',
  'Mpho', 'Ayanda', 'Tshepo', 'Nomsa', 'Lwazi', 'Refilwe', 'Sizwe', 'Thandiwe',
  'Katlego', 'Busisiwe', 'Neo', 'Lindiwe', 'Andile', 'Dineo', 'Sibusiso', 'Karabo',
  'Themba', 'Nokuthula', 'Tumelo', 'Zodwa', 'Vusi', 'Masego', 'Jabu', 'Khanyi',
];
const LAST_NAMES = [
  'Mokoena', 'Dlamini', 'Nkosi', 'Khumalo', 'Molefe', 'Zulu', 'Mahlangu', 'Sithole',
  'Ndlovu', 'Mabena', 'Tshabalala', 'Radebe', 'Maseko', 'Phiri', 'Mthembu', 'Ngcobo',
];
const HEALTHY_REFLECTIONS = [
  'School is going well this term.',
  'I like the group work.',
  'Some topics were hard at first but I practised.',
  'I am happy with my marks so far.',
  'I want to push for a distinction next term.',
];

/** Park–Miller generator: small, deterministic and free of bitwise operators. */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * PRNG_MULTIPLIER) % PRNG_MODULUS;
    return state / PRNG_MODULUS;
  };
}

const random = createRandom(PRNG_SEED);
const between = (min: number, max: number): number => Math.floor(random() * (max - min + 1)) + min;
const pick = <T>(values: readonly T[]): T => values[between(0, values.length - 1)] as T;

const healthyMarks = (): SubjectProfile => {
  const ability = between(62, 88);
  return {
    scores: Array.from({ length: TASK_OF_TOPIC.length }, () => Math.min(98, ability + between(-6, 6))),
    homeworkSubmitted: between(21, HOMEWORK_ASSIGNED),
  };
};

const healthyAbsences = (): number[] =>
  Array.from({ length: TERM_WEEKS }, () => (random() < 0.06 ? 1 : 0));

/** Mon 16 Nov 2026 → the next 14 days, weekdays only. */
const CALENDAR_START = new Date(Date.UTC(2026, 10, 16));
const CALENDAR_DAYS = 14;
const WEEKEND = new Set([0, 6]);
const SUPPORT_SLOTS = ['14:30', '15:15'];
const MS_PER_DAY = 86_400_000;

function buildCalendar(): ClassData['calendar'] {
  return Array.from(
    { length: CALENDAR_DAYS },
    (_unused, offset) => new Date(CALENDAR_START.getTime() + offset * MS_PER_DAY),
  )
    .filter((day) => !WEEKEND.has(day.getUTCDay()))
    .map((day) => ({ date: day.toISOString().slice(0, 10), freeSlots: SUPPORT_SLOTS }));
}

function addLearner(data: ClassData, number: number): void {
  const id = `L-${String(number).padStart(ID_WIDTH, '0')}`;
  const slug = id.toLowerCase().replace('-', '');
  const fixed = LEARNER_CASES[number];
  data.learners.push({
    id,
    firstName: FIRST_NAMES[number - 1] as string,
    lastName: LAST_NAMES[(number * 5) % LAST_NAMES.length] as string,
    grade: GRADE,
    learnerEmail: `${slug}@learners.example.org`,
    guardianName: `Guardian of ${id}`,
    guardianEmail: `guardian.${slug}@families.example.org`,
    preferredFormats: fixed?.preferredFormats ?? [pick(LEARNING_FORMATS)],
  });
  const absences = fixed ? fixed.absences : healthyAbsences();
  (absences ?? []).forEach((count, index) => {
    data.attendance.push({ learnerId: id, week: index + 1, absences: count });
  });
  data.reflections.push({ learnerId: id, text: fixed?.reflection ?? pick(HEALTHY_REFLECTIONS) });

  SUBJECTS.forEach((subject, subjectIndex) => {
    const marks = SUBJECT_CASES[subject.id]?.[number] ?? healthyMarks();
    subject.topics.forEach((topic, topicIndex) => {
      const taskIndex = TASK_OF_TOPIC[topicIndex] as number;
      data.results.push({
        learnerId: id,
        taskId: taskId(subjectIndex, taskIndex),
        subjectId: subject.id,
        week: TASK_WEEKS[taskIndex] as number,
        topic,
        scorePct: marks.scores[topicIndex] as number,
      });
    });
    data.homework.push({
      learnerId: id,
      subjectId: subject.id,
      assigned: HOMEWORK_ASSIGNED,
      submitted: marks.homeworkSubmitted,
    });
  });
}

function buildClass(): ClassData {
  const data: ClassData = {
    teacher: { name: 'Class teacher', email: 'teacher@school.example.org' },
    subjects: SUBJECTS,
    learners: [],
    tasks: buildTasks(),
    results: [],
    attendance: [],
    homework: [],
    reflections: [],
    resources: buildResources(),
    calendar: buildCalendar(),
  };
  for (let number = 1; number <= CLASS_SIZE; number += 1) {
    addLearner(data, number);
  }
  return ClassDataSchema.parse(data);
}

const classData = buildClass();
mkdirSync(OUT_DIR, { recursive: true });
for (const [name, rows] of Object.entries(classData)) {
  writeFileSync(join(OUT_DIR, `${name}.json`), `${JSON.stringify(rows, null, 2)}\n`);
}
process.stdout.write(
  `Seed written to data/seed: ${classData.learners.length} learners, ${classData.subjects.length} subjects, ` +
    `${classData.tasks.length} tasks, ${classData.resources.length} resources.\n`,
);
