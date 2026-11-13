import type { ALLOWED_TYPES } from './FileRepository';

type AllowedType = (typeof ALLOWED_TYPES)[number];

const SIGNATURES: Record<AllowedType, (bytes: Uint8Array) => boolean> = {
  'application/pdf': (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  'image/png': (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/webp': (b) =>
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45,
};

/** The file's own first bytes must agree with the type it claims, so a renamed file is refused. */
export function matchesSignature(type: string, bytes: Uint8Array): type is AllowedType {
  const check = SIGNATURES[type as AllowedType] as ((b: Uint8Array) => boolean) | undefined;
  return check ? check(bytes) : false;
}

/** Keeps a readable name without paths or odd characters. */
export const safeFileName = (name: string): string =>
  name
    .replace(/[^\w .()-]+/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 120) || 'upload';
