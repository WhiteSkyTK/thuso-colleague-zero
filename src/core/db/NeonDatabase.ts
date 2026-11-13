import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { Database, Statement } from './Database';

/**
 * Neon serverless Postgres over HTTP: no connection pool to manage, which suits Vercel
 * functions. A batch is one HTTP round trip and one transaction.
 */
export class NeonDatabase implements Database {
  private readonly sql: NeonQueryFunction<false, false>;

  constructor(connectionString: string) {
    this.sql = neon(connectionString);
  }

  async query<T>(text: string, params: readonly unknown[] = []): Promise<T[]> {
    const rows = await this.sql.query(text, [...params]);
    return rows as T[];
  }

  async batch(statements: readonly Statement[]): Promise<void> {
    if (statements.length === 0) {
      return;
    }
    await this.sql.transaction(
      statements.map(({ text, params = [] }) => this.sql.query(text, [...params])),
    );
  }
}
