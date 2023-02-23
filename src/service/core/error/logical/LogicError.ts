export default class LogicError {
  constructor(public errorName: string) {
  }
}

export enum ErrorMessages {
  USER_EMAIL_ALREADY_IN_DATABASE = 'USER_EMAIL_ALREADY_IN_DATABASE',
  USER_INVALID_PASSWORD = 'USER_INVALID_PASSWORD',
}
