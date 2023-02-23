declare module "sib-api-v3-sdk" {
  export default class SibApiV3Sdk {
    static ApiClient: {
      static instance: any;
    };
    static TransactionalEmailsApi: any;
    static SendSmtpEmail: any;
  }
}
