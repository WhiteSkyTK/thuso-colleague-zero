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
  /** A calendar invite (.ics) for the booked support session, when there is one. */
  invite?: string;
}

/** Where finished work leaves the system: memory (tests), the database (portal inbox) and email. */
export interface Outbox {
  deliver(message: OutboundMessage): Promise<void>;
}
