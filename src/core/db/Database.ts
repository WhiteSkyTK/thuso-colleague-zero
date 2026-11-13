export interface Statement {
  readonly text: string;
  readonly params?: readonly unknown[];
}

/**
 * The only thing the repositories know about storage: parameterised SQL. Neon (hosted) and
 * PGlite (in-process, for tests and offline demos) both implement it.
 */
export interface Database {
  query<T>(text: string, params?: readonly unknown[]): Promise<T[]>;
  /** Runs every statement in one transaction: all of them commit, or none do. */
  batch(statements: readonly Statement[]): Promise<void>;
}
