import type { LearningFormat, RiskCause } from '@/core/domain/vocab';

/** Short labels for the lecturer. */
export const CAUSE_LABEL: Record<RiskCause, string> = {
  attendance: 'Attendance',
  homework: 'Homework not done',
  'assessment-trend': 'Marks falling',
  'topic-gap': 'One weak topic',
};

/** The same causes, said to the learner. */
export const CAUSE_FOR_LEARNER: Record<RiskCause, string> = {
  attendance: 'You have missed a lot of lessons. Catching up on those comes first.',
  homework: 'Homework is not getting done. Short daily tasks will help most.',
  'assessment-trend': 'Your marks have started dropping. Let’s fix it early, before the exams.',
  'topic-gap': 'One topic is holding you back. We will build it up step by step.',
};

export const FORMAT_LABEL: Record<LearningFormat, string> = {
  'worked-examples': 'Worked examples',
  patterns: 'Patterns',
  'visual-story': 'Visual story',
  audio: 'Audio',
  practice: 'Exam practice',
};

export const FORMAT_ICON: Record<LearningFormat, string> = {
  'worked-examples': '✎',
  patterns: '◇',
  'visual-story': '▣',
  audio: '♪',
  practice: '✓',
};

/** Department of Basic Education: official NSC past papers and memos. */
export const DBE_PAST_PAPERS_URL =
  'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx';
