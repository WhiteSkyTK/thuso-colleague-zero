import type { Resource } from '../domain/classData';
import { LESSON_INDEX } from '../lessons/buildLesson';
import type { AssistantAnswer } from './answerQuestion';

/** Everyday words people use for a lesson topic. */
const SYNONYMS: Readonly<Record<string, string>> = {
  photosynthesis: 'energy transformations',
  respiration: 'energy transformations',
  algebra: 'algebraic expressions',
  factorise: 'algebraic expressions',
  interest: 'finance and growth',
  trig: 'trigonometry',
  calculus: 'differential calculus',
  derivative: 'differential calculus',
  logs: 'exponential and logarithmic functions',
  dna: 'dna and rna',
  mitosis: 'cell division',
  reflex: 'human responses to the environment',
  hormones: 'human endocrine system',
  insulin: 'human endocrine system',
  digestion: 'animal nutrition',
  kidneys: 'excretion',
  lungs: 'gaseous exchange',
  aps: 'careers and career choices',
  essay: 'essay writing',
  summary: 'summary writing',
  letter: 'transactional writing',
  comprehension: 'reading comprehension',
  'passive voice': 'language structures',
  depreciation: 'fixed assets',
  payslip: 'salaries and wages',
  uif: 'salaries and wages',
  acceleration: 'mechanics',
  momentum: 'momentum and impulse',
  moles: 'chemical change',
};

const DISPLAY_NAMES: Readonly<Record<string, string>> = {
  vat: 'VAT',
  'dna and rna': 'DNA and RNA',
  "newton's laws": 'Newton’s laws',
};

const words = (text: string) =>
  ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;
const has = (text: string, phrase: string) => text.includes(words(phrase));

/** Longest topic names first, so "finance, growth and decay" wins over "finance". */
const BY_LENGTH = [...LESSON_INDEX].sort((a, b) => b.topic.length - a.topic.length);

/** A lesson topic named in the question, by its own name or an everyday word for it. */
export function topicIn(question: string) {
  const text = words(question);
  const direct = BY_LENGTH.find((entry) => has(text, entry.topic));
  if (direct) {
    return direct;
  }
  const synonym = Object.keys(SYNONYMS).find((word) => has(text, word));
  return synonym ? BY_LENGTH.find((entry) => entry.topic === SYNONYMS[synonym]) : undefined;
}

/** "What is VAT?" → the key idea, and the lesson in this person's grade when there is one. */
export function answerTopic(
  question: string,
  classes: readonly { grade: number; resources: readonly Resource[] }[],
): AssistantAnswer | undefined {
  const hit = topicIn(question);
  if (!hit) {
    return undefined;
  }
  const found = classes.flatMap(({ grade, resources }) =>
    resources
      .filter((r) => r.subjectId === hit.subjectId && r.topic.toLowerCase() === hit.topic)
      .map((lesson) => ({ grade, lesson })),
  )[0];
  const name = DISPLAY_NAMES[hit.topic] ?? hit.topic.charAt(0).toUpperCase() + hit.topic.slice(1);
  return {
    answer: `${name} in one breath: ${hit.idea}`,
    links: found
      ? [
          {
            label: `▶ Full lesson: ${found.lesson.title}`,
            href: `/portal/lesson/${found.lesson.id}?grade=${found.grade}`,
          },
        ]
      : [{ label: 'Find it in your lessons', href: '/portal/learner' }],
  };
}

/** Greetings, thanks and "who are you?" — people always have something to say. */
export function answerSmallTalk(
  question: string,
  role: 'learner' | 'staff',
): AssistantAnswer | undefined {
  const text = words(question);
  const tryThis =
    role === 'learner'
      ? '“explain VAT”, “plan my week” or “how am I doing?”'
      : '“who is failing maths?”, “how is Masego doing?” or “explain photosynthesis”';
  if (
    /^ (hi|hello|hey|hallo|sawubona|dumela|molo|howzit|good (morning|afternoon|evening)) /.test(
      text,
    )
  ) {
    return { answer: `Hi! I’m Thuso 👋 Try ${tryThis}.`, links: [] };
  }
  if (/ (thanks|thank you|dankie|ngiyabonga|enkosi|ke a leboha|siyabonga) /.test(text)) {
    return { answer: 'Any time 💜 I’m here whenever you need me.', links: [] };
  }
  if (/ (who are you|what are you|what can you do|how do you work) /.test(text)) {
    return {
      answer: `I’m Thuso — “help” in Sesotho and Setswana. A team of agents that watches every learner, works out why someone is slipping and helps them catch up. Try ${tryThis}.`,
      links: [{ label: 'Watch the agents work', href: '/run' }],
    };
  }
  return undefined;
}

/** A learner says how they feel: answer kindly, and offer something to do about it. */
export function answerFeeling(question: string): AssistantAnswer | undefined {
  const text = words(question);
  if (
    !/ (stress|stressed|anxious|scared|worried|lost|confused|stuck|tired|sad|overwhelmed|give up|can t do|cant do|hate) /.test(
      text,
    )
  ) {
    return undefined;
  }
  return {
    answer:
      'That sounds hard, and you’re not alone 💜 Let’s make it smaller: one short lesson today, and a plan that fits the time you have. If it’s more than schoolwork, talk to a teacher or counsellor you trust.',
    links: [
      { label: '🤝 Plan my week', href: '/portal/learner#study-team' },
      { label: 'My page', href: '/portal/learner' },
    ],
  };
}
