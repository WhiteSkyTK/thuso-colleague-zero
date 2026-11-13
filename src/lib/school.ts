import { hashPassword } from '@/core/auth/passwords';
import { loadConfig, type AppConfig } from '@/core/config/env';
import type { Database } from '@/core/db/Database';
import { NeonDatabase } from '@/core/db/NeonDatabase';
import { PgliteDatabase } from '@/core/db/PgliteDatabase';
import { migrate } from '@/core/db/schema';
import type { MailTransport } from '@/core/delivery/MailTransport';
import { SmtpTransport } from '@/core/delivery/SmtpTransport';
import type { ClassData } from '@/core/domain/classData';
import { loadSeedClass } from '@/core/repositories/loadSeedClass';
import { MessageRepository } from '@/core/school/MessageRepository';
import { NotificationRepository } from '@/core/school/NotificationRepository';
import { RunRepository } from '@/core/school/RunRepository';
import { SchoolDataRepository } from '@/core/school/SchoolDataRepository';
import { UserRepository } from '@/core/school/UserRepository';
import { isSeeded, seedSchool } from '@/core/seed/seedSchool';

export interface School {
  db: Database;
  data: SchoolDataRepository;
  users: UserRepository;
  messages: MessageRepository;
  runs: RunRepository;
  notifications: NotificationRepository;
  riskThreshold: number;
  delivery: AppConfig['delivery'];
  /** Only when SMTP is configured. */
  transport?: MailTransport;
}

/** A grade's class is read from the database at most once a minute, and again after any write. */
const CLASS_CACHE_MS = 60_000;

const holder = globalThis as typeof globalThis & {
  thusoSchool?: Promise<School>;
  thusoClassCache?: Map<number, { at: number; data: Promise<ClassData> }>;
};

async function open(): Promise<School> {
  const config = loadConfig();
  const { databaseUrl, demoPassword, adminPassword } = config.school;
  const db = databaseUrl ? new NeonDatabase(databaseUrl) : await PgliteDatabase.create();
  await migrate(db);
  if (!(await isSeeded(db))) {
    await seedSchool(db, {
      grade10: loadSeedClass(),
      demoPasswordHash: await hashPassword(demoPassword),
      adminPasswordHash: adminPassword ? await hashPassword(adminPassword) : undefined,
    });
  }
  return {
    db,
    data: new SchoolDataRepository(db),
    users: new UserRepository(db),
    messages: new MessageRepository(db),
    runs: new RunRepository(db),
    notifications: new NotificationRepository(db),
    riskThreshold: config.rules.riskThreshold,
    delivery: config.delivery,
    transport: config.delivery.smtp ? new SmtpTransport(config.delivery.smtp) : undefined,
  };
}

/** One connection per server process, migrated and (when empty) seeded on first use. */
export function school(): Promise<School> {
  holder.thusoSchool ??= open().catch((error: unknown) => {
    holder.thusoSchool = undefined;
    throw error;
  });
  return holder.thusoSchool;
}

/** The class for one grade, shared by every page and agent run until it is a minute old. */
export async function classFor(grade: number): Promise<ClassData> {
  const cache = (holder.thusoClassCache ??= new Map());
  const cached = cache.get(grade);
  if (cached && Date.now() - cached.at < CLASS_CACHE_MS) {
    return cached.data;
  }
  const { data } = await school();
  const loading = data.loadClass(grade);
  cache.set(grade, { at: Date.now(), data: loading });
  loading.catch(() => cache.delete(grade));
  return loading;
}

/** Call after any write so the next read sees it. */
export function forgetClass(grade: number): void {
  holder.thusoClassCache?.delete(grade);
}
