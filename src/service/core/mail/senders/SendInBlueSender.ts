import MailSenderInterface from '@service/core/mail/MailSenderInterface';
import MailData from '@service/core/mail/MailData';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import config from "config";

const sandboxMode: boolean = config.get('mail.sandboxMode');

export default class SendInBlueSender implements MailSenderInterface {
  send(mailData: MailData): Promise<void> {
    return new Promise((resolve, reject) => {
      const defaultClient = SibApiV3Sdk.ApiClient.instance;

      const apiKey = defaultClient.authentications['api-key'];
      
      if (!sandboxMode && process.env.NODE_ENV !== 'test') {
        const sendInBlueConfig: {
          apiKey: string;
        } = config.get('mail.senders.sendinblue');
        apiKey.apiKey = sendInBlueConfig.apiKey;
      }
  
      const tos = mailData.to.map((singleTo) => {
        return {
          'email': singleTo
        };
      });
      const bccs = mailData.bcc.map((singleBcc) => {
        return {
          'email': singleBcc
        };
      });
      const ccs = mailData.cc.map((singleCc) => {
        return {
          'email': singleCc
        };
      });
  
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  
      sendSmtpEmail.subject = mailData.subject;
      sendSmtpEmail.htmlContent = mailData.html;
      sendSmtpEmail.sender = {"email": mailData.fromEmail};
      if (mailData.fromName) {
        sendSmtpEmail.sender.name = mailData.fromName;
      }
      sendSmtpEmail.to = tos;
      if (ccs.length) {
        sendSmtpEmail.cc = ccs;
      }
      if (bccs.length) {
        sendSmtpEmail.bcc = bccs;
      }
      if (mailData.replyTo) {
        sendSmtpEmail.replyTo = {"email": mailData.replyTo};
      }
  
      if (sandboxMode || process.env.NODE_ENV === 'test') {
        resolve();
        return;
      }
      
      apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data: any) {
        // console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        resolve();
      }, function(error: any) {
        console.error(error);
        reject(error);
      });
    });
  }
}