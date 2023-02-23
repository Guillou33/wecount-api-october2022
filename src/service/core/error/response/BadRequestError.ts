import { ResponseError } from '@deep/responseError/ResponseError';

export default class BadRequestError extends ResponseError {
  statusCode = 400;

  constructor() {
    super('Bad Request error');

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: 'Not found'
      }
    ];
  }
}
