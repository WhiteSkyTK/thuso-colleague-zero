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
import { FileRepository } from '@/core/school/FileRepository';
import { MessageRepository } from '@/core/school/MessageRepository';
import { NoteRepository } from '@/core/school/NoteRepository';
import { PracticeRepository } from '@/core/school/PracticeRepository';
import { NotificationRepository } from '@/core/school/NotificationRepository';
import { PastPaperRepository } from '@/core/school/PastPaperRepository';
import { RunRepository } from '@/core/school/RunRepository';
import { SchoolDataRepository } from '@/core/school/SchoolDataRepository';
import { SubjectChoiceRepository } from '@/core/school/SubjectChoiceRepository';
import { UserRepository } from '@/core/school/UserRepository';
import { SEED_VERSION, seedSchool, seededVersion } from '@/core/seed/seedSchool';

export interface School {
  db: Database;
  data: SchoolDataRepository;
  users: UserRepository;
  messages: MessageRepository;
  runs: RunRepository;
  notifications: NotificationRepository;
  papers: PastPaperRepository;
  choices: SubjectChoiceRepository;
  files: FileRepository;
  practice: PracticeRepository;
  notes: NoteRepository;
  riskThreshold: number;
  delivery: AppConfig['delivery'];
  /** Only when SMTP is configured. */
  transport?: MailTransport;
}

const holder = globalThis as typeof globalThis & {
  thusoSchool?: Promise<School>;
  thusoClassCache?: Map<number, { version: number; data: Promise<ClassData> }>;
};

async function open(): Promise<School> {
  const config = loadConfig();
  const { databaseUrl, demoPassword, adminPassword } = config.school;
  const db = databaseUrl ? new NeonDatabase(databaseUrl) : await PgliteDatabase.create();
  await migrate(db);
  // Empty: seed the demo school. Older seed: top it up (existing rows, marks and changes are kept).
  if ((await seededVersion(db)) < SEED_VERSION) {
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
    papers: new PastPaperRepository(db),
    choices: new SubjectChoiceRepository(db),
    files: new FileRepository(db),
    practice: new PracticeRepository(db),
    notes: new NoteRepository(db),
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

/** The class for one grade, shared by every page and agent run until any server changes it. */
export async function classFor(grade: number): Promise<ClassData> {
  const cache = (holder.thusoClassCache ??= new Map());
  const { data } = await school();
  // One tiny query: reuse this server's copy only while nobody has changed the grade's data.
  const version = await data.version(grade);
  const cached = cache.get(grade);
  if (cached?.version === version) {
    return cached.data;
  }
  const loading = data.loadClass(grade);
  cache.set(grade, { version, data: loading });
  loading.catch(() => cache.delete(grade));
  return loading;
}

/** Call after any write so the next read sees it. */
export function forgetClass(grade: number): void {
  holder.thusoClassCache?.delete(grade);
}
