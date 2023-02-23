import { ResponseError } from '@deep/responseError/ResponseError';

export default class CustomError extends ResponseError {
  statusCode: number;
  customMessage: string;

  constructor({ statusCode, message }: { statusCode: number, message: string }) {
    super('Error');

    Object.setPrototypeOf(this, CustomError.prototype);

    this.statusCode = statusCode;
    this.customMessage = message;
  }

  serializeErrors() {
    return [
      {
        message: this.customMessage
      }
    ];
  }
}
