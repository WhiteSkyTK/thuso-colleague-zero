import type { Resource } from '../domain/classData';
import type { LearningFormat } from '../domain/vocab';
import { ACCOUNTING_LESSONS } from './accountingLessons';
import { ACCOUNTING_SENIOR_LESSONS } from './accountingSeniorLessons';
import { LIFE_SENIOR_LESSONS } from './lifeSeniorLessons';
import { LO_LESSONS } from './loLessons';
import { ENGLISH_LESSONS } from './englishLessons';
import { LIFE_LESSONS } from './lifeLessons';
import { MATHS_LESSONS } from './mathsLessons';
import { hasMaker, makerKey } from './questionMakers';
import { SCIENCE_LESSONS } from './scienceLessons';
import type { Diagram, GossipLine, TopicLesson } from './TopicLesson';

export type LessonBlock =
  | { kind: 'idea'; text: string }
  | { kind: 'steps'; question: string; steps: readonly string[]; answer: string }
  | { kind: 'story'; panels: readonly { icon: string; caption: string }[] }
  | { kind: 'pattern'; rows: readonly (readonly [string, string])[]; rule: string }
  | { kind: 'listen'; script: string }
  | { kind: 'gossip'; lines: readonly GossipLine[] }
  | { kind: 'realWorld'; question: string; answer: string }
  | { kind: 'diagram'; diagram: Diagram }
  | { kind: 'maker'; key: string }
  | { kind: 'mistake'; text: string }
  | { kind: 'questions'; items: readonly { question: string; answer: string }[] };

type BlockKind = LessonBlock['kind'];

export interface Lesson {
  title: string;
  subjectName: string;
  topic: string;
  format: LearningFormat;
  minutes: number;
  /** False when Thuso has no topic notes yet and teaches a study method instead. */
  hasTopicNotes: boolean;
  /** Said out loud and copied into the learner's notes. */
  summary: string;
  blocks: LessonBlock[];
}

/** The same lesson, ordered for the way the learner learns best. */
const ORDER: Record<LearningFormat, readonly BlockKind[]> = {
  'worked-examples': ['idea', 'steps', 'gossip', 'realWorld', 'mistake', 'maker', 'questions'],
  patterns: ['pattern', 'diagram', 'idea', 'gossip', 'steps', 'maker', 'questions'],
  'visual-story': ['diagram', 'story', 'gossip', 'realWorld', 'questions'],
  audio: ['listen', 'gossip', 'realWorld', 'questions'],
  practice: ['maker', 'questions', 'gossip', 'realWorld', 'steps', 'mistake'],
};

const LIBRARY: Readonly<Record<string, Readonly<Record<string, TopicLesson>>>> = {
  MATH: MATHS_LESSONS,
  PHSC: SCIENCE_LESSONS,
  ACCN: { ...ACCOUNTING_LESSONS, ...ACCOUNTING_SENIOR_LESSONS },
  LIFE: { ...LIFE_LESSONS, ...LIFE_SENIOR_LESSONS },
  ENGL: ENGLISH_LESSONS,
  LIFO: LO_LESSONS,
};

/** Grade 11–12 topics that build on a Grade 10 lesson Thuso already has. */
const SAME_AS: Readonly<Record<string, string>> = {
  'MATH:finance, growth and decay': 'finance and growth',
  'PHSC:electric circuits': 'electricity',
  'PHSC:work, energy and power': 'energy',
  'PHSC:stoichiometry': 'chemical change',
  'PHSC:atomic combinations': 'chemical bonding',
};

/** The library key for a topic: its own name, or the lesson it builds on. */
export function lessonTopic(subjectId: string, topic: string): string {
  const name = topic.toLowerCase();
  return SAME_AS[`${subjectId}:${name}`] ?? name;
}

const STEP_ICONS = ['①', '②', '③', '④', '⑤'];

