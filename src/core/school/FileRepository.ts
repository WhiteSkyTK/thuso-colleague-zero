import type { Database } from '../db/Database';

/** Files people may upload: papers, memos and photos of working. */
export const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'] as const;
/** Fits comfortably under the hosting platform's request limit. */
export const MAX_FILE_BYTES = 3 * 1024 * 1024;

export interface StoredFile {
  name: string;
  contentType: string;
  data: Buffer;
}

/** Small school files kept in Postgres (no extra storage service to run for the demo). */
export class FileRepository {
  constructor(private readonly db: Database) {}

  async save(file: {
    id: string;
    ownerId: string;
    name: string;
    contentType: string;
    data: Buffer;
  }): Promise<void> {
    await this.db.query(
      `INSERT INTO files (id, owner_id, name, content_type, size, data_base64) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        file.id,
        file.ownerId,
        file.name,
        file.contentType,
        file.data.length,
        file.data.toString('base64'),
      ],
    );
  }

  async get(id: string): Promise<StoredFile | undefined> {
    const [row] = await this.db.query<{ name: string; content_type: string; data_base64: string }>(
      'SELECT name, content_type, data_base64 FROM files WHERE id = $1',
      [id],
    );
    return row
      ? {
          name: row.name,
          contentType: row.content_type,
          data: Buffer.from(row.data_base64, 'base64'),
        }
      : undefined;
  }
}
