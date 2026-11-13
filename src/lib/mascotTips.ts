import type { ClassInsights } from '@/core/insights/classInsights';
import type { LearnerProfile } from '@/core/insights/learnerProfile';
import { CAUSE_LABEL, FORMAT_LABEL } from './labels';

/** What Thuso tells a learner: the one thing to fix first, how, and that help is booked. */
export function learnerTips(profile: LearnerProfile): string[] {
  const name = profile.learner.firstName;
  const atRisk = profile.subjects.filter((subject) => subject.isAtRisk);
  const tips = [`Hi ${name}! I've looked at all your marks. Let's make this week count.`];
  for (const subject of atRisk) {
    const weakest = subject.topics[0];
    const first = subject.suggestions[0];
    if (weakest) {
      tips.push(
        `${subject.subjectName}: ${weakest.topic} is your weakest topic (${weakest.scorePct}%). Start there.`,
      );
    }
    if (first) {
      tips.push(
        `I picked "${first.title}" for you — it's a ${FORMAT_LABEL[first.format].toLowerCase()}, the way you learn best.`,
      );
    }
  }
  if (atRisk.length === 0) {
    tips.push(
      "You're on track in every subject. Try the pathway finder to see where your marks can take you.",
    );
  }
  tips.push(
    'Change a mark in "Where can my marks take me?" to see which doors a better mark opens.',
  );
  return tips;
}

/** What Thuso tells a teacher about one grade: who needs them, what to reteach, how. */
export function teacherTips(insights: ClassInsights, grade: number): string[] {
  const tips: string[] = [];
  for (const subject of insights.subjects) {
    const top = subject.atRisk[0];
    const weakest = subject.weakestTopics[0];
    tips.push(
      `${subject.atRisk.length} learners in Grade ${grade} ${subject.subjectName} need you. Press "Let Thuso write the plans" and I'll do the rest.`,
    );
    if (top) {
      tips.push(
        `${top.name} is most at risk: ${CAUSE_LABEL[top.cause].toLowerCase()} — ${top.evidence}.`,
      );
    }
    if (weakest) {
      tips.push(
        `The whole class is weakest on ${weakest.topic} (${weakest.scorePct}%). Worth reteaching on Monday.`,
      );
    }
  }
  tips.push('Capture marks in the mark sheet and I re-check every learner straight away.');
  return tips;
}

/** What Thuso tells the principal across the school. */
export function principalTips(
  byGrade: readonly { grade: number; insights: ClassInsights }[],
): string[] {
  const counts = byGrade.map(({ grade, insights }) => ({
    grade,
    atRisk: new Set(insights.subjects.flatMap((s) => s.atRisk.map((l) => l.learnerId))).size,
  }));
  const total = counts.reduce((sum, entry) => sum + entry.atRisk, 0);
  const worst = [...counts].sort((a, b) => b.atRisk - a.atRisk)[0];
  const tips = [
    `Across Grades 10 to 12, ${total} learners need support right now. Each one already has a root cause.`,
  ];
  if (worst) {
    tips.push(`Grade ${worst.grade} needs the most attention: ${worst.atRisk} learners at risk.`);
  }
  tips.push(
    'Open a grade to see every subject, the topics to reteach and each learner behind the numbers.',
  );
  return tips;
}
