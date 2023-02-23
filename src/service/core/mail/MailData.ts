export default class MailData {
  fromEmail: string;
  fromName?: string;
  subject?: string;
  html: string;
  to: string[] = [];
  cc: string[] = [];
  bcc: string[] = [];
  replyTo?: string;
}