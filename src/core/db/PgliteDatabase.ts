import type { PGlite } from '@electric-sql/pglite';
import type { Database, Statement } from './Database';

/** Postgres compiled to WebAssembly, in memory: tests and offline demos use the same SQL as Neon. */
export class PgliteDatabase implements Database {
  private constructor(private readonly db: PGlite) {}

  /** Loaded lazily so a hosted app with DATABASE_URL never pulls PGlite in. */
  static async create(): Promise<PgliteDatabase> {
    const { PGlite: Engine } = await import('@electric-sql/pglite');
    return new PgliteDatabase(await Engine.create());
  }

  async query<T>(text: string, params: readonly unknown[] = []): Promise<T[]> {
    const result = await this.db.query<T>(text, [...params]);
    return result.rows;
  }

  async batch(statements: readonly Statement[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      for (const { text, params = [] } of statements) {
        await tx.query(text, [...params]);
      }
    });
  }
}