/** No notes for this topic yet: a study method that works for any topic. */
function studyMethod(topic: string): TopicLesson {
  return {
    idea: `Learn ${topic} in three moves: the key words, one worked example, then one exam question.`,
    example: {
      question: `Make a one-page summary of ${topic}`,
      steps: [
        'Write the five key words of the topic and what each one means',
        'Copy one worked example from your textbook and say each step out loud',
        'Try one past-paper question, then mark it with the memo',
      ],
      answer: 'One page you can revise from in five minutes',
    },
    pattern: {
      rows: [
        ['Day 1', 'key words'],
        ['Day 2', 'a worked example'],
        ['Day 3', 'a past-paper question'],
        ['Day 4', 'teach it to a friend'],
      ],
      rule: 'Small daily steps beat one long night before the test.',
    },
    realWorld: {
      question: `Where do you see ${topic} outside school — at home, in a shop, in a taxi or on the news?`,
      answer: 'Write your example in your notes: linking a topic to real life makes it stick.',
    },
    mistake: 'Reading your notes again and again without testing yourself.',
    checks: [
      {
        question: `Explain ${topic} in two sentences without looking`,
        answer: 'Check against your notes: whatever you missed is what to study next.',
      },
      {
        question: 'Find one past-paper question on this topic',
        answer: 'Open Practice papers and pick this subject.',
      },
    ],
  };
}

/** The topic told like gossip; topics without their own chat get one from the notes. */
function gossipAbout(topic: string, notes: TopicLesson): readonly GossipLine[] {
  if (notes.gossip) {
    return notes.gossip;
  }
  return [
    ['t', `Psst… did you hear what happened in ${topic}? 👀`],
    ['y', 'No! Tell me'],
    ['t', `Okay so here’s the tea ☕ ${notes.idea}`],
    ['y', 'And what goes wrong?'],
    ['t', `Half the class got caught out: “${notes.mistake}” Don’t be that person.`],
    ['t', `And it’s not just for tests: ${notes.realWorld.question}`],
  ];
}

function storyOf({ example }: TopicLesson): LessonBlock {
  return {
    kind: 'story',
    panels: [
      { icon: '❓', caption: example.question },
      ...example.steps.map((caption, at) => ({ icon: STEP_ICONS[at] ?? '•', caption })),
      { icon: '🎯', caption: example.answer },
    ],
  };
}

function listenScript(notes: TopicLesson): string {
  const { example } = notes;
  return [
    notes.idea,
    `Here is an example. ${example.question}.`,
    ...example.steps,
    `The answer is ${example.answer}.`,
    `In real life: ${notes.realWorld.question} ${notes.realWorld.answer}.`,
    `Watch out: ${notes.mistake}`,
  ].join(' ');
}

interface BlockSource {
  topic: string;
  notes: TopicLesson;
  key: string;
}

function blockOf(kind: BlockKind, { topic, notes, key }: BlockSource): LessonBlock[] {
  switch (kind) {
    case 'idea':
      return [{ kind, text: notes.idea }];
    case 'steps':
      return [{ kind, ...notes.example }];
    case 'story':
      return [storyOf(notes)];
    case 'pattern':
      return [{ kind, ...notes.pattern }];
    case 'listen':
      return [{ kind, script: listenScript(notes) }];
    case 'gossip':
      return [{ kind, lines: gossipAbout(topic, notes) }];
    case 'realWorld':
      return [{ kind, ...notes.realWorld }];
    case 'diagram':
      return notes.diagram ? [{ kind, diagram: notes.diagram }] : [];
    case 'maker':
      return hasMaker(key) ? [{ kind, key }] : [];
    case 'mistake':
      return [{ kind, text: notes.mistake }];
    case 'questions':
      return [{ kind, items: notes.checks }];
  }
}

/** Builds a lesson for a resource in the chosen format, from Thuso's topic notes. */
export function buildLesson(
  resource: Resource,
  subjectName: string,
  format: LearningFormat,
): Lesson {
  const topic = lessonTopic(resource.subjectId, resource.topic);
  const found = LIBRARY[resource.subjectId]?.[topic];
  const notes = found ?? studyMethod(resource.topic);
  const source = { topic: resource.topic, notes, key: makerKey(resource.subjectId, topic) };
  return {
    title: resource.title,
    subjectName,
    topic: resource.topic,
    format,
    minutes: resource.minutes,
    hasTopicNotes: Boolean(found),
    summary: `${notes.idea} Example: ${notes.example.question} — ${notes.example.answer}. Watch out: ${notes.mistake}`,
    blocks: ORDER[format].flatMap((kind) => blockOf(kind, source)),
  };
}
