import MailSenderInterface from '@service/core/mail/MailSenderInterface';
import MailData from '@service/core/mail/MailData';
import mailjetConnector from 'node-mailjet';
import config from "config";

const mailjetConfig: {
  apiKey: string;
  apiSecretKey: string;
} = config.get('mail.senders.mailjet');

const mailjet = mailjetConnector.connect(mailjetConfig.apiKey, mailjetConfig.apiSecretKey, {
  version: 'v3.1',
  perform_api_call: true
});

export default class MailjetSender implements MailSenderInterface {
  async send(mailData: MailData): Promise<void> {
    const tos = mailData.to.map((singleTo) => {
      return {
        'Email': singleTo
      };
    });
    const bccs = mailData.bcc.map((singleBcc) => {
      return {
        'Email': singleBcc
      };
    });
    const ccs = mailData.cc.map((singleCc) => {
      return {
        'Email': singleCc
      };
    });
 
    const mailjetData = {
        'From': {
          'Email': mailData.fromEmail,
          'Name': mailData.fromName
        },
        'To': tos,
        'Cs': ccs,
        'Bcc': bccs,
        'Recipients': tos,
        'Subject': mailData.subject,
        'HTMLPart': mailData.html,
        'ReplyTo': mailData.replyTo
    };

    
    try {
      const result = await mailjet
        .post('send')
        .request({
          "Messages": [mailjetData]
        });
      console.log(result.body);
    } catch (error) {
      console.log('Mailjet send error. Status code : ', error.statusCode);
      throw error;
    }
  }
}