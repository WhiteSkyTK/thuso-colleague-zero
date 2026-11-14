import type { LearnerProfile } from '../insights/learnerProfile';
import type { AssistantAnswer } from './answerQuestion';

/** What a learner's questions are answered from: their own picture only. */
export interface LearnerContext {
  profile: LearnerProfile;
  chosenSubjects: readonly string[];
  nextSession?: string;
}

/** Answers a learner's question about their own learning. */
export function answerLearner(rawQuestion: string, context: LearnerContext): AssistantAnswer {
  const question = rawQuestion.toLowerCase();
  const { profile } = context;
  const subjects = [...profile.subjects].sort((a, b) => a.averagePct - b.averagePct);
  if (/study|learn|next|help|practi[cs]e/.test(question)) {
    const subject = subjects[0];
    const resource = subject?.suggestions[0];
    return {
      answer: resource
        ? `Start with ${subject.subjectName}: "${resource.title}" (${resource.minutes} min). It's in the way you learn best. Then try a practice paper.`
        : 'You are on track — try a practice paper to keep sharp.',
      links: [
        { label: 'My page', href: '/portal/learner' },
        { label: 'Practice papers', href: '/portal/practice' },
        { label: 'Plan my week', href: '/portal/learner#study-team' },
      ],
    };
  }
  if (/mark|doing|result|average|score/.test(question)) {
    return {
      answer: subjects
        .map((s) => `${s.subjectName}: ${s.averagePct}% (CAPS ${s.capsLevel})`)
        .join('\n'),
      links: [{ label: 'My page', href: '/portal/learner' }],
    };
  }
  if (/weak|worst|struggl/.test(question)) {
    const weakest = subjects[0];
    return {
      answer: weakest
        ? `${weakest.subjectName} needs the most work, especially ${weakest.topics[0]?.topic ?? 'its first topics'} (${weakest.topics[0]?.scorePct ?? weakest.averagePct}%).`
        : 'Nothing stands out — well done.',
      links: [],
    };
  }
  if (/session|calendar|when|book/.test(question)) {
    return {
      answer: context.nextSession
        ? `Your support session: ${context.nextSession}.`
        : 'No session booked yet.',
      links: [{ label: 'My calendar', href: '/portal/calendar' }],
    };
  }
  if (/subject/.test(question)) {
    return {
      answer: context.chosenSubjects.length
        ? `Your subjects: ${context.chosenSubjects.join(', ')}.`
        : 'Choose your seven subjects first.',
      links: [{ label: 'My subjects', href: '/portal/subjects' }],
    };
  }
  if (/career|job|university|varsity|college|future/.test(question)) {
    return {
      answer:
        'Open "Where can my marks take me?" on your page — change a mark to see which doors it opens.',
      links: [{ label: 'My page', href: '/portal/learner' }],
    };
  }
  return {
    answer:
      'Ask me: "what should I study?", "how am I doing?", "what is my weakest subject?", "when is my session?" or "what can I study after school?"',
    links: [],
  };
}
