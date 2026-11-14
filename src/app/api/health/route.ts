import { loadConfig } from '@/core/config/env';
import { configuredChatModels } from '@/lib/chatModels';
import { school } from '@/lib/school';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DB_TIMEOUT_MS = 5_000;

async function databaseIsUp(): Promise<boolean> {
  try {
    const check = school().then(({ db }) => db.query('SELECT 1 AS ok'));
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), DB_TIMEOUT_MS),
    );
    await Promise.race([check, timeout]);
    return true;
  } catch {
    return false;
  }
}

/** GET /api/health — is the school up? Database, agent mode and chat models; no secrets. */
export async function GET(): Promise<Response> {
  const isDatabaseUp = await databaseIsUp();
  const chatModels = configuredChatModels();
  const body = {
    status: isDatabaseUp ? 'ok' : 'degraded',
    database: isDatabaseUp ? 'up' : 'down',
    agents: loadConfig().llm.provider === 'mock' ? 'scripted (offline-safe)' : 'live model',
    chatModels,
    chatFallback: 'built-in answers if every model fails',
    checkedAt: new Date().toISOString(),
  };
  return Response.json(body, { status: isDatabaseUp ? 200 : 503 });
}
