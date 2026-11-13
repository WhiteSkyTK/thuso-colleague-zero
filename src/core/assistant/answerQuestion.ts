import { classReport, type ReportFilter } from '../analysis/classReport';
import type { ClassData } from '../domain/classData';
import { buildClassInsights } from '../insights/classInsights';
import { CATEGORIES, categoriseClass, type CategoryKey } from '../insights/learnerCategory';
import { buildLearnerProfile } from '../insights/learnerProfile';
import { InMemoryClassRepository } from '../repositories/InMemoryClassRepository';

export interface AssistantLink {
  label: string;
  href: string;
}

export interface AssistantAnswer {
  answer: string;
  links: AssistantLink[];
}

const MAX_NAMES = 8;

/** What staff questions are answered from: the classes this person may see. */
export interface StaffContext {
  classes: readonly { grade: number; data: ClassData }[];
  riskThreshold: number;
}

const FILTER_WORDS: readonly [RegExp, ReportFilter][] = [
  [/at[ -]?risk/, 'at-risk'],
  [/fail|struggl|below|behind/, 'failing'],
  [/pass|top|best|doing well/, 'passing'],
];

const CATEGORY_WORDS: readonly [RegExp, CategoryKey][] = [
  [/miss(ing)? lessons|absent|attendance/, 'missing-lessons'],
  [/homework|practice gap/, 'practice-gap'],
  [/slipping|falling|dropping/, 'slipping'],
  [/weak topic|one topic/, 'topic-gap'],
  [/thriving|excelling|strong/, 'thriving'],
];

const listNames = (names: readonly string[]) =>
  names.length > MAX_NAMES
    ? `${names.slice(0, MAX_NAMES).join(', ')} and ${names.length - MAX_NAMES} more`
    : names.join(', ');

/** "grade 11" in the question picks that class; otherwise every class in view. */
function classesAsked(question: string, context: StaffContext) {
  const grade = /grade\s*(1[0-2])/.exec(question)?.[1];
  return grade ? context.classes.filter((c) => String(c.grade) === grade) : context.classes;
}

function subjectAsked(question: string, data: ClassData) {
  return data.subjects.find((s) => {
    const name = s.name.toLowerCase();
    return (
      question.includes(name) ||
      question.includes(name.split(' ')[0] ?? name) ||
      question.includes(s.id.toLowerCase())
    );
  });
}

function answerReport(
  question: string,
  context: StaffContext,
  filter: ReportFilter,
): AssistantAnswer | undefined {
  const lines = classesAsked(question, context).flatMap(({ grade, data }) => {
    const subject =
      subjectAsked(question, data) ??
      data.subjects.find((s) => s.id === 'MATH') ??
      data.subjects[0];
    if (!subject) {
      return [];
    }
    const names = new Map(data.learners.map((l) => [l.id, `${l.firstName} ${l.lastName}`]));
    const rows = classReport(
      new InMemoryClassRepository(data).recordsFor(subject.id),
      filter,
      context.riskThreshold,
    );
    const who = rows.map((r) => `${names.get(r.learnerId) ?? r.learnerId} (${r.averagePct}%)`);
    const list = rows.length ? ' — ' + listNames(who) : '';
    return [`Grade ${grade} ${subject.name}: ${rows.length} ${filter.replace('-', ' ')}${list}.`];
  });
  return lines.length > 0
    ? { answer: lines.join('\n'), links: [{ label: 'Open my classes', href: '/portal/teacher' }] }
    : undefined;
}

function answerCategory(
  question: string,
  context: StaffContext,
  key: CategoryKey,
): AssistantAnswer {
  const category = CATEGORIES[key];
  const lines = classesAsked(question, context).map(({ grade, data }) => {
    const names = categoriseClass(data, context.riskThreshold)
      .filter((l) => l.category.key === key)
      .map((l) => l.name);
    return `Grade ${grade}: ${names.length} — ${names.length ? listNames(names) : 'nobody right now'}.`;
  });
  return {
    answer: `${category.icon} ${category.label}\n${lines.join('\n')}\nWhat helps: ${category.support}`,
    links: [{ label: 'See the class in groups', href: '/portal/teacher' }],
  };
}

function answerWeakest(question: string, context: StaffContext): AssistantAnswer {
  const lines = classesAsked(question, context).flatMap(({ grade, data }) =>
    buildClassInsights(data, context.riskThreshold)
      .subjects.filter(
        (s) => !subjectAsked(question, data) || s.subjectId === subjectAsked(question, data)?.id,
      )
      .map(
        (s) =>
          `Grade ${grade} ${s.subjectName}: ${s.weakestTopics[0]?.topic ?? '—'} (${s.weakestTopics[0]?.scorePct ?? 0}%)`,
      ),
  );
  return {
    answer: `Weakest topic, class-wide:\n${lines.slice(0, MAX_NAMES).join('\n')}`,
    links: [],
  };
}

function learnerAsked(question: string, context: StaffContext) {
  const words = new Set(question.split(/[^a-z0-9-]+/));
  for (const { grade, data } of classesAsked(question, context)) {
    const learner = data.learners.find(
      (l) => words.has(l.firstName.toLowerCase()) || words.has(l.id.toLowerCase()),
    );
    if (learner) {
      return { grade, data, learner };
    }
  }
  return undefined;
}

function answerAboutLearner(
  found: NonNullable<ReturnType<typeof learnerAsked>>,
  threshold: number,
): AssistantAnswer {
  const { grade, data, learner } = found;
  const profile = buildLearnerProfile(data, learner.id, threshold);
  const lines = (profile?.subjects ?? []).map((s) => {
    const flag = s.isAtRisk ? ' ⚑ at risk' : '';
    return `${s.subjectName}: ${s.averagePct}% (CAPS ${s.capsLevel})${flag}`;
  });
  return {
    answer: [`${learner.firstName} ${learner.lastName} · Grade ${grade}`, ...lines].join('\n'),
    links: [{ label: `Open ${learner.firstName}’s page`, href: `/portal/learners/${learner.id}` }],
  };
}

/**
 * Answers a staff member's question from the live class data. Deterministic: names, counts and
 * percentages come from code, never invented.
 */
export function answerStaff(rawQuestion: string, context: StaffContext): AssistantAnswer {
  const question = rawQuestion.toLowerCase();
  const learner = learnerAsked(question, context);
  if (learner) {
    return answerAboutLearner(learner, context.riskThreshold);
  }
  const category = CATEGORY_WORDS.find(([words]) => words.test(question))?.[1];
  if (category) {
    return answerCategory(question, context, category);
  }
  const filter = FILTER_WORDS.find(([words]) => words.test(question))?.[1];
  const report = filter ? answerReport(question, context, filter) : undefined;
  if (report) {
    return report;
  }
  if (/weak(est)? topic|reteach/.test(question)) {
    return answerWeakest(question, context);
  }
  if (/how many|number of/.test(question)) {
    const counts = classesAsked(question, context).map(
      ({ grade, data }) => `Grade ${grade}: ${data.learners.length} learners`,
    );
    return { answer: counts.join('\n'), links: [] };
  }
  if (/plan|run|help them|catch.?up/.test(question)) {
    return {
      answer:
        'Press "Run Thuso" in my bubble, or open the live run: I find who is at risk, write plans, check them and send them.',
      links: [{ label: 'Open the live run', href: '/run' }],
    };
  }
  return {
    answer:
      'Ask me things like: "who is failing maths?", "who is at risk in grade 11 science?", "who is missing lessons?", "weakest topic in life sciences?" or "how many learners in grade 12?"',
    links: [],
  };
}
