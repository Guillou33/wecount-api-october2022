import MailData from '@service/core/mail/MailData';

export default interface MailSender {
  send(mailData: MailData): Promise<void>;
}