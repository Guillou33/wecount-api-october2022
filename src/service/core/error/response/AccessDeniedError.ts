import { ResponseError } from '@deep/responseError/ResponseError';

export default class AccessDeniedError extends ResponseError {
  statusCode = 403;

  constructor() {
    super('Access Denied');

    Object.setPrototypeOf(this, AccessDeniedError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: 'Access Denied'
      }
    ];
  }
}
