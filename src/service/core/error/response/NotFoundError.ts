import { ResponseError } from '@deep/responseError/ResponseError';

export default class NotFoundError extends ResponseError {
  statusCode = 404;

  constructor() {
    super('Not found');

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: 'Not found'
      }
    ];
  }
}
