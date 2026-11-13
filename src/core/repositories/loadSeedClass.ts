import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ClassDataSchema, type ClassData } from '../domain/classData';
import { ConfigError } from '../errors/AppError';

const FILES = [
  'teacher',
  'subjects',
  'learners',
  'tasks',
  'results',
  'attendance',
  'homework',
  'reflections',
  'resources',
  'calendar',
] as const;

/** Reads and validates the class JSON files (written by `npm run seed`). */
export function loadSeedClass(dir: string = join(process.cwd(), 'data', 'seed')): ClassData {
  let raw: Record<string, unknown>;
  try {
    raw = Object.fromEntries(
      FILES.map((name) => [name, JSON.parse(readFileSync(join(dir, `${name}.json`), 'utf8'))]),
    );
  } catch (error) {
    throw new ConfigError(`Could not read the class data in ${dir}. Run "npm run seed".`, {
      cause: error,
    });
  }
  const parsed = ClassDataSchema.safeParse(raw);
  if (!parsed.success) {
    const where = parsed.error.issues[0]?.path.join('.') ?? 'unknown field';
    throw new ConfigError(`The class data in ${dir} is invalid at ${where}. Run "npm run seed".`);
  }
  return parsed.data;
}
