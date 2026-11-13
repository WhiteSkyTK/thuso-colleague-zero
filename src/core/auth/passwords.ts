import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const PREFIX = 'scrypt';
const KEY_LENGTH = 64;
/** scrypt work factor (N): ~50 ms per hash on a laptop — slow for attackers, fine for a login. */
const COST = 16_384;
const SALT_BYTES = 16;
const TOKEN_BYTES = 32;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N: COST }, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });
}

/** `scrypt$<salt>$<key>` — Node's built-in scrypt, so no extra dependency. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(password, salt);
  return `${PREFIX}$${salt.toString('base64')}$${key.toString('base64')}`;
}

/** Constant-time comparison; an unknown or malformed hash never matches. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [prefix, salt, key] = stored.split('$');
  if (prefix !== PREFIX || !salt || !key) {
    return false;
  }
  const expected = Buffer.from(key, 'base64');
  const actual = await derive(password, Buffer.from(salt, 'base64'));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** The browser keeps the token; the database keeps only its SHA-256, so a leaked table is useless. */
export const newSessionToken = (): string => randomBytes(TOKEN_BYTES).toString('base64url');

export const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
