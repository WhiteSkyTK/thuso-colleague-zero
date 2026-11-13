/** One email as the transport sends it. */
export interface Mail {
  to: string;
  subject: string;
  text: string;
  /** Sent as a real calendar invite (Outlook, Gmail and phones show Accept / Decline). */
  invite?: string;
}

/** Strategy: how an email actually leaves (SMTP today; any provider later). */
export interface MailTransport {
  send(mail: Mail): Promise<void>;
}
