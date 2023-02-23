import MailData from '@service/core/mail/MailData';
import DefaultMailSenderChooser from '@service/core/mail/DefaultMailSenderChooser';
import MailSenderInterface from '@service/core/mail/MailSenderInterface';
import config from "config";

const mailConfig: {
  defaultFromEmail: string;
  defaultFromName?: string;
} = config.get('mail');

export default class Mail {
  private mailData: MailData;
  mailSender: MailSenderInterface;

  static buildDefault() {
    const mailData = new MailData();
    mailData.fromEmail = mailConfig.defaultFromEmail;
    mailData.fromName = mailConfig.defaultFromName;

    return new Mail(DefaultMailSenderChooser.chooseDefault(), mailData);
  }

  constructor(mailSender: MailSenderInterface, mailData?: MailData) {
    this.mailData = mailData ?? new MailData();
    this.mailSender = mailSender;
  }

  async send(): Promise<void> {
    await this.mailSender.send(this.mailData);
  }

  setFromEmail(fromEmail: string): Mail {
    this.mailData.fromEmail = fromEmail;
    return this;
  }
  setFromName(fromName: string): Mail {
    this.mailData.fromName = fromName;
    return this;
  }
  setSubject(subject: string): Mail {
    this.mailData.subject = subject;
    return this;
  }
  setHtml(html: string): Mail {
    this.mailData.html = html;
    return this;
  }
  addTo(to: string): Mail {
    this.mailData.to.push(to);
    return this;
  }
  addCc(cc: string): Mail {
    this.mailData.cc.push(cc);
    return this;
  }
  addBcc(bcc: string): Mail {
    this.mailData.bcc.push(bcc);
    return this;
  }
  setReplyTo(replyTo: string): Mail {
    this.mailData.replyTo = replyTo;
    return this;
  }
}