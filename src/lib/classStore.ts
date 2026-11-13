import { z } from 'zod';
import { loadConfig } from '@/core/config/env';
import { TaskSchema, type ClassData, type Task } from '@/core/domain/classData';
import { loadSeedClass } from '@/core/repositories/loadSeedClass';

const MAX_TASKS = 99;
const TITLE_MAX_CHARS = 120;
const MAX_TOPICS_PER_TASK = 8;

/** What the lecturer sends to add a task; the id is assigned here. */
export const NewTaskSchema = TaskSchema.omit({ id: true }).extend({
  title: z.string().trim().min(1).max(TITLE_MAX_CHARS),
  topics: z.array(z.string().min(1)).min(1).max(MAX_TOPICS_PER_TASK),
});
export type NewTask = z.infer<typeof NewTaskSchema>;

interface ClassStore {
  data: ClassData;
  /** Seed tasks plus anything the lecturer added (in memory for the hackathon — no database). */
  tasks: Task[];
  riskThreshold: number;
}

/** Kept on globalThis so the dev server's hot reload keeps added tasks. */
const holder = globalThis as typeof globalThis & { thusoClassStore?: ClassStore };

export function classStore(): ClassStore {
  if (!holder.thusoClassStore) {
    const data = loadSeedClass();
    holder.thusoClassStore = {
      data,
      tasks: [...data.tasks],
      riskThreshold: loadConfig().rules.riskThreshold,
    };
  }
  return holder.thusoClassStore;
}

export type AddTaskResult = { task: Task } | { error: string };

/** Adds a lecturer task after checking the subject and topics exist. */
export function addTask(input: NewTask): AddTaskResult {
  const store = classStore();
  const subject = store.data.subjects.find((candidate) => candidate.id === input.subjectId);
  if (!subject) {
    return { error: 'Choose one of the class subjects.' };
  }
  const unknown = input.topics.filter((topic) => !subject.topics.includes(topic));
  if (unknown.length > 0) {
    return { error: `${subject.name} has no topic called ${unknown.join(', ')}.` };
  }
  if (store.tasks.length >= MAX_TASKS) {
    return { error: 'The task list is full.' };
  }
  const task: Task = { ...input, id: `T-${String(store.tasks.length + 1).padStart(2, '0')}` };
  store.tasks.push(task);
  return { task };
}
