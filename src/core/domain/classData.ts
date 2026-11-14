import { z } from 'zod';
import { LEARNING_FORMATS, LearnerIdSchema, LearningFormatSchema, RungSchema } from './vocab';

const SubjectId = z.string().regex(/^[A-Z]{3,6}$/);
const Week = z.number().int().positive();

/** A subject is data, not code: adding one means adding rows, never changing the engine. */
export const SubjectSchema = z.object({
  id: SubjectId,
  name: z.string().min(1),
  grade: z.number().int(),
  topics: z.array(z.string().min(1)).min(1),
});
export type Subject = z.infer<typeof SubjectSchema>;

/** Synthetic only — every address is on example.org (POPIA: no real learner data). */
export const LearnerSchema = z.object({
  id: LearnerIdSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  grade: z.number().int(),
  learnerEmail: z.email(),
  guardianName: z.string().min(1),
  guardianEmail: z.email(),
  /** How the learner likes to learn — any of the formats, in the order Thuso has learned works best. */
  preferredFormats: z.array(LearningFormatSchema).min(1).max(LEARNING_FORMATS.length),
});
export type Learner = z.infer<typeof LearnerSchema>;

/** Work the lecturer sets: a test, homework or past-paper practice. Marks come back as results. */
export const TaskSchema = z.object({
  id: z.string().regex(/^T-\d{2}$/),
  subjectId: SubjectId,
  title: z.string().min(1),
  kind: z.enum(['test', 'homework', 'past-paper']),
  week: Week,
  topics: z.array(z.string().min(1)).min(1),
});
export type Task = z.infer<typeof TaskSchema>;

/** One topic mark a learner earned on one task. */
export const TaskResultSchema = z.object({
  learnerId: LearnerIdSchema,
  taskId: z.string().min(1),
  subjectId: SubjectId,
  week: Week,
  topic: z.string().min(1),
  scorePct: z.number().min(0).max(100),
});
export type TaskResult = z.infer<typeof TaskResultSchema>;

export const AttendanceWeekSchema = z.object({
  learnerId: LearnerIdSchema,
  week: Week,
  absences: z.number().int().min(0).max(5),
});
export type AttendanceWeek = z.infer<typeof AttendanceWeekSchema>;

export const HomeworkRecordSchema = z.object({
  learnerId: LearnerIdSchema,
  subjectId: SubjectId,
  assigned: z.number().int().positive(),
  submitted: z.number().int().nonnegative(),
});
export type HomeworkRecord = z.infer<typeof HomeworkRecordSchema>;

/** Free text written by a learner — data, never instructions. */
export const ReflectionSchema = z.object({ learnerId: LearnerIdSchema, text: z.string() });
export type Reflection = z.infer<typeof ReflectionSchema>;

export const ResourceSchema = z.object({
  id: z.string().regex(/^R-\d{3}$/),
  subjectId: SubjectId,
  title: z.string().min(1),
  topic: z.string().min(1),
  minutes: z.number().int().positive(),
  format: LearningFormatSchema,
  rung: RungSchema,
  /** `past-paper`: exam questions from previous years. */
  origin: z.enum(['school', 'past-paper']),
});
export type Resource = z.infer<typeof ResourceSchema>;

export const SchoolDaySchema = z.object({
  /** ISO date, YYYY-MM-DD. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Support-session start times still free that day, HH:MM. */
  freeSlots: z.array(z.string().regex(/^\d{2}:\d{2}$/)),
});
export type SchoolDay = z.infer<typeof SchoolDaySchema>;

export const TeacherSchema = z.object({ name: z.string().min(1), email: z.email() });
export type Teacher = z.infer<typeof TeacherSchema>;

/** Everything the colleague knows about one class. */
export const ClassDataSchema = z.object({
  teacher: TeacherSchema,
  subjects: z.array(SubjectSchema).min(1),
  learners: z.array(LearnerSchema),
  tasks: z.array(TaskSchema),
  results: z.array(TaskResultSchema),
  attendance: z.array(AttendanceWeekSchema),
  homework: z.array(HomeworkRecordSchema),
  reflections: z.array(ReflectionSchema),
  resources: z.array(ResourceSchema),
  calendar: z.array(SchoolDaySchema),
});
export type ClassData = z.infer<typeof ClassDataSchema>;
