export type Audience = 'learner' | 'guardian' | 'teacher';

/** One message to one person from the contact directory. */
export interface OutboundMessage {
  audience: Audience;
  /** Learner id the message is about, or `class` for the teacher summary. */
  subjectId: string;
  /** Address taken from the contact directory — never from model output. */
  to: string;
  subject: string;
  body: string;
}

/** Where finished work leaves the system. Implementations: in-memory now, email in S2-01. */
export interface Outbox {
  deliver(message: OutboundMessage): Promise<void>;
}
