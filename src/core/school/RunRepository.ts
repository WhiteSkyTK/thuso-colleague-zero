import { z } from 'zod';
import type { Database } from '../db/Database';
import { AgentEventSchema, type AgentEvent } from '../domain/agentEvent';
import type { RunSummary } from '../domain/runSummary';

export interface RunStart {
  id: string;
  grade: number;
  goal: string;
  startedBy?: string;
  provider: string;
}

/** One row of the history: what was asked, what came out, and how long it took. */
export interface RunRecord {
  id: string;
  grade: number;
  goal: string;
  startedBy: string | null;
  provider: string | null;
  startedAt: string;
  status: 'running' | 'completed' | 'stopped' | 'failed';
  delivered: number;
  fixes: number;
  flags: number;
  escalations: number;
  humanInterventions: number;
  durationMs: number;
}

const FIELDS = `id, grade, goal, started_by AS "startedBy", provider,
  to_char(started_at AT TIME ZONE 'Africa/Johannesburg', 'YYYY-MM-DD HH24:MI') AS "startedAt",
  status, delivered, fixes, flags, escalations, human_interventions AS "humanInterventions",
  duration_ms AS "durationMs"`;

const EventsSchema = z.array(AgentEventSchema);

/** Every run, kept for the history page and for replay (insurance against venue Wi-Fi). */
export class RunRepository {
  constructor(private readonly db: Database) {}

  async start(run: RunStart): Promise<void> {
    await this.db.query(
      'INSERT INTO runs (id, grade, goal, started_by, provider) VALUES ($1, $2, $3, $4, $5)',
      [run.id, run.grade, run.goal, run.startedBy ?? null, run.provider],
    );
  }

  async finish(id: string, summary: RunSummary, events: readonly AgentEvent[]): Promise<void> {
    await this.db.query(
      `UPDATE runs SET finished_at = now(), status = $2, delivered = $3, fixes = $4, flags = $5,
         escalations = $6, human_interventions = $7, duration_ms = $8, events = $9::jsonb
       WHERE id = $1`,
      [
        id,
        summary.status,
        summary.itemsDelivered,
        summary.fixes,
        events.filter((event) => event.level === 'FLAG').length,
        summary.escalations.length,
        summary.humanInterventions,
        Math.round(summary.durationMs),
        JSON.stringify(events),
      ],
    );
  }

  async fail(id: string): Promise<void> {
    await this.db.query(`UPDATE runs SET finished_at = now(), status = 'failed' WHERE id = $1`, [
      id,
    ]);
  }

  list(limit: number): Promise<RunRecord[]> {
    return this.db.query(`SELECT ${FIELDS} FROM runs ORDER BY started_at DESC LIMIT $1`, [limit]);
  }

  async find(id: string): Promise<{ run: RunRecord; events: AgentEvent[] } | undefined> {
    const [row] = await this.db.query<RunRecord & { events: unknown }>(
      `SELECT ${FIELDS}, events FROM runs WHERE id = $1`,
      [id],
    );
    if (!row) {
      return undefined;
    }
    const { events, ...run } = row;
    // Stored events are validated again before the screen replays them.
    const parsed = EventsSchema.safeParse(typeof events === 'string' ? JSON.parse(events) : events);
    return { run, events: parsed.success ? parsed.data : [] };
  }
}
