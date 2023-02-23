import { ValidationError } from 'express-validator';
import { ResponseError } from '@deep/responseError/ResponseError';

export default class ExpressRequestValidationError extends ResponseError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super('Invalid request parameters');

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ExpressRequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map(err => {
      return { message: err.msg, field: err.param };
    });
  }
}
