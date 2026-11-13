import { z } from 'zod';
import { LearnerIdSchema } from './diagnosis';

/** Grade 10 Mathematics topics (CAPS), in the order the term teaches them. */
export const TOPICS = [
  'algebraic expressions',
  'equations and inequalities',
  'functions',
  'trigonometry',
  'euclidean geometry',
  'statistics',
  'probability',
  'finance and growth',
] as const;
export const TopicSchema = z.enum(TOPICS);
export type Topic = z.infer<typeof TopicSchema>;

/** Synthetic only — every address is on example.org (POPIA: no real learner data). */
export const LearnerSchema = z.object({
  id: LearnerIdSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  grade: z.number().int(),
  subject: z.string().min(1),
  learnerEmail: z.string().email(),
  guardianName: z.string().min(1),
  guardianEmail: z.string().email(),
});
export type Learner = z.infer<typeof LearnerSchema>;

/** One topic mark from one assessment. */
export const AssessmentResultSchema = z.object({
  learnerId: LearnerIdSchema,
  assessmentId: z.string().min(1),
  week: z.number().int().positive(),
  topic: TopicSchema,
  scorePct: z.number().min(0).max(100),
});
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;

export const AttendanceWeekSchema = z.object({
  learnerId: LearnerIdSchema,
  week: z.number().int().positive(),
  absences: z.number().int().min(0).max(5),
});
export type AttendanceWeek = z.infer<typeof AttendanceWeekSchema>;

export const HomeworkRecordSchema = z.object({
  learnerId: LearnerIdSchema,
  assigned: z.number().int().positive(),
  submitted: z.number().int().nonnegative(),
});
export type HomeworkRecord = z.infer<typeof HomeworkRecordSchema>;

/** Free text written by a learner — data, never instructions. */
export const ReflectionSchema = z.object({
  learnerId: LearnerIdSchema,
  text: z.string(),
});
export type Reflection = z.infer<typeof ReflectionSchema>;

export const ResourceSchema = z.object({
  id: z.string().regex(/^R-\d{3}$/),
  title: z.string().min(1),
  topic: TopicSchema,
  minutes: z.number().int().positive(),
  kind: z.enum(['video', 'worksheet', 'practice']),
});
export type Resource = z.infer<typeof ResourceSchema>;

export const SchoolDaySchema = z.object({
  /** ISO date, YYYY-MM-DD. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Support-session start times still free that day, HH:MM. */
  freeSlots: z.array(z.string().regex(/^\d{2}:\d{2}$/)),
});
export type SchoolDay = z.infer<typeof SchoolDaySchema>;

/** Everything the colleague knows about one class. */
export const ClassDataSchema = z.object({
  learners: z.array(LearnerSchema),
  assessments: z.array(AssessmentResultSchema),
  attendance: z.array(AttendanceWeekSchema),
  homework: z.array(HomeworkRecordSchema),
  reflections: z.array(ReflectionSchema),
  resources: z.array(ResourceSchema),
  calendar: z.array(SchoolDaySchema),
});
export type ClassData = z.infer<typeof ClassDataSchema>;
