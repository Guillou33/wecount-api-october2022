import { ResponseError } from '@deep/responseError/ResponseError';

export default class RequestFiedError extends ResponseError {
  statusCode = 400;

  constructor(public errors: { message: string; field?: string }[]) {
    super('Fields error');

    Object.setPrototypeOf(this, RequestFiedError.prototype);
  }

  serializeErrors() {
    return this.errors;
  }
}
