import { createTransport, type Transporter } from 'nodemailer';
import type { Mail, MailTransport } from './MailTransport';

export interface SmtpSettings {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
}

const SECURE_PORT = 465;
const INVITE_FILE = 'support-session.ics';

/** Sends through any SMTP server (Gmail app password, Brevo, Mailtrap, the school's server). */
export class SmtpTransport implements MailTransport {
  private readonly transporter: Transporter;

  constructor(private readonly settings: SmtpSettings) {
    this.transporter = createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.port === SECURE_PORT,
      auth: settings.user ? { user: settings.user, pass: settings.pass } : undefined,
    });
  }

  async send(mail: Mail): Promise<void> {
    await this.transporter.sendMail({
      from: this.settings.from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      ...(mail.invite
        ? { icalEvent: { filename: INVITE_FILE, method: 'REQUEST', content: mail.invite } }
        : {}),
    });
  }
}
