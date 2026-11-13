import type { Statement } from './Database';

/** Column name → Postgres type, e.g. { id: 'text', topics: 'text[]' }. Names are trusted constants. */
export type Columns = Readonly<Record<string, string>>;

/** A table name, or a table plus what to do when a row already exists. */
export type InsertTarget = string | { readonly table: string; readonly onConflict: string };

const SKIP_EXISTING = 'ON CONFLICT DO NOTHING';

/**
 * Bulk insert in one statement: every row travels as one JSON parameter and Postgres unpacks it
 * with jsonb_to_recordset. One round trip per table, however many rows — and no SQL injection,
 * because the data is never part of the SQL text.
 */
export function insertRows(
  target: InsertTarget,
  columns: Columns,
  rows: readonly Record<string, unknown>[],
): Statement {
  const { table, onConflict } =
    typeof target === 'string' ? { table: target, onConflict: SKIP_EXISTING } : target;
  const names = Object.keys(columns).join(', ');
  const definitions = Object.entries(columns)
    .map(([name, type]) => `${name} ${type}`)
    .join(', ');
  return {
    text: `INSERT INTO ${table} (${names}) SELECT ${names} FROM jsonb_to_recordset($1::jsonb) AS r(${definitions}) ${onConflict}`,
    params: [JSON.stringify(rows)],
  };
}
