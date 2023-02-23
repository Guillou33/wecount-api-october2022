import config from "config";
import Mail from "@service/core/mail/Mail";

const adminEmails: string[] = config.get('adminEmails');

export const logAdmin = async (subject: string, messageHtml: string) => {
  const mail = Mail.buildDefault();

  if (!adminEmails.length) {
    return;
  }

  adminEmails.forEach((email: string) => {
    mail.addTo(email);
  });

  await mail
    .setSubject(`[Log Admin] ${subject}`)
    .setHtml(messageHtml)
    .send();
}
