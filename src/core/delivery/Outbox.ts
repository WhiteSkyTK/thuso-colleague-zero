export type Audience = 'learner' | 'guardian' | 'teacher';

/** A message addressed by role and pseudonymous id; the outbox resolves the real address. */
export interface OutboundMessage {
  audience: Audience;
  /** Learner id the message is about, or `class` for the teacher summary. */
  subjectId: string;
  subject: string;
  body: string;
}

/** Where finished work leaves the system. Implementations: in-memory now, email in S2-01. */
export interface Outbox {
  deliver(message: OutboundMessage): Promise<void>;
}
