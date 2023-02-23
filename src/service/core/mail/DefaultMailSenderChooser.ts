import config from "config";
import SendInBlueSender from '@service/core/mail/senders/SendInBlueSender';
import MailSenderInterface from '@service/core/mail/MailSenderInterface';

enum AvailableMailerSender {
  SENDINBLUE_SENDER = 'sendinblue'
};

const DEFAULT_MAILER_SENDER = AvailableMailerSender.SENDINBLUE_SENDER;

const mailConfig: {
  defaultMailSender?: AvailableMailerSender;
} = config.get('mail');

export default class DefaultMailSenderChooser {
  static chooseDefault(): MailSenderInterface  {
    const defaultMailerSender: AvailableMailerSender = mailConfig.defaultMailSender ?? DEFAULT_MAILER_SENDER;
    switch (defaultMailerSender) {
      case AvailableMailerSender.SENDINBLUE_SENDER:
        return new SendInBlueSender();
        break;
    
      default:
        throw new Error("No Mailer sender found");
        break;
    }
  }
}