import type { LearningFormat } from '../domain/vocab';

export interface CheckIn {
  id: string;
  question: string;
  options: readonly { value: string; label: string }[];
}

const FORMAT_OPTIONS: readonly { value: LearningFormat; label: string }[] = [
  { value: 'visual-story', label: '▣ A picture story' },
  { value: 'worked-examples', label: '✎ Worked examples' },
  { value: 'patterns', label: '◇ Spotting the pattern' },
  { value: 'audio', label: '♪ Listening to it' },
  { value: 'practice', label: '✓ Exam questions' },
];

/** Short questions Thuso asks a learner, one a day, to learn how they learn. */
export const CHECK_INS: readonly CheckIn[] = [
  {
    id: 'format',
    question: 'Quick one: what helps you understand a new topic best?',
    options: FORMAT_OPTIONS,
  },
  {
    id: 'feeling',
    question: 'How do you feel about your weakest subject this week?',
    options: [
      { value: 'confident', label: '😊 Getting there' },
      { value: 'okay', label: '😐 Okay' },
      { value: 'lost', label: '😟 Lost' },
    ],
  },
  {
    id: 'minutes',
    question: 'How much time can you study on a school day?',
    options: [
      { value: '15', label: '⏱ 15 min' },
      { value: '30', label: '⏱ 30 min' },
      { value: '60', label: '⏱ An hour' },
    ],
  },
  {
    id: 'time',
    question: 'When do you like to study?',
    options: [
      { value: 'morning', label: '🌅 Mornings' },
      { value: 'afternoon', label: '☀ Afternoons' },
      { value: 'evening', label: '🌙 Evenings' },
    ],
  },
];

const MS_PER_DAY = 86_400_000;

/** One question a day, in turn. */
export const checkInFor = (now: Date): CheckIn =>
  CHECK_INS[Math.floor(now.getTime() / MS_PER_DAY) % CHECK_INS.length] ?? CHECK_INS[0]!;

/** A format answer moves that format to the front; the learner keeps at most two. */
export function updatedFormats(
  current: readonly LearningFormat[],
  chosen: LearningFormat,
): LearningFormat[] {
  return [chosen, ...current.filter((format) => format !== chosen)].slice(0, 2);
}

export const isFormat = (value: string): value is LearningFormat =>
  FORMAT_OPTIONS.some((option) => option.value === value);
