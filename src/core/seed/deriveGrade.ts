import type { ClassData } from '../domain/classData';
import type { LearningFormat } from '../domain/vocab';

/** CAPS Grade 11 and 12 topics, eight per subject, in teaching order. */
const GRADE_TOPICS: Record<11 | 12, Record<string, readonly string[]>> = {
  11: {
    MATH: [
      'exponents and surds',
      'equations and inequalities',
      'number patterns',
      'analytical geometry',
      'functions',
      'trigonometry',
      'euclidean geometry',
      'finance, growth and decay',
    ],
    PHSC: [
      'vectors in two dimensions',
      "Newton's laws",
      'atomic combinations',
      'intermolecular forces',
      'geometrical optics',
      'electrostatics',
      'electric circuits',
      'stoichiometry',
    ],
  },
  12: {
    MATH: [
      'sequences and series',
      'functions and inverses',
      'exponential and logarithmic functions',
      'finance, growth and decay',
      'trigonometry',
      'polynomials',
      'differential calculus',
      'probability',
    ],
    PHSC: [
      'momentum and impulse',
      'vertical projectile motion',
      'organic chemistry',
      'work, energy and power',
      'rates of reaction',
      'chemical equilibrium',
      'acids and bases',
      'electrochemistry',
    ],
  },
};

const FORMAT_TITLE: Record<LearningFormat, string> = {
  'worked-examples': 'worked examples',
  patterns: 'spot the pattern',
  'visual-story': 'a picture story',
  audio: 'audio lesson',
  practice: 'past exam questions',
};

const ID_PREFIX = { 11: '1', 12: '2' } as const;
const NAME_SHIFT = { 11: 11, 12: 23 } as const;
const SCORE_SPREAD = 11;
const SCORE_CENTRE = 5;

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const clampPct = (value: number) => Math.min(100, Math.max(0, value));

/**
 * Builds a Grade 11 or 12 class from the Grade 10 seed: the same shapes of difficulty (absences,
 * missing homework, falling marks, a weak topic, an injection attempt), new people and that
 * grade's CAPS topics. Deterministic, synthetic and on example.org.
 */
export function deriveGrade(base: ClassData, grade: 11 | 12): ClassData {
  const learnerId = (id: string) => `L-${ID_PREFIX[grade]}${id.slice(3)}`;
  const topicMap = new Map(
    base.subjects.flatMap((subject) =>
      subject.topics.map((topic, index) => [
        `${subject.id}|${topic}`,
        GRADE_TOPICS[grade][subject.id]?.[index] ?? topic,
      ]),
    ),
  );
  const topicOf = (subjectId: string, topic: string) =>
    topicMap.get(`${subjectId}|${topic}`) ?? topic;
  const firstNames = base.learners.map((learner) => learner.firstName);
  const lastNames = [...new Set(base.learners.map((learner) => learner.lastName))];
  const shiftOf = (index: number) => ((index * 7) % SCORE_SPREAD) - SCORE_CENTRE;
  const indexOf = new Map(base.learners.map((learner, index) => [learner.id, index]));

  return {
    ...base,
    subjects: base.subjects.map((subject) => ({
      ...subject,
      grade,
      topics: subject.topics.map((topic) => topicOf(subject.id, topic)),
    })),
    learners: base.learners.map((learner, index) => {
      const id = learnerId(learner.id);
      const slug = id.toLowerCase().replace('-', '');
      return {
        ...learner,
        id,
        grade,
        firstName: firstNames[(index + NAME_SHIFT[grade]) % firstNames.length] ?? learner.firstName,
        lastName: lastNames[(index + NAME_SHIFT[grade]) % lastNames.length] ?? learner.lastName,
        learnerEmail: `${slug}@learners.example.org`,
        guardianName: `Guardian of ${id}`,
        guardianEmail: `guardian.${slug}@families.example.org`,
      };
    }),
    tasks: base.tasks.map((task) => ({
      ...task,
      topics: task.topics.map((topic) => topicOf(task.subjectId, topic)),
    })),
    results: base.results.map((result) => ({
      ...result,
      learnerId: learnerId(result.learnerId),
      topic: topicOf(result.subjectId, result.topic),
      scorePct: clampPct(result.scorePct + shiftOf(indexOf.get(result.learnerId) ?? 0)),
    })),
    attendance: base.attendance.map((week) => ({ ...week, learnerId: learnerId(week.learnerId) })),
    homework: base.homework.map((record) => ({
      ...record,
      learnerId: learnerId(record.learnerId),
    })),
    reflections: base.reflections.map((entry) => ({
      ...entry,
      learnerId: learnerId(entry.learnerId),
    })),
    resources: base.resources.map((resource) => {
      const topic = topicOf(resource.subjectId, resource.topic);
      return {
        ...resource,
        topic,
        title: `${capitalise(topic)}: ${FORMAT_TITLE[resource.format]}`,
      };
    }),
  };
}
