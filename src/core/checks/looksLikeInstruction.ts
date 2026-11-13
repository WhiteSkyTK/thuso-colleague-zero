/** Phrases that try to steer the system rather than describe the learner. */
const INSTRUCTION_PATTERNS: readonly RegExp[] = [
  /\bignore\b[^.]{0,30}\b(rules|instructions|prompt)\b/i,
  /\bdisregard\b[^.]{0,30}\b(rules|instructions)\b/i,
  /\bmark me as\b/i,
  /\byou are now\b/i,
  /\bsystem prompt\b/i,
  /\bdo not (send|tell|message|email)\b/i,
];

/**
 * True when learner-written text reads like an instruction to the system.
 * Such text is still only data: it is withheld from the model and flagged.
 */
export function looksLikeInstruction(text: string): boolean {
  return INSTRUCTION_PATTERNS.some((pattern) => pattern.test(text));
}
